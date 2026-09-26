import { describe, expect, it } from "vitest";
import AddProblemPage from "@/app/c/[cid]/add-problem/page";
import ProblemForm from "@/app/c/[cid]/add-problem/problem-form";
import prisma from "@/lib/prisma";
import {
  createCollection,
  createPermission,
  createProblem,
  createUser,
} from "../factories";
import { expectNotFound, expectRedirect } from "../navigation";
import { signInAs, signOut } from "../session";
import { clientPayload } from "./client-payload";

function render(cid: string, searchParams: { submitted?: string } = {}) {
  return AddProblemPage({
    params: Promise.resolve({ cid }),
    searchParams: Promise.resolve(searchParams),
  });
}

/** The props the page hands the form. */
async function formProps(cid: string, searchParams: { submitted?: string }) {
  const payload = (await clientPayload(
    await render(cid, searchParams),
    new Set<unknown>([ProblemForm]),
  )) as { props: Record<string, unknown> };
  return payload.props;
}

describe("add-problem page", () => {
  it("sends a signed-out visitor to sign in, returning here afterwards", async () => {
    const collection = await createCollection();
    signOut();

    await expectRedirect(
      render(collection.cid),
      `/login?callbackUrl=%2Fc%2F${collection.cid}%2Fadd-problem`,
    );
  });

  it("404s for an unknown collection", async () => {
    signInAs(await createUser());
    await expectNotFound(render("nope"));
  });

  it("redirects a ViewOnly member without creating an author", async () => {
    const collection = await createCollection();
    const user = await createUser();
    await createPermission(user, collection, "ViewOnly");
    signInAs(user);

    await expectRedirect(render(collection.cid), "/need-permission");
    expect(await prisma.author.count()).toBe(0);
  });

  it("redirects a user with no permission row without creating an author", async () => {
    const collection = await createCollection();
    signInAs(await createUser());

    await expectRedirect(render(collection.cid), "/need-permission");
    expect(await prisma.author.count()).toBe(0);
  });

  it.each(["Admin", "TeamMember", "SubmitOnly"] as const)(
    "renders the form for a %s member without creating an author",
    async (level) => {
      const collection = await createCollection();
      const user = await createUser({ name: "Ada Lovelace" });
      await createPermission(user, collection, level);
      signInAs(user);

      const page = await render(collection.cid);

      expect(page).toBeTruthy();
      // The page is prefetched from the collection page: viewing it must
      // leave no trace. The author is created on the first submission.
      expect(await prisma.author.count()).toBe(0);
    },
  );

  it("confirms a SubmitOnly member's own submission, with no link to the collection", async () => {
    const collection = await createCollection();
    const user = await createUser();
    await createPermission(user, collection, "SubmitOnly");
    await createProblem(collection, {
      pid: "G4",
      title: "My problem",
      submitterId: user.id,
    });
    signInAs(user);

    expect(await formProps(collection.cid, { submitted: "G4" })).toMatchObject({
      canViewCollection: false,
      submission: { pid: "G4", title: "My problem" },
    });
  });

  it("confirms nothing for a problem someone else submitted", async () => {
    const collection = await createCollection();
    const other = await createUser();
    await createProblem(collection, { pid: "G4", submitterId: other.id });
    const user = await createUser();
    await createPermission(user, collection, "TeamMember");
    signInAs(user);

    expect(await formProps(collection.cid, { submitted: "G4" })).toMatchObject({
      canViewCollection: true,
      submission: null,
    });
  });
});
