import { AccessLevel, Prisma } from '@prisma/client'
import type { Session } from 'next-auth'

const collectionPerm = Prisma.validator<Prisma.CollectionArgs>()({
  select: {
    id: true,
  }
});
type CollectionPerm = Prisma.CollectionGetPayload<typeof collectionPerm>;

const authorPerm = Prisma.validator<Prisma.AuthorArgs>()({
  select: {
    id: true,
  }
});
type AuthorPerm = Prisma.AuthorGetPayload<typeof authorPerm>;

const permissionPerm = Prisma.validator<Prisma.PermissionArgs>()({
  select: {
    accessLevel: true,
  }
});
type PermissionPerm = Prisma.PermissionGetPayload<typeof permissionPerm>;

const problemPerm = Prisma.validator<Prisma.ProblemArgs>()({
  select: {
    authors: {
      select: { id: true }
    }
  }
});
type ProblemPerm = Prisma.ProblemGetPayload<typeof problemPerm>;

const solutionPerm = Prisma.validator<Prisma.SolutionArgs>()({
  select: {
    authors: {
      select: { id: true }
    }
  }
});
type SolutionPerm = Prisma.SolutionGetPayload<typeof solutionPerm>;



export function isAdmin(session: Session, collection: CollectionPerm) {
  const id = collection.id;
  return session.collectionPerms.some(perm => (perm.colId === id && perm.isAdmin));
}

export function canAddProblem(
  permission: PermissionPerm | null
): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  return role === "Admin" || role === "TeamMember" || role === "SubmitOnly";
}

export function canAddSolution(
  permission: PermissionPerm | null
): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  return role === "Admin" || role === "TeamMember";
}

// TODO: for SubmitOnly, check if they are the author
// TODO: canViewProblem should be identical
export function canAddComment(
  permission: PermissionPerm | null
): boolean {
  if (permission === null) {
    return false;
  }
  const role = permission.accessLevel;
  return role === "Admin" || role === "TeamMember" || role === "SubmitOnly" || role === "ViewOnly";
}
export function canViewCollection(
  permission: PermissionPerm | null
): boolean {
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
    const authorIds1 = authors.map(author => author.id);
    const authorIds2 = problem.authors.map(author => author.id);
    return authorIds1?.some(id => authorIds2?.includes(id));
  }
  return false;
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
    const authorIds1 = authors.map(author => author.id);
    const authorIds2 = solution.authors.map(author => author.id);
    return authorIds1?.some(id => authorIds2?.includes(id));
  }
  return false;
}
