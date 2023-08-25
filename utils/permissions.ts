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
  accessLevel: AccessLevel
): boolean {
  return accessLevel === "Admin" || accessLevel === "TeamMember" || accessLevel === "SubmitOnly";
}

export function canViewCollection(
  accessLevel: AccessLevel,
): boolean {
  return accessLevel === "Admin" || accessLevel === "TeamMember" || accessLevel === "ViewOnly";
}

export function canEditCollection(
  session: Session | null,
  collection: CollectionPerm,
): boolean {
  if (session === null) {
    return false;
  }
  return session.collectionPerms.some(perm => (perm.colId === collection.id));
}

// TODO: when is session null?
// read next-auth docs to figure out
export function canEditProblem(
  session: Session | null,
  problem: ProblemPerm,
  collection: CollectionPerm,
): boolean {
  if (session === null) {
    return false;
  }
  if (isAdmin(session, collection)) {
    return true;
  }
  if (!canEditCollection(session, collection)) {
    return false;
  }

  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = problem.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

export function canEditProblem2(
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
  session: Session | null,
  solution: SolutionPerm,
  collection: CollectionPerm,
): boolean {
  if (session === null) {
    return false;
  }
  if (isAdmin(session, collection)) {
    return true;
  }
  if (!canEditCollection(session, collection)) {
    return false;
  }

  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = solution.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

