import type { AccessLevel, TestsolverType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { isProblemLocked, needsTestsolveToView } from "@/lib/permissions";

const collectionStart = new Date("2024-01-01T00:00:00Z");
const beforeStart = new Date("2023-12-01T00:00:00Z");
const afterStart = new Date("2024-06-01T00:00:00Z");

const testsolving = {
  requireTestsolve: true,
  answerFormat: "Integer" as const,
};
const noTestsolving = {
  requireTestsolve: false,
  answerFormat: "Integer" as const,
};

function problem(createdAt: Date, authorIds: number[] = [1]) {
  return { createdAt, authors: authorIds.map((id) => ({ id })) };
}

function permission(
  accessLevel: AccessLevel,
  testsolverType: TestsolverType | null,
  seriousTestsolverStartedAt: Date | null = collectionStart,
) {
  return { accessLevel, testsolverType, seriousTestsolverStartedAt };
}

const seriousMember = permission("TeamMember", "Serious");
const casualMember = permission("TeamMember", "Casual");
const notMyProblem = problem(afterStart, [1]);
const myAuthors = [{ id: 1 }];
const otherAuthors = [{ id: 2 }];

describe("needsTestsolveToView", () => {
  it("is true for a serious testsolver on someone else's newer problem", () => {
    expect(
      needsTestsolveToView(
        testsolving,
        notMyProblem,
        seriousMember,
        otherAuthors,
      ),
    ).toBe(true);
  });

  it("is false when the collection does not require testsolving", () => {
    expect(
      needsTestsolveToView(
        noTestsolving,
        notMyProblem,
        seriousMember,
        otherAuthors,
      ),
    ).toBe(false);
  });

  it("is false for a casual testsolver", () => {
    expect(
      needsTestsolveToView(
        testsolving,
        notMyProblem,
        casualMember,
        otherAuthors,
      ),
    ).toBe(false);
  });

  it("is false for a member who has not chosen a type or has no start date", () => {
    expect(
      needsTestsolveToView(
        testsolving,
        notMyProblem,
        permission("TeamMember", null, null),
        otherAuthors,
      ),
    ).toBe(false);
    expect(
      needsTestsolveToView(
        testsolving,
        notMyProblem,
        permission("TeamMember", "Serious", null),
        otherAuthors,
      ),
    ).toBe(false);
  });

  it("is false for problems created before the serious period began", () => {
    expect(
      needsTestsolveToView(
        testsolving,
        problem(beforeStart),
        seriousMember,
        otherAuthors,
      ),
    ).toBe(false);
  });

  it("is false for the problem's own author", () => {
    expect(
      needsTestsolveToView(testsolving, notMyProblem, seriousMember, myAuthors),
    ).toBe(false);
  });

  it("is false for an admin, who can edit every problem", () => {
    expect(
      needsTestsolveToView(
        testsolving,
        notMyProblem,
        permission("Admin", "Serious"),
        otherAuthors,
      ),
    ).toBe(false);
  });

  it("applies to ViewOnly serious testsolvers too", () => {
    expect(
      needsTestsolveToView(
        testsolving,
        notMyProblem,
        permission("ViewOnly", "Serious"),
        myAuthors,
      ),
    ).toBe(true);
  });
});

describe("isProblemLocked", () => {
  it("locks until the testsolve is started", () => {
    expect(
      isProblemLocked(
        testsolving,
        notMyProblem,
        seriousMember,
        otherAuthors,
        false,
      ),
    ).toBe(true);
    expect(
      isProblemLocked(
        testsolving,
        notMyProblem,
        seriousMember,
        otherAuthors,
        true,
      ),
    ).toBe(false);
  });

  it("never locks when testsolving is not needed", () => {
    expect(
      isProblemLocked(
        testsolving,
        notMyProblem,
        casualMember,
        otherAuthors,
        false,
      ),
    ).toBe(false);
  });
});

describe("which answer formats lock problems", () => {
  it.each(["Integer", "AIME"] as const)(
    "locks in a testsolving %s collection",
    (answerFormat) => {
      expect(
        needsTestsolveToView(
          { requireTestsolve: true, answerFormat },
          notMyProblem,
          seriousMember,
          otherAuthors,
        ),
      ).toBe(true);
    },
  );

  it.each(["ShortAnswer", "Proof"] as const)(
    "never locks in a %s collection, whose answers a timed attempt cannot check",
    (answerFormat) => {
      expect(
        needsTestsolveToView(
          { requireTestsolve: true, answerFormat },
          notMyProblem,
          seriousMember,
          otherAuthors,
        ),
      ).toBe(false);
    },
  );
});
