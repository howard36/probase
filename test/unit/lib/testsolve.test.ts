import { describe, expect, it } from "vitest";
import {
  answerFormatError,
  hasTimedTestsolving,
  testsolveDeadline,
  testsolveTimeMinutes,
} from "@/lib/testsolve";

describe("testsolveTimeMinutes", () => {
  it("gives 10 to 30 minutes for difficulties 1 to 5", () => {
    expect([1, 2, 3, 4, 5].map(testsolveTimeMinutes)).toEqual([
      10, 15, 20, 25, 30,
    ]);
  });

  it("gives the longest limit to a problem with no difficulty", () => {
    expect(testsolveTimeMinutes(null)).toBe(30);
    expect(testsolveTimeMinutes(0)).toBe(30);
  });
});

describe("testsolveDeadline", () => {
  it("adds the time limit to the start time", () => {
    const startedAt = new Date("2024-01-01T12:00:00Z");
    expect(testsolveDeadline(startedAt, 3)).toEqual(
      new Date("2024-01-01T12:20:00Z"),
    );
  });
});

describe("hasTimedTestsolving", () => {
  it("applies to Integer and AIME collections that require testsolving", () => {
    expect(
      hasTimedTestsolving({ requireTestsolve: true, answerFormat: "Integer" }),
    ).toBe(true);
    expect(
      hasTimedTestsolving({ requireTestsolve: true, answerFormat: "AIME" }),
    ).toBe(true);
  });

  it("does not apply without the setting, or to ShortAnswer and Proof", () => {
    expect(
      hasTimedTestsolving({ requireTestsolve: false, answerFormat: "Integer" }),
    ).toBe(false);
    expect(
      hasTimedTestsolving({
        requireTestsolve: true,
        answerFormat: "ShortAnswer",
      }),
    ).toBe(false);
    expect(
      hasTimedTestsolving({ requireTestsolve: true, answerFormat: "Proof" }),
    ).toBe(false);
  });
});

describe("answerFormatError", () => {
  it("allows an empty answer in every format", () => {
    for (const format of ["Integer", "AIME", "ShortAnswer", "Proof"] as const) {
      expect(answerFormatError("", format)).toBeNull();
    }
  });

  it("takes whole numbers in an Integer collection", () => {
    for (const answer of ["0", "42", "-7", "123456"]) {
      expect(answerFormatError(answer, "Integer")).toBeNull();
    }
    for (const answer of ["$42$", "4.2", "-", "042", " 42", "1e3"]) {
      expect(answerFormatError(answer, "Integer")).toBe(
        "The answer must be a whole number, like 42 or -7.",
      );
    }
  });

  it("takes 0 to 999 in an AIME collection", () => {
    for (const answer of ["0", "7", "042", "999"]) {
      expect(answerFormatError(answer, "AIME")).toBeNull();
    }
    for (const answer of ["1000", "-1", "$7$", "7a"]) {
      expect(answerFormatError(answer, "AIME")).toBe(
        "The answer must be a whole number from 0 to 999.",
      );
    }
  });

  it("takes anything in ShortAnswer and Proof collections", () => {
    expect(answerFormatError("$\\sqrt{2}$", "ShortAnswer")).toBeNull();
    expect(answerFormatError("anything", "Proof")).toBeNull();
  });
});
