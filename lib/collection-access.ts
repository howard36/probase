import type { Collection, Permission } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { canViewCollection } from "@/lib/permissions";
import { requireCurrentUser, type CurrentUser } from "@/lib/current-user";

export function getPermission(
  userId: string,
  collectionId: number,
): Promise<Permission | null> {
  return prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId,
      },
    },
  });
}

/** The Author rows this user writes under in the collection. Usually zero or one. */
export function getAuthorIds(
  userId: string,
  collectionId: number,
): Promise<{ id: number }[]> {
  return prisma.author.findMany({
    where: {
      userId,
      collectionId,
    },
    select: { id: true },
  });
}

export interface CollectionAccess extends CurrentUser {
  collection: Collection;
  permission: Permission;
  authors: { id: number }[];
}

/**
 * For pages under /c/[cid]. In order:
 *  - 404 if the collection does not exist
 *  - redirect to sign-in (returning to `callbackPath`) if signed out
 *  - redirect to /need-permission if the user cannot view the collection
 *  - redirect to the testsolver-type chooser if the collection requires
 *    testsolving and the user has not picked a type yet (unless
 *    `skipTestsolverTypeCheck`, which the chooser page itself needs)
 */
export async function requireCollectionAccess(
  cid: string,
  callbackPath: string,
  options: { skipTestsolverTypeCheck?: boolean } = {},
): Promise<CollectionAccess> {
  const collection = await prisma.collection.findUnique({
    where: { cid },
  });
  if (collection === null) {
    notFound();
  }

  const user = await requireCurrentUser(callbackPath);

  const permission = await getPermission(user.userId, collection.id);
  if (permission === null || !canViewCollection(permission)) {
    redirect("/need-permission");
  }

  if (
    !options.skipTestsolverTypeCheck &&
    collection.requireTestsolve &&
    permission.testsolverType === null
  ) {
    redirect(`/c/${cid}/choose-testsolver-type`);
  }

  const authors = await getAuthorIds(user.userId, collection.id);

  return { ...user, collection, permission, authors };
}
