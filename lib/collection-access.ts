import type { Collection, Permission, Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { canViewCollection } from "@/lib/permissions";
import { hasTimedTestsolving } from "@/lib/testsolve";
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

/**
 * The Author this user writes under in the collection, created and named
 * after them the first time they submit something. It is created only on a
 * submission, never on a page view, so that viewing leaves no trace. Runs in
 * `tx`, locking the user's permission row so that two submissions at once
 * create one author.
 */
export async function getOrCreateAuthorId(
  tx: Prisma.TransactionClient,
  user: CurrentUser,
  collectionId: number,
): Promise<number> {
  await tx.$queryRaw`SELECT 1 FROM "Permission" WHERE "userId" = ${user.userId} AND "collectionId" = ${collectionId} FOR UPDATE`;
  const existing = await tx.author.findFirst({
    where: { userId: user.userId, collectionId },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  if (existing !== null) {
    return existing.id;
  }
  const created = await tx.author.create({
    data: { displayName: user.name, userId: user.userId, collectionId },
    select: { id: true },
  });
  return created.id;
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
 *  - redirect to the testsolver-type chooser if the collection has timed
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
    hasTimedTestsolving(collection) &&
    permission.testsolverType === null
  ) {
    redirect(`/c/${cid}/choose-testsolver-type`);
  }

  const authors = await getAuthorIds(user.userId, collection.id);

  return { ...user, collection, permission, authors };
}
