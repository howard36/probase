import { needsTestsolveToView } from "@/lib/permissions";
import { testsolveDeadline, testsolveTimeMinutes } from "@/lib/testsolve";
import type { Props } from "./types";

/**
 * What this user may see of the problem right now. Decided on the server so
 * that a locked problem's statement, answer, solutions, comments and other
 * users' attempts never reach the browser.
 */
export type ProblemView =
  | { kind: "locked"; timeMinutes: number; unsolved: boolean }
  | { kind: "testsolving"; deadline: Date }
  | { kind: "unlocked" };

export function problemView(props: Props): ProblemView {
  const { problem, collection, permission, userId, authors } = props;
  if (!needsTestsolveToView(collection, problem, permission, authors)) {
    return { kind: "unlocked" };
  }

  const difficulty = problem.difficulty;
  if (difficulty === null || difficulty === 0) {
    throw new Error(
      "Difficulty is null or zero, cannot determine testsolve time",
    );
  }

  const solveAttempt = problem.solveAttempts.find(
    (attempt) => attempt.userId === userId,
  );
  if (solveAttempt === undefined) {
    return {
      kind: "locked",
      timeMinutes: testsolveTimeMinutes(difficulty),
      unsolved: problem.solveAttempts.every(
        (attempt) => attempt.solvedAt === null,
      ),
    };
  }

  const deadline = testsolveDeadline(solveAttempt.startedAt, difficulty);
  const finished =
    new Date() >= deadline ||
    solveAttempt.gaveUp ||
    solveAttempt.solvedAt !== null;
  return finished ? { kind: "unlocked" } : { kind: "testsolving", deadline };
}
