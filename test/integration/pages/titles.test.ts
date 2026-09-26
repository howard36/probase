import { describe, expect, it } from "vitest";
import { generateMetadata as addProblemTitle } from "@/app/c/[cid]/add-problem/page";
import { generateMetadata as collectionTitle } from "@/app/c/[cid]/page";
import { generateMetadata as problemTitle } from "@/app/c/[cid]/p/[pid]/page";
import { generateMetadata as testTitle } from "@/app/c/[cid]/t/[testSlug]/page";
import { generateMetadata as inviteTitle } from "@/app/invite/[code]/page";
import prisma from "@/lib/prisma";
import {
  createCollection,
  createInvite,
  createPermission,
  createProblem,
  createUser,
} from "../factories";
import { expectNotFound, expectRedirect } from "../navigation";
import { signInAs, signOut } from "../session";

async function member() {
  const collection = await createCollection({ name: "Probase Demo" });
  const user = await createUser();
  await createPermission(user, collection, "TeamMember");
  signInAs(user);
  return collection;
}

describe("page titles", () => {
  it("name the collection, the problem, the test and the form", async () => {
    const collection = await member();
    const problem = await createProblem(collection, {
      pid: "A1",
      title: "Sum of squares",
    });
    const test = await prisma.test.create({
      data: {
        name: "Mock AIME",
        collectionId: collection.id,
        testProblems: { create: { problemId: problem.id, position: 1 } },
      },
    });
    const cid = collection.cid;

    expect(await collectionTitle({ params: Promise.resolve({ cid }) })).toEqual(
      { title: "Probase Demo" },
    );
    expect(
      await problemTitle({ params: Promise.resolve({ cid, pid: "A1" }) }),
    ).toEqual({ title: "A1. Sum of squares · Probase Demo" });
    expect(
      await testTitle({
        params: Promise.resolve({ cid, testSlug: `mock-aime-${test.id}` }),
      }),
    ).toEqual({ title: "Mock AIME · Probase Demo" });
    expect(await addProblemTitle({ params: Promise.resolve({ cid }) })).toEqual(
      { title: "Add a problem · Probase Demo" },
    );
  });

  it("name the collection an invite joins, even when signed out", async () => {
    const collection = await createCollection({ name: "Probase Demo" });
    const invite = await createInvite(collection, await createUser());
    signOut();

    expect(
      await inviteTitle({ params: Promise.resolve({ code: invite.code }) }),
    ).toEqual({ title: "Join Probase Demo" });
  });

  it("need the same access as their pages", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    signInAs(await createUser());
    const cid = collection.cid;

    await expectRedirect(
      problemTitle({ params: Promise.resolve({ cid, pid: problem.pid }) }),
      "/need-permission",
    );
    await expectRedirect(
      collectionTitle({ params: Promise.resolve({ cid }) }),
      "/need-permission",
    );
    await expectRedirect(
      addProblemTitle({ params: Promise.resolve({ cid }) }),
      "/need-permission",
    );
    await expectNotFound(
      problemTitle({ params: Promise.resolve({ cid: "nope", pid: "A1" }) }),
    );
  });
});
