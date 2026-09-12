import { describe, expect, it } from "vitest";
import Page from "@/app/c/[cid]/p/[pid]/page";
import AddSolution from "@/app/c/[cid]/p/[pid]/add-solution";
import ArchiveToggle from "@/app/c/[cid]/p/[pid]/archive-toggle";
import Comments from "@/app/c/[cid]/p/[pid]/comments";
import CountdownTimer from "@/app/c/[cid]/p/[pid]/countdown-timer";
import EditableAnswer from "@/app/c/[cid]/p/[pid]/editable-answer";
import EditableSolution from "@/app/c/[cid]/p/[pid]/editable-solution";
import EditableStatement from "@/app/c/[cid]/p/[pid]/editable-statement";
import EditableTitle from "@/app/c/[cid]/p/[pid]/editable-title";
import LockedPage from "@/app/c/[cid]/p/[pid]/locked-page";
import Spoilers from "@/app/c/[cid]/p/[pid]/spoilers";
import Testsolve from "@/app/c/[cid]/p/[pid]/testsolve";
import BackButton from "@/components/back-button";
import Latex from "@/components/latex";
import Likes from "@/components/likes";
import prisma from "@/lib/prisma";
import {
  createCollection,
  createPermission,
  createProblem,
  createSolution,
  createUser,
} from "../factories";
import { signInAs } from "../session";
import { clientPayload } from "./client-payload";

// Every component under the problem page with a "use client" directive.
// Their props are what Next.js serializes into the RSC payload.
const clientComponents = new Set<unknown>([
  AddSolution,
  ArchiveToggle,
  Comments,
  CountdownTimer,
  EditableAnswer,
  EditableSolution,
  EditableStatement,
  EditableTitle,
  LockedPage,
  Spoilers,
  Testsolve,
  BackButton,
  Latex,
  Likes,
]);

const SECRETS = {
  statement: "STATEMENT-SECRET",
  answer: "ANSWER-SECRET",
  solution: "SOLUTION-SECRET",
  comment: "COMMENT-SECRET",
  otherUser: "OTHER-USER-SECRET",
};

/** A testsolving collection with one problem written by someone else, and a serious testsolver signed in. */
async function setup() {
  const collection = await createCollection({ requireTestsolve: true });
  const author = await createUser({ name: SECRETS.otherUser });
  const problem = await createProblem(collection, {
    title: "Visible title",
    statement: SECRETS.statement,
    answer: SECRETS.answer,
    difficulty: 2,
  });
  await createSolution(problem, { text: SECRETS.solution });
  await prisma.comment.create({
    data: { problemId: problem.id, userId: author.id, text: SECRETS.comment },
  });
  // Someone else has already solved it, so the leaderboard has an entry.
  await prisma.solveAttempt.create({
    data: {
      userId: author.id,
      problemId: problem.id,
      solvedAt: new Date(),
      numSubmissions: 1,
    },
  });

  const testsolver = await createUser();
  await createPermission(testsolver, collection, "TeamMember", {
    testsolverType: "Serious",
    seriousTestsolverStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  });
  signInAs(testsolver);
  return { collection, problem, testsolver };
}

async function payloadFor(cid: string, pid: string): Promise<string> {
  const page = await Page({
    params: Promise.resolve({ cid, pid }),
    searchParams: Promise.resolve({}),
  });
  return JSON.stringify(await clientPayload(page, clientComponents));
}

describe("problem page client payload", () => {
  it("sends nothing but the title before a serious testsolver starts", async () => {
    const { collection, problem } = await setup();

    const payload = await payloadFor(collection.cid, problem.pid);

    expect(payload).toContain("Visible title");
    // The locked island gets only what it renders: the id, the time limit,
    // and whether anyone has solved it yet.
    expect(payload).toContain(
      JSON.stringify({
        $: "LockedPage",
        props: { problemId: problem.id, time: "15 minutes", unsolved: false },
      }),
    );
    for (const secret of Object.values(SECRETS)) {
      expect(payload).not.toContain(secret);
    }
  });

  it("sends the statement but no answer, solution, comments or names while testsolving", async () => {
    const { collection, problem, testsolver } = await setup();
    await prisma.solveAttempt.create({
      data: { userId: testsolver.id, problemId: problem.id },
    });

    const payload = await payloadFor(collection.cid, problem.pid);

    expect(payload).toContain(SECRETS.statement);
    expect(payload).toContain('"$":"Testsolve"');
    for (const secret of [
      SECRETS.answer,
      SECRETS.solution,
      SECRETS.comment,
      SECRETS.otherUser,
    ]) {
      expect(payload).not.toContain(secret);
    }
  });

  it("sends everything once the testsolve is finished", async () => {
    const { collection, problem, testsolver } = await setup();
    await prisma.solveAttempt.create({
      data: { userId: testsolver.id, problemId: problem.id, gaveUp: true },
    });

    const payload = await payloadFor(collection.cid, problem.pid);

    for (const secret of Object.values(SECRETS)) {
      expect(payload).toContain(secret);
    }
  });

  it("sends everything to a casual testsolver straight away", async () => {
    const { collection, problem, testsolver } = await setup();
    await prisma.permission.update({
      where: {
        userId_collectionId: {
          userId: testsolver.id,
          collectionId: collection.id,
        },
      },
      data: { testsolverType: "Casual" },
    });

    const payload = await payloadFor(collection.cid, problem.pid);

    for (const secret of Object.values(SECRETS)) {
      expect(payload).toContain(secret);
    }
  });
});
