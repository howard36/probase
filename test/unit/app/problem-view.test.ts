import { describe, expect, it } from "vitest";
import { problemView } from "@/app/c/[cid]/p/[pid]/view";
import type { Props } from "@/app/c/[cid]/p/[pid]/types";

const now = Date.now();
const MINUTE = 60_000;

function props(overrides: {
  requireTestsolve?: boolean;
  testsolverType?: "Serious" | "Casual" | null;
  difficulty?: number | null;
  attempts?: Props["problem"]["solveAttempts"];
}): Props {
  const {
    requireTestsolve = true,
    testsolverType = "Serious",
    difficulty = 2,
    attempts = [],
  } = overrides;
  return {
    userId: "me",
    collection: { requireTestsolve } as Props["collection"],
    permission: {
      accessLevel: "TeamMember",
      testsolverType,
      seriousTestsolverStartedAt: new Date(now - 10 * MINUTE),
    },
    authors: [],
    problem: {
      id: 1,
      createdAt: new Date(now - 5 * MINUTE),
      difficulty,
      authors: [{ id: 99, displayName: "Someone else" }],
      solveAttempts: attempts,
    } as unknown as Props["problem"],
  };
}

function attempt(
  overrides: Partial<Props["problem"]["solveAttempts"][number]> = {},
): Props["problem"]["solveAttempts"][number] {
  return {
    userId: "me",
    problemId: 1,
    startedAt: new Date(now - 1 * MINUTE),
    solvedAt: null,
    numSubmissions: 0,
    gaveUp: false,
    user: { name: "Me" },
    ...overrides,
  };
}

describe("problemView", () => {
  it("is unlocked when the user does not need to testsolve", () => {
    expect(problemView(props({ testsolverType: "Casual" }))).toEqual({
      kind: "unlocked",
    });
    expect(problemView(props({ requireTestsolve: false }))).toEqual({
      kind: "unlocked",
    });
  });

  it("is locked, with the time limit, before an attempt exists", () => {
    expect(problemView(props({ difficulty: 3 }))).toEqual({
      kind: "locked",
      timeMinutes: 20,
      unsolved: true,
    });
  });

  it("reports whether anyone else has solved it while locked", () => {
    const solvedByOther = attempt({
      userId: "other",
      solvedAt: new Date(),
      user: { name: "Other" },
    });
    expect(problemView(props({ attempts: [solvedByOther] }))).toMatchObject({
      kind: "locked",
      unsolved: false,
    });
  });

  it("is testsolving, with the deadline, during an attempt", () => {
    const startedAt = new Date(now - 1 * MINUTE);
    expect(
      problemView(props({ difficulty: 1, attempts: [attempt({ startedAt })] })),
    ).toEqual({
      kind: "testsolving",
      deadline: new Date(startedAt.getTime() + 10 * MINUTE),
    });
  });

  it("is unlocked once the attempt is solved, given up, or out of time", () => {
    expect(
      problemView(props({ attempts: [attempt({ solvedAt: new Date() })] })),
    ).toEqual({ kind: "unlocked" });
    expect(
      problemView(props({ attempts: [attempt({ gaveUp: true })] })),
    ).toEqual({ kind: "unlocked" });
    expect(
      problemView(
        props({
          difficulty: 1,
          attempts: [attempt({ startedAt: new Date(now - 11 * MINUTE) })],
        }),
      ),
    ).toEqual({ kind: "unlocked" });
  });

  it("throws for a locked problem with no difficulty, which has no time limit", () => {
    expect(() => problemView(props({ difficulty: null }))).toThrow(
      "Difficulty is null or zero",
    );
  });
});
