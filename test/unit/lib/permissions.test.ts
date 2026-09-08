import type { AccessLevel } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  canAddComment,
  canAddProblem,
  canAddSolution,
  canEditProblem,
  canEditSolution,
  canViewCollection,
  hasJoinedCollection,
  isAdmin,
} from "@/lib/permissions";

const allLevels: AccessLevel[] = [
  "Admin",
  "TeamMember",
  "ViewOnly",
  "SubmitOnly",
];

function perm(accessLevel: AccessLevel) {
  return { accessLevel };
}

// One row per access level, so a change to any role's rights shows up as a diff here.
describe("role-only checks", () => {
  const table: {
    name: string;
    fn: (p: { accessLevel: AccessLevel } | null) => boolean;
    allowed: AccessLevel[];
  }[] = [
    { name: "isAdmin", fn: isAdmin, allowed: ["Admin"] },
    {
      name: "canAddProblem",
      fn: canAddProblem,
      allowed: ["Admin", "TeamMember", "SubmitOnly"],
    },
    {
      name: "canAddSolution",
      fn: canAddSolution,
      allowed: ["Admin", "TeamMember"],
    },
    {
      name: "canAddComment",
      fn: canAddComment,
      allowed: ["Admin", "TeamMember", "SubmitOnly", "ViewOnly"],
    },
    {
      name: "canViewCollection",
      fn: canViewCollection,
      allowed: ["Admin", "TeamMember", "ViewOnly"],
    },
    {
      name: "hasJoinedCollection",
      fn: hasJoinedCollection,
      allowed: ["Admin", "TeamMember"],
    },
  ];

  describe.each(table)("$name", ({ fn, allowed }) => {
    it("denies when there is no permission row", () => {
      expect(fn(null)).toBe(false);
    });

    it.each(allLevels)("%s", (level) => {
      expect(fn(perm(level))).toBe(allowed.includes(level));
    });
  });
});

describe("canEditProblem", () => {
  const problem = { authors: [{ id: 1 }, { id: 2 }] };
  const matchingAuthors = [{ id: 2 }];
  const otherAuthors = [{ id: 3 }];

  it("denies when there is no permission row, even for an author", () => {
    expect(canEditProblem(problem, null, matchingAuthors)).toBe(false);
  });

  it("lets an Admin edit any problem", () => {
    expect(canEditProblem(problem, perm("Admin"), otherAuthors)).toBe(true);
    expect(canEditProblem(problem, perm("Admin"), [])).toBe(true);
  });

  it.each<AccessLevel>(["TeamMember", "SubmitOnly"])(
    "lets a %s edit only problems they authored",
    (level) => {
      expect(canEditProblem(problem, perm(level), matchingAuthors)).toBe(true);
      expect(canEditProblem(problem, perm(level), otherAuthors)).toBe(false);
      expect(canEditProblem(problem, perm(level), [])).toBe(false);
    },
  );

  it("never lets a ViewOnly user edit, even their own problem", () => {
    expect(canEditProblem(problem, perm("ViewOnly"), matchingAuthors)).toBe(
      false,
    );
  });

  it("denies when the problem has no authors", () => {
    const orphan = { authors: [] };
    expect(canEditProblem(orphan, perm("TeamMember"), matchingAuthors)).toBe(
      false,
    );
  });
});

describe("canEditSolution", () => {
  const solution = { authors: [{ id: 7 }] };
  const matchingAuthors = [{ id: 7 }, { id: 8 }];
  const otherAuthors = [{ id: 9 }];

  it("denies when there is no permission row", () => {
    expect(canEditSolution(solution, null, matchingAuthors)).toBe(false);
  });

  it("lets an Admin edit any solution", () => {
    expect(canEditSolution(solution, perm("Admin"), otherAuthors)).toBe(true);
  });

  it.each<AccessLevel>(["TeamMember", "SubmitOnly"])(
    "lets a %s edit only solutions they authored",
    (level) => {
      expect(canEditSolution(solution, perm(level), matchingAuthors)).toBe(
        true,
      );
      expect(canEditSolution(solution, perm(level), otherAuthors)).toBe(false);
    },
  );

  it("never lets a ViewOnly user edit", () => {
    expect(canEditSolution(solution, perm("ViewOnly"), matchingAuthors)).toBe(
      false,
    );
  });
});
