import { describe, expect, it } from "vitest";
import {
  SIDEBAR_COLLECTIONS,
  difficultyLabels,
  forcedTestsolverType,
} from "@/lib/collection-config";

describe("collection config", () => {
  it("forces serious testsolving only for the configured collections", () => {
    expect(forcedTestsolverType("topsoj")).toBe("Serious");
    expect(forcedTestsolverType("mgci")).toBe("Serious");
    expect(forcedTestsolverType("cmimc")).toBeNull();
    expect(forcedTestsolverType("topsoj-2")).toBeNull();
  });

  it("gives five difficulty labels for every collection", () => {
    expect(difficultyLabels("otis-mock-aime")).toEqual([
      "AIME 1-3",
      "AIME 4-6",
      "AIME 7-9",
      "AIME 10-12",
      "AIME 13-15",
    ]);
    expect(difficultyLabels("anything-else")).toEqual([
      "Very easy",
      "Easy",
      "Medium",
      "Hard",
      "Very hard",
    ]);
  });

  it("lists sidebar collections with distinct slugs", () => {
    const cids = SIDEBAR_COLLECTIONS.map((c) => c.cid);
    expect(new Set(cids).size).toBe(cids.length);
    expect(cids).toEqual(["cmimc", "otis-mock-aime", "topsoj"]);
  });
});
