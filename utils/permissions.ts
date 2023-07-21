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
    authors: {
      select: { id: true }
    },
    collection: {
      select: { id: true }
    },
  }
});
type ProblemPerm = Prisma.ProblemGetPayload<typeof problemPerm>;

const solutionPerm = Prisma.validator<Prisma.SolutionArgs>()({
  select: {
    authors: {
      select: { id: true }
    },
    problem: {
      select: {
        collection: {
          select: { id: true }
        }
      }
    },
  }
});
type SolutionPerm = Prisma.SolutionGetPayload<typeof solutionPerm>;



function isCollectionAdmin(session: Session, collection: CollectionPerm) {
  const id = collection.id;
  return session.collectionPerms.some(perm => (perm.colId === id && perm.isAdmin));
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

  const collection = problem.collection;
  if (isCollectionAdmin(session, collection)) {
    return true;
  }

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
): boolean {
  if (session === null) {
    return false;
  }

  const collection = solution.problem.collection;
  if (isCollectionAdmin(session, collection)) {
    return true;
  }

  if (!canEditCollection(session, collection)) {
    return false;
  }

  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = solution.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

