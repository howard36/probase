import {
  Prisma,
  type AccessLevel,
  type AnswerFormat,
  type TestsolverType,
} from "@prisma/client";
import { hasTimedTestsolving } from "@/lib/testsolve";

const authorPerm = Prisma.validator<Prisma.AuthorDefaultArgs>()({
  select: {
    id: true,
  },
});
type AuthorPerm = Prisma.AuthorGetPayload<typeof authorPerm>;

const permissionPerm = Prisma.validator<Prisma.PermissionDefaultArgs>()({
  select: {
    accessLevel: true,
  },
});
type PermissionPerm = Prisma.PermissionGetPayload<typeof permissionPerm>;

const problemPerm = Prisma.validator<Prisma.ProblemDefaultArgs>()({
  select: {
    authors: {
      select: { id: true },
    },
  },
});
type ProblemPerm = Prisma.ProblemGetPayload<typeof problemPerm>;

const solutionPerm = Prisma.validator<Prisma.SolutionDefaultArgs>()({
  select: {
    authors: {
      select: { id: true },
    },
  },
});
type SolutionPerm = Prisma.SolutionGetPayload<typeof solutionPerm>;

// TODO: don't include null, the caller should handle it
export function isAdmin(permission: PermissionPerm | null) {
  if (permission === null) {
    return false;
  }
  return permission.accessLevel === "Admin";
}

export function canAddProblem(permission: PermissionPerm | null): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  return role === "Admin" || role === "TeamMember" || role === "SubmitOnly";
}

export function canAddSolution(permission: PermissionPerm | null): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  return role === "Admin" || role === "TeamMember";
}

// TODO: for SubmitOnly, check if they are the author
// TODO: canViewProblem should be identical
export function canAddComment(permission: PermissionPerm | null): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  return (
    role === "Admin" ||
    role === "TeamMember" ||
    role === "SubmitOnly" ||
    role === "ViewOnly"
  );
}

// How much each role can do. ViewOnly (reading) and SubmitOnly (submitting)
// cannot be compared, so neither counts as raising the other.
const ACCESS_RANK: Record<AccessLevel, number> = {
  Admin: 3,
  TeamMember: 2,
  ViewOnly: 1,
  SubmitOnly: 1,
};

/**
 * Whether accepting an invite for `invited` would raise the user's access.
 * Used by the invite flow: accepting never lowers or sideways-changes
 * access, so an invite that would not raise it counts as already joined.
 */
export function inviteRaisesAccess(
  permission: PermissionPerm | null,
  invited: AccessLevel,
): boolean {
  return (
    permission === null ||
    ACCESS_RANK[invited] > ACCESS_RANK[permission.accessLevel]
  );
}

/**
 * Where a member of a collection starts: its problem list, or the
 * add-problem form for a SubmitOnly member, who cannot view the list.
 */
export function collectionHomePath(cid: string, accessLevel: AccessLevel) {
  return canViewCollection({ accessLevel })
    ? `/c/${cid}`
    : `/c/${cid}/add-problem`;
}

export function canViewCollection(permission: PermissionPerm | null): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  return role === "Admin" || role === "TeamMember" || role === "ViewOnly";
}

export function canEditProblem(
  problem: ProblemPerm,
  permission: PermissionPerm | null,
  authors: AuthorPerm[],
): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  if (role === "Admin") {
    return true;
  }
  if (role === "TeamMember" || role === "SubmitOnly") {
    // check if author matches
    const authorIds1 = authors.map((author) => author.id);
    const authorIds2 = problem.authors.map((author) => author.id);
    return authorIds1?.some((id) => authorIds2?.includes(id));
  }
  return false;
}

interface TestsolvePermission extends PermissionPerm {
  testsolverType: TestsolverType | null;
  seriousTestsolverStartedAt: Date | null;
}

interface TestsolveProblem extends ProblemPerm {
  createdAt: Date;
}

interface TestsolveCollection {
  requireTestsolve: boolean;
  answerFormat: AnswerFormat;
}

/**
 * Whether this user must testsolve the problem before they can read it.
 * True only for serious testsolvers in collections with timed testsolving
 * (see `hasTimedTestsolving`), for problems created after their serious
 * period began, and never for someone who can edit the problem (authors and
 * admins do not testsolve their own problems).
 */
export function needsTestsolveToView(
  collection: TestsolveCollection,
  problem: TestsolveProblem,
  permission: TestsolvePermission,
  authors: AuthorPerm[],
): boolean {
  return (
    hasTimedTestsolving(collection) &&
    permission.testsolverType !== "Casual" &&
    permission.seriousTestsolverStartedAt !== null &&
    permission.seriousTestsolverStartedAt < problem.createdAt &&
    !canEditProblem(problem, permission, authors)
  );
}

/** A problem is locked until a user who needs to testsolve it starts an attempt. */
export function isProblemLocked(
  collection: TestsolveCollection,
  problem: TestsolveProblem,
  permission: TestsolvePermission,
  authors: AuthorPerm[],
  hasStartedTestsolve: boolean,
): boolean {
  return (
    needsTestsolveToView(collection, problem, permission, authors) &&
    !hasStartedTestsolve
  );
}

export function canEditSolution(
  solution: SolutionPerm,
  permission: PermissionPerm | null,
  authors: AuthorPerm[],
): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  if (role === "Admin") {
    return true;
  }
  if (role === "TeamMember" || role === "SubmitOnly") {
    // check if author matches
    const authorIds1 = authors.map((author) => author.id);
    const authorIds2 = solution.authors.map((author) => author.id);
    return authorIds1?.some((id) => authorIds2?.includes(id));
  }
  return false;
}
