import { authOptions } from "@/api/auth/[...nextauth]";
import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { CollectionProps, ProblemProps, SolutionProps } from "./types";
import { canEditProblem2, canEditSolution2 } from "@/utils/permissions";

export async function promiseCanEditProblem(
  problem: ProblemProps,
  collection: CollectionProps,
): Promise<boolean> {
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

export async function promiseCanEditSolution(
  solution: SolutionProps,
  collection: CollectionProps,
): Promise<boolean> {
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
  return canEditSolution2(solution, permission, authors);
}
