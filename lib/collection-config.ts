// Per-collection settings that live in code for now. Everything that special-
// cases a collection slug belongs here, so adding or retiring a collection is
// a change to this one file.

import type { TestsolverType } from "@prisma/client";

/** Collections listed in the sidebar, in display order. */
export const SIDEBAR_COLLECTIONS: { cid: string; name: string }[] = [
  { cid: "cmimc", name: "CMIMC" },
  { cid: "otis-mock-aime", name: "OTIS Mock AIME" },
  { cid: "topsoj", name: "TopsOJ" },
];

/**
 * Collections whose new members are always serious testsolvers, with their
 * serious period dated from the collection's creation so every problem is
 * hidden until testsolved.
 */
const FORCED_SERIOUS_TESTSOLVING = new Set(["topsoj", "mgci"]);

export function forcedTestsolverType(cid: string): TestsolverType | null {
  return FORCED_SERIOUS_TESTSOLVING.has(cid) ? "Serious" : null;
}

const DEFAULT_DIFFICULTY_LABELS = [
  "Very easy",
  "Easy",
  "Medium",
  "Hard",
  "Very hard",
];

/** Labels for difficulty 1 through 5 on the submission form. */
const DIFFICULTY_LABELS: Record<string, string[]> = {
  "otis-mock-aime": [
    "AIME 1-3",
    "AIME 4-6",
    "AIME 7-9",
    "AIME 10-12",
    "AIME 13-15",
  ],
};

export function difficultyLabels(cid: string): string[] {
  return DIFFICULTY_LABELS[cid] ?? DEFAULT_DIFFICULTY_LABELS;
}
