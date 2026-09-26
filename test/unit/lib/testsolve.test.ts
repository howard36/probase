import { describe, expect, it } from "vitest";
import { testsolveDeadline, testsolveTimeMinutes } from "@/lib/testsolve";

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
