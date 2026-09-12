import { Prisma, type TestsolverType } from "@prisma/client";

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

/**
 * Whether the user is a full member. Used by the invite flow: members do not
 * need an invite, and accepting one must never lower their access.
 */
export function hasJoinedCollection(
  permission: PermissionPerm | null,
): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  return role === "Admin" || role === "TeamMember";
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

/**
 * Whether this user must testsolve the problem before they can read it.
 * True only for serious testsolvers in collections that require testsolving,
 * for problems created after their serious period began, and never for
 * someone who can edit the problem (authors and admins do not testsolve
 * their own problems).
 */
export function needsTestsolveToView(
  collection: { requireTestsolve: boolean },
  problem: TestsolveProblem,
  permission: TestsolvePermission,
  authors: AuthorPerm[],
): boolean {
  return (
    collection.requireTestsolve &&
    permission.testsolverType !== "Casual" &&
    permission.seriousTestsolverStartedAt !== null &&
    permission.seriousTestsolverStartedAt < problem.createdAt &&
    !canEditProblem(problem, permission, authors)
  );
}

/** A problem is locked until a user who needs to testsolve it starts an attempt. */
export function isProblemLocked(
  collection: { requireTestsolve: boolean },
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
