import { describe, expect, it } from "vitest";
import AddProblemPage from "@/app/c/[cid]/add-problem/page";
import prisma from "@/lib/prisma";
import {
  createAuthor,
  createCollection,
  createPermission,
  createUser,
} from "../factories";
import { expectNotFound, expectRedirect } from "../navigation";
import { signInAs, signOut } from "../session";

function render(cid: string) {
  return AddProblemPage({ params: { cid } });
}

describe("add-problem page", () => {
  it("sends a signed-out visitor to sign in, returning here afterwards", async () => {
    const collection = await createCollection();
    signOut();

    await expectRedirect(
      render(collection.cid),
      `/api/auth/signin?callbackUrl=%2Fc%2F${collection.cid}%2Fadd-problem`,
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
    "renders the form for a %s member, creating their author on first visit",
    async (level) => {
      const collection = await createCollection();
      const user = await createUser({ name: "Ada Lovelace" });
      await createPermission(user, collection, level);
      signInAs(user);

      const page = await render(collection.cid);

      expect(page).toBeTruthy();
      const authors = await prisma.author.findMany({
        where: { userId: user.id, collectionId: collection.id },
      });
      expect(authors).toHaveLength(1);
    },
  );

  it("reuses an existing author instead of creating another", async () => {
    const collection = await createCollection();
    const user = await createUser();
    await createPermission(user, collection, "TeamMember");
    const existing = await createAuthor(collection, { userId: user.id });
    signInAs(user);

    await render(collection.cid);

    const authors = await prisma.author.findMany({
      where: { userId: user.id },
    });
    expect(authors.map((a) => a.id)).toEqual([existing.id]);
  });
});
