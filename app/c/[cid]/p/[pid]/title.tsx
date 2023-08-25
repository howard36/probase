import EditableTitle from './editable-title'
import Latex from '@/components/latex'
import type { CollectionProps, ProblemProps } from './types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/api/auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canEditProblem2 } from '@/utils/permissions'

async function promiseCanEdit(problem: ProblemProps, collection: CollectionProps): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (session === null) {
    return false;
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  // TODO: parallel db requests
  const collectionId = collection.id;
  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId,
      }
    }
  });
  const authors = await prisma.author.findMany({
    where: {
      userId,
      collectionId,
    },
    select: { id: true },
  });
  return canEditProblem2(problem, permission, authors);
}

export default async function Title({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  const canEdit = await promiseCanEdit(problem, collection);

  if (canEdit) {
    return <EditableTitle problem={problem} />;
  } else {
    // TODO: is p needed here?
    return <p><Latex>{`${problem.title}`}</Latex></p>;
  }
}