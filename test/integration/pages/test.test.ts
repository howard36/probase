import { describe, expect, it } from "vitest";
import Page from "@/app/c/[cid]/t/[testSlug]/page";
import BackButton from "@/components/back-button";
import Latex from "@/components/latex";
import prisma from "@/lib/prisma";
import {
  createCollection,
  createPermission,
  createProblem,
  createUser,
} from "../factories";
import { expectNotFound, expectRedirect } from "../navigation";
import { signInAs } from "../session";
import { clientPayload } from "./client-payload";

const clientComponents = new Set<unknown>([BackButton, Latex]);

/** A testsolving collection with a one-problem test written by someone else. */
async function setup() {
  const collection = await createCollection({
    requireTestsolve: true,
    answerFormat: "Integer",
  });
  const problem = await createProblem(collection, {
    title: "Test problem",
    statement: "TEST-STATEMENT-SECRET",
  });
  const test = await prisma.test.create({
    data: {
      name: "Mock AIME",
      collectionId: collection.id,
      testProblems: { create: { problemId: problem.id, position: 1 } },
    },
  });
  return { collection, test };
}

function render(cid: string, testSlug: string) {
  return Page({ params: Promise.resolve({ cid, testSlug }) });
}

async function payloadFor(cid: string, testSlug: string): Promise<string> {
  return JSON.stringify(
    await clientPayload(await render(cid, testSlug), clientComponents),
  );
}

describe("test page", () => {
  it("sends a member who has not chosen a testsolver type to the chooser", async () => {
    const { collection, test } = await setup();
    const member = await createUser();
    await createPermission(member, collection, "TeamMember");
    signInAs(member);

    await expectRedirect(
      render(collection.cid, `mock-aime-${test.id}`),
      `/c/${collection.cid}/choose-testsolver-type`,
    );
  });

  it("locks the statements for a serious testsolver", async () => {
    const { collection, test } = await setup();
    const solver = await createUser();
    await createPermission(solver, collection, "TeamMember", {
      testsolverType: "Serious",
      seriousTestsolverStartedAt: new Date(Date.now() - 60_000),
    });
    signInAs(solver);

    const payload = await payloadFor(collection.cid, `mock-aime-${test.id}`);

    expect(payload).toContain("Mock AIME");
    expect(payload).not.toContain("TEST-STATEMENT-SECRET");
  });

  it("shows the statements to a casual testsolver", async () => {
    const { collection, test } = await setup();
    const solver = await createUser();
    await createPermission(solver, collection, "TeamMember", {
      testsolverType: "Casual",
    });
    signInAs(solver);

    expect(await payloadFor(collection.cid, `anything-${test.id}`)).toContain(
      "TEST-STATEMENT-SECRET",
    );
  });

  it("does not show a test under another collection's address", async () => {
    const { test } = await setup();
    const other = await createCollection();
    const member = await createUser();
    await createPermission(member, other, "TeamMember");
    signInAs(member);

    await expectNotFound(render(other.cid, `mock-aime-${test.id}`));
  });

  it.each(["mock", "mock-", "mock-abc", "mock-1.5", "mock-99999999999"])(
    "shows Page not found for the address %j",
    async (testSlug) => {
      const { collection } = await setup();
      const member = await createUser();
      await createPermission(member, collection, "TeamMember", {
        testsolverType: "Casual",
      });
      signInAs(member);

      await expectNotFound(render(collection.cid, testSlug));
    },
  );
});
