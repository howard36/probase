"use server";

import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ActionResponse, error } from "@/lib/server-actions";
import { getCurrentUser } from "@/lib/current-user";
import { getPermission } from "@/lib/collection-access";
import { TestsolverType } from "@prisma/client";

export async function setTestsolverType(
  collectionId: number,
  testsolverType: TestsolverType,
): Promise<ActionResponse> {
  // TODO: zod

  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });
  if (collection === null) {
    notFound();
  }

  const permission = await getPermission(userId, collectionId);

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
