'use server'

import { canAddComment } from "@/utils/permissions";
import prisma from "@/utils/prisma";
import { error } from "@/utils/server-actions";
import { auth } from "auth";
import { revalidateTag } from "next/cache";

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
