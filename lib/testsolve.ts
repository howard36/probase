// Timed-testsolve rules shared by the problem page and the testsolve actions.

/** Extra time the server allows on a submission, to absorb network latency. */
export const BUFFER_TIME_MILLIS = 10_000;
export const SUBMISSION_LIMIT = 5;

/** Difficulty 1-5 gives 10, 15, 20, 25, 30 minutes. */
export function testsolveTimeMinutes(difficulty: number): number {
  return difficulty * 5 + 5;
}

/** When a testsolve that started at `startedAt` ends, before any buffer. */
export function testsolveDeadline(startedAt: Date, difficulty: number): Date {
  return new Date(
    startedAt.getTime() + testsolveTimeMinutes(difficulty) * 60 * 1000,
  );
}
