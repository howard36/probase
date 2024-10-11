"use server";

import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ActionResponse, error } from "@/lib/server-actions";
import { auth } from "auth";

export async function setTestsolverType(
  collectionId: number,
  formData: FormData,
): Promise<ActionResponse> {
  // TODO: zod
  const testsolveType = formData.get("testsolveType") as "serious" | "casual";

  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in");
  }

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });
  if (collection === null) {
    notFound();
  }

  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId,
      },
    },
  });

  if (permission === null) {
    return error("You do not have access to this collection");
  }

  await prisma.permission.update({
    where: {
      userId_collectionId: {
        userId,
        collectionId,
      },
    },
    data: {
      testsolveLock: testsolveType === "serious",
      testsolveLockStartedAt: collection.createdAt,
    },
  });

  redirect(`/c/${collection.cid}`);
}
