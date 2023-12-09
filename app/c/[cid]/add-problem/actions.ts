"use server"

import { canAddProblem } from "@/utils/permissions";
import prisma from "@/utils/prisma";
import { error } from "@/utils/server-actions";
import { Subject } from "@prisma/client";
import { auth } from "auth";
import { revalidateTag } from "next/cache";

export async function addProblem(collectionId: number, formData: FormData) {
  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in")
  }

  const title = formData.get("title") as string;
  const subject = formData.get("subject") as Subject;
  const statement = formData.get("statement") as string;
  const answer = formData.get("answer") as string;
  const solution = formData.get("solution") as string;
  const authorId = formData.get("authorId") as number;
  const difficulty = formData.get("difficulty") as number;
  // TODO: validate input

  try {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (collection === null) {
      return error("Collection not found");
    }

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId,
        },
      },
    });
    if (!canAddProblem(permission)) {
      return error("You do not have permission to add a problem");
    }



    revalidateTag(`collection/${collectionId}/problems`);
    return { ok: true };
  } catch (err) {
    return error(String(err))
  }
}
