import { Prisma } from '@prisma/client'
import type { Session } from 'next-auth'

const collectionPerm = Prisma.validator<Prisma.CollectionArgs>()({
  select: {
    id: true,
  }
});
type CollectionPerm = Prisma.CollectionGetPayload<typeof collectionPerm>;

const problemPerm = Prisma.validator<Prisma.ProblemArgs>()({
  select: {
    collectionId: true,
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



// TODO: change to collection
function isAdmin(session: Session, colId: number) {
  return session.collectionPerms.some(perm => (perm.colId === colId && perm.isAdmin));
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
): boolean {
  if (session === null) {
    return false;
  }

  if (isAdmin(session, problem.collectionId)) {
    return true;
  }

  const collection = { id: problem.collectionId };
  if (!canEditCollection(session, collection)) {
    return false;
  }

  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = problem.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

export function canEditSolution(
  session: Session | null,
  solution: SolutionPerm,
  collectionId: number,
): boolean {
  if (session === null) {
    return false;
  }

  if (isAdmin(session, collectionId)) {
    return true;
  }

  const collection = { id: collectionId };
  if (!canEditCollection(session, collection)) {
    return false;
  }

  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = solution.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

