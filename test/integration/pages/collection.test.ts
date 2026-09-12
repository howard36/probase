import { describe, expect, it } from "vitest";
import Page from "@/app/c/[cid]/page";
import BackButton from "@/components/back-button";
import Latex from "@/components/latex";
import Likes from "@/components/likes";
import { ProblemListFilter } from "@/components/problem-list-filter";
import { ProblemListPagination } from "@/components/problem-list-pagination";
import { ProblemListSearch } from "@/components/problem-list-search";
import prisma from "@/lib/prisma";
import {
  createCollection,
  createPermission,
  createProblem,
  createUser,
} from "../factories";
import { expectRedirect } from "../navigation";
import { signInAs } from "../session";
import { clientPayload } from "./client-payload";

const clientComponents = new Set<unknown>([
  BackButton,
  Latex,
  Likes,
  ProblemListFilter,
  ProblemListPagination,
  ProblemListSearch,
]);

async function payloadFor(
  cid: string,
  searchParams: Record<string, string> = {},
): Promise<string> {
  const page = await Page({
    params: Promise.resolve({ cid }),
    searchParams: Promise.resolve(searchParams),
  });
  return JSON.stringify(await clientPayload(page, clientComponents));
}

describe("collection page", () => {
  it("sends a locked problem's title but not its statement to a serious testsolver", async () => {
    const collection = await createCollection({ requireTestsolve: true });
    await createProblem(collection, {
      title: "Locked title",
      statement: "LOCKED-STATEMENT-SECRET",
    });
    const solver = await createUser();
    await createPermission(solver, collection, "TeamMember", {
      testsolverType: "Serious",
      seriousTestsolverStartedAt: new Date(Date.now() - 60_000),
    });
    signInAs(solver);

    const payload = await payloadFor(collection.cid);

    expect(payload).toContain("Locked title");
    expect(payload).toContain("Testsolve to view");
    expect(payload).not.toContain("LOCKED-STATEMENT-SECRET");
  });

  it("sends statements to a casual testsolver", async () => {
    const collection = await createCollection({ requireTestsolve: true });
    await createProblem(collection, { statement: "VISIBLE-STATEMENT" });
    const solver = await createUser();
    await createPermission(solver, collection, "TeamMember", {
      testsolverType: "Casual",
    });
    signInAs(solver);

    expect(await payloadFor(collection.cid)).toContain("VISIBLE-STATEMENT");
  });

  it("applies the filter on the server, newest first", async () => {
    const collection = await createCollection();
    const older = await createProblem(collection, {
      title: "Older",
      subject: "Geometry",
      createdAt: new Date("2024-01-01"),
    });
    const newer = await createProblem(collection, {
      title: "Newer",
      subject: "Geometry",
      createdAt: new Date("2024-02-01"),
    });
    await createProblem(collection, {
      title: "Algebra one",
      subject: "Algebra",
    });
    await createProblem(collection, { title: "Archived", isArchived: true });
    const member = await createUser();
    await createPermission(member, collection, "TeamMember");
    signInAs(member);

    const all = await payloadFor(collection.cid);
    expect(all.indexOf("Newer")).toBeLessThan(all.indexOf("Older"));
    expect(all).toContain("Algebra one");
    expect(all).not.toContain("Archived");

    const geometry = await payloadFor(collection.cid, { subject: "g" });
    expect(geometry).toContain(newer.title);
    expect(geometry).toContain(older.title);
    expect(geometry).not.toContain("Algebra one");

    const archived = await payloadFor(collection.cid, { archived: "true" });
    expect(archived).toContain("Archived");
    expect(archived).not.toContain("Newer");
  });

  it("redirects a page number past the end to the last page", async () => {
    const collection = await createCollection();
    await createProblem(collection);
    const member = await createUser();
    await createPermission(member, collection, "TeamMember");
    signInAs(member);

    await expectRedirect(
      Page({
        params: Promise.resolve({ cid: collection.cid }),
        searchParams: Promise.resolve({ page: "9" }),
      }),
      `/c/${collection.cid}`,
    );
    expect(await prisma.problem.count()).toBe(1);
  });
});
