"use server";

import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ActionResponse, error } from "@/lib/server-actions";
import { auth } from "auth";
import { TestsolverType } from "@prisma/client";

export async function setTestsolverType(
  collectionId: number,
  testsolverType: TestsolverType,
): Promise<ActionResponse> {
  // TODO: zod

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
      testsolverType,
      seriousTestsolverStartedAt: collection.createdAt, // TODO: change this when allowing casual -> serious switch
    },
  });

  redirect(`/c/${collection.cid}`);
}
