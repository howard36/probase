// Timed-testsolve rules shared by the problem page and the testsolve actions.

/** Extra time the server allows on a submission, to absorb network latency. */
export const BUFFER_TIME_MILLIS = 10_000;
export const SUBMISSION_LIMIT = 5;

/** The hardest difficulty on the submission form. */
const MAX_DIFFICULTY = 5;

/**
 * Difficulty 1-5 gives 10, 15, 20, 25, 30 minutes. A problem with no
 * difficulty (null, or 0 from older data) gets the longest limit, so a
 * testsolver is never cut short by a missing rating.
 */
export function testsolveTimeMinutes(difficulty: number | null): number {
  const rated =
    difficulty === null || difficulty < 1 ? MAX_DIFFICULTY : difficulty;
  return rated * 5 + 5;
}

/** When a testsolve that started at `startedAt` ends, before any buffer. */
export function testsolveDeadline(
  startedAt: Date,
  difficulty: number | null,
): Date {
  return new Date(
    startedAt.getTime() + testsolveTimeMinutes(difficulty) * 60 * 1000,
  );
}
