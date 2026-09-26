// Timed-testsolve rules shared by the problem page and the testsolve actions.

import type { AnswerFormat } from "@prisma/client";

/**
 * Whether the collection locks problems until they are testsolved. A timed
 * attempt checks a typed answer exactly, which works for integers and AIME
 * answers only, so a ShortAnswer or Proof collection never locks its problems,
 * even if it is set to require testsolving.
 */
export function hasTimedTestsolving(collection: {
  requireTestsolve: boolean;
  answerFormat: AnswerFormat;
}): boolean {
  return (
    collection.requireTestsolve &&
    (collection.answerFormat === "Integer" ||
      collection.answerFormat === "AIME")
  );
}

/**
 * Why `answer` cannot be stored in a collection with this answer format, as a
 * message for the user, or null if it can. An empty answer ("no answer yet")
 * is always allowed. The timed attempt's answer box can only type what passes.
 */
export function answerFormatError(
  answer: string,
  answerFormat: AnswerFormat,
): string | null {
  if (answer === "") {
    return null;
  }
  if (answerFormat === "Integer" && !/^-?(0|[1-9]\d*)$/.test(answer)) {
    return "The answer must be a whole number, like 42 or -7.";
  }
  if (answerFormat === "AIME" && !/^\d{1,3}$/.test(answer)) {
    return "The answer must be a whole number from 0 to 999.";
  }
  return null;
}

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
