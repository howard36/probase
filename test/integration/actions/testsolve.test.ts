import type { AccessLevel } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  giveUpTestsolve,
  startTestsolve,
  submitTestsolve,
} from "@/app/c/[cid]/p/[pid]/actions";
import prisma from "@/lib/prisma";
import { error } from "@/lib/server-actions";
import {
  createCollection,
  createPermission,
  createProblem,
  createUser,
} from "../factories";
import { signInAs, signOut } from "../session";

// Mirrors the constants in app/c/[cid]/p/[pid]/actions.ts.
const SUBMISSION_LIMIT = 5;
const BUFFER_MILLIS = 10_000;
const MINUTE = 60_000;
const SECOND = 1_000;
function timeLimitMillis(difficulty: number): number {
  return (difficulty * 5 + 5) * MINUTE;
}

async function setup({
  accessLevel = "TeamMember",
  difficulty = 1 as number | null,
  answer = "42",
} = {}) {
  const collection = await createCollection({ requireTestsolve: true });
  const problem = await createProblem(collection, { difficulty, answer });
  const user = await createUser();
  await createPermission(user, collection, accessLevel as AccessLevel);
  signInAs(user);
  return { collection, problem, user };
}

/** Rewind an attempt's start time so it began `millisAgo` milliseconds ago. */
async function startedAgo(
  user: { id: string },
  problem: { id: number },
  millisAgo: number,
) {
  await prisma.solveAttempt.update({
    where: { userId_problemId: { userId: user.id, problemId: problem.id } },
    data: { startedAt: new Date(Date.now() - millisAgo) },
  });
}

async function attempt(user: { id: string }, problem: { id: number }) {
  return prisma.solveAttempt.findUniqueOrThrow({
    where: { userId_problemId: { userId: user.id, problemId: problem.id } },
  });
}

describe("startTestsolve", () => {
  it("rejects a signed-out user", async () => {
    signOut();

    expect(await startTestsolve(1)).toEqual(error("Not signed in"));
  });

  it("rejects an unknown problem", async () => {
    signInAs(await createUser());

    expect(await startTestsolve(999)).toEqual(error("Problem not found"));
  });

  it("rejects a user who cannot view the collection", async () => {
    const { problem } = await setup({ accessLevel: "SubmitOnly" });

    expect((await startTestsolve(problem.id)).ok).toBe(false);
    expect(await prisma.solveAttempt.count()).toBe(0);
  });

  it("records a fresh attempt", async () => {
    const { problem, user } = await setup();
    const before = Date.now();

    expect(await startTestsolve(problem.id)).toEqual({ ok: true });

    const row = await attempt(user, problem);
    expect(row).toMatchObject({
      numSubmissions: 0,
      solvedAt: null,
      gaveUp: false,
    });
    expect(row.startedAt.getTime()).toBeGreaterThanOrEqual(before - SECOND);
  });

  it("cannot be started twice for the same user and problem", async () => {
    const { problem, user } = await setup();
    await startTestsolve(problem.id);
    await startedAgo(user, problem, 5 * MINUTE);

    expect((await startTestsolve(problem.id)).ok).toBe(false);
    // The original attempt (and its start time) is untouched.
    const row = await attempt(user, problem);
    expect(Date.now() - row.startedAt.getTime()).toBeGreaterThan(4 * MINUTE);
  });
});

describe("submitTestsolve", () => {
  it("rejects a signed-out user", async () => {
    signOut();

    expect(await submitTestsolve(1, "42")).toEqual(error("Not signed in"));
  });

  it("rejects a submission before the testsolve was started", async () => {
    const { problem } = await setup();

    expect(await submitTestsolve(problem.id, "42")).toEqual(
      error("Tried to submit before starting testsolve"),
    );
  });

  it("rejects a problem with no difficulty, which has no time limit", async () => {
    const { problem } = await setup({ difficulty: null });
    await startTestsolve(problem.id);

    expect(await submitTestsolve(problem.id, "42")).toEqual(
      error("Problem difficulty should not be null"),
    );
  });

  it("marks a correct answer as solved and reports remaining tries", async () => {
    const { problem, user } = await setup({ answer: "42" });
    await startTestsolve(problem.id);

    expect(await submitTestsolve(problem.id, "42")).toEqual({
      ok: true,
      data: { correct: true, remaining: SUBMISSION_LIMIT - 1 },
    });

    const row = await attempt(user, problem);
    expect(row.numSubmissions).toBe(1);
    expect(row.solvedAt).not.toBeNull();
  });

  it("counts a wrong answer without marking it solved", async () => {
    const { problem, user } = await setup({ answer: "42" });
    await startTestsolve(problem.id);

    expect(await submitTestsolve(problem.id, "41")).toEqual({
      ok: true,
      data: { correct: false, remaining: SUBMISSION_LIMIT - 1 },
    });

    const row = await attempt(user, problem);
    expect(row.numSubmissions).toBe(1);
    expect(row.solvedAt).toBeNull();
  });

  it("compares answers as exact strings", async () => {
    const { problem } = await setup({ answer: "42" });
    await startTestsolve(problem.id);

    const resp = await submitTestsolve(problem.id, " 42");
    expect(resp.ok && resp.data.correct).toBe(false);
  });

  it(`allows exactly ${SUBMISSION_LIMIT} submissions`, async () => {
    const { problem } = await setup({ answer: "42" });
    await startTestsolve(problem.id);

    for (let i = 1; i <= SUBMISSION_LIMIT; i++) {
      expect(await submitTestsolve(problem.id, "wrong")).toEqual({
        ok: true,
        data: { correct: false, remaining: SUBMISSION_LIMIT - i },
      });
    }

    expect(await submitTestsolve(problem.id, "42")).toEqual(
      error(`Reached maximum number of submissions (${SUBMISSION_LIMIT})`),
    );
  });

  it("accepts a submission inside the grace buffer after the time limit", async () => {
    const { problem, user } = await setup({ difficulty: 1 });
    await startTestsolve(problem.id);
    await startedAgo(user, problem, timeLimitMillis(1) + BUFFER_MILLIS / 2);

    expect((await submitTestsolve(problem.id, "42")).ok).toBe(true);
  });

  it("rejects a submission once the buffer has also elapsed", async () => {
    const { problem, user } = await setup({ difficulty: 1 });
    await startTestsolve(problem.id);
    await startedAgo(
      user,
      problem,
      timeLimitMillis(1) + BUFFER_MILLIS + SECOND,
    );

    expect(await submitTestsolve(problem.id, "42")).toEqual(
      error("Tried to submit after testsolve finished"),
    );
    expect((await attempt(user, problem)).numSubmissions).toBe(0);
  });

  it("gives harder problems more time (difficulty * 5 + 5 minutes)", async () => {
    const { problem, user } = await setup({ difficulty: 5 });
    await startTestsolve(problem.id);

    // 30-minute limit: 25 minutes in is fine, 31 is not.
    await startedAgo(user, problem, 25 * MINUTE);
    expect((await submitTestsolve(problem.id, "wrong")).ok).toBe(true);

    await startedAgo(user, problem, 31 * MINUTE);
    expect((await submitTestsolve(problem.id, "42")).ok).toBe(false);
  });

  it("rejects a submission after giving up", async () => {
    const { problem } = await setup();
    await startTestsolve(problem.id);
    await giveUpTestsolve(problem.id);

    expect(await submitTestsolve(problem.id, "42")).toEqual(
      error("Tried to submit after testsolve finished"),
    );
  });
});

describe("giveUpTestsolve", () => {
  it("rejects a signed-out user", async () => {
    signOut();

    expect(await giveUpTestsolve(1)).toEqual(error("Not signed in"));
  });

  it("rejects giving up before starting", async () => {
    const { problem } = await setup();

    expect(await giveUpTestsolve(problem.id)).toEqual(
      error("Tried to submit before starting testsolve"),
    );
  });

  it("marks the attempt as given up", async () => {
    const { problem, user } = await setup();
    await startTestsolve(problem.id);

    expect(await giveUpTestsolve(problem.id)).toEqual({ ok: true });
    expect((await attempt(user, problem)).gaveUp).toBe(true);
  });

  it("cannot give up twice", async () => {
    const { problem } = await setup();
    await startTestsolve(problem.id);
    await giveUpTestsolve(problem.id);

    expect(await giveUpTestsolve(problem.id)).toEqual(
      error("Tried to submit after testsolve finished"),
    );
  });

  it("has no grace buffer, unlike submitting", async () => {
    const { problem, user } = await setup({ difficulty: 1 });
    await startTestsolve(problem.id);
    await startedAgo(user, problem, timeLimitMillis(1) + BUFFER_MILLIS / 2);

    expect(await giveUpTestsolve(problem.id)).toEqual(
      error("Tried to submit after testsolve finished"),
    );
  });
});
