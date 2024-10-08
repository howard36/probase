"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ActionResponse, error } from "@/lib/server-actions";
import { auth } from "auth";

export async function acceptInvite(
  inviteCode: string,
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

  const email = session.currentEmail;
  if (email === null || email === undefined) {
    return error("session.email is null or undefined");
  }

  const invite = await prisma.invite.findUnique({
    where: { code: inviteCode },
    include: { collection: true },
  });

  if (!invite) {
    return error("Invalid invite code");
  }

  if (invite.expiresAt !== null) {
    return error("Invite has expired");
  }

  if (
    invite.emailDomain !== null &&
    !email.endsWith("@" + invite.emailDomain)
  ) {
    return error("Invalid email domain");
  }

  await prisma.permission.upsert({
    where: {
      userId_collectionId: {
        userId,
        collectionId: invite.collectionId,
      },
    },
    update: {
      accessLevel: invite.accessLevel,
    },
    create: {
      userId,
      collectionId: invite.collectionId,
      accessLevel: invite.accessLevel,
    },
  });

  if (invite.oneTimeUse) {
    await prisma.invite.update({
      where: { code: inviteCode },
      data: {
        expiresAt: new Date(),
      },
    });
  }

  redirect(`/c/${invite.collection.cid}`);
}
