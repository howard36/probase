'use server'

import { canAddComment, canEditProblem } from "@/utils/permissions";
import prisma from "@/utils/prisma";
import { error } from "@/utils/server-actions";
import { auth } from "auth";
import { revalidateTag } from "next/cache";

interface Data {
  title?: string;
  statement?: string;
  answer?: string;
  isArchived?: boolean;
}

export async function editProblem(problemId: number, data: Data) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        collection: {
          select: {
            id: true,
            cid: true,
          },
        },
        authors: {
          select: { id: true },
        },
      },
    });
  
    if (problem === null) {
      return error(`No problem with id ${problemId}`);
    }

    if (problem.collection.cid !== "demo") {
      const session = await auth();
      if (session === null) {
        return error("Not signed in");
      }

      const userId = session.userId;
      if (userId === undefined) {
        return error("userId is undefined despite being logged in");
      }

      const collectionId = problem.collection.id;
      const permission = await prisma.permission.findUnique({
        where: {
          userId_collectionId: {
            userId,
            collectionId,
          },
        },
      });
      const authors = await prisma.author.findMany({
        where: {
          userId,
          collectionId,
        },
        select: { id: true },
      });
      if (!canEditProblem(problem, permission, authors)) {
        // No permission
        return error("You do not have permission to edit this problem");
      }
    }

    // TODO: validate input
    const { title, statement, answer, isArchived } = data;

    const updatedProblem = await prisma.problem.update({
      where: { id: problemId },
      data: {
        title,
        statement,
        answer,
        isArchived,
      },
    });

    revalidateTag(`problem/${problem.collection.cid}_${problemId}`);
  } catch (err) {
    return error(String(err));
  }
}

export async function addComment(problemId: number, text: string) {
  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in")
  }

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        pid: true,
        collection: {
          select: {
            id: true,
          },
        },
      },
    });
    if (problem === null) {
      return error("Problem not found");
    }

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: problem.collection.id,
        },
      },
    });
    if (!canAddComment(permission)) {
      return error("You do not have permission to comment on this problem");
    }

    await prisma.comment.create({
      data: {
        text,
        problem: {
          connect: { id: problemId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    revalidateTag(`problem/${problemId}/comments`);
    return { ok: true };
  } catch (err) {
    return error(String(err))
  }
}
