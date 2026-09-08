"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ActionResponse, error } from "@/lib/server-actions";
import { getCurrentUser } from "@/lib/current-user";
import { getPermission } from "@/lib/collection-access";
import { hasJoinedCollection } from "@/lib/permissions";
import { isInviteExpired } from "./expiry";

// Thrown inside the transaction when a one-time invite was used up by a
// concurrent accept between our check and our write.
class InviteAlreadyUsed extends Error {}

export async function acceptInvite(
  inviteCode: string,
): Promise<ActionResponse> {
  // TODO: zod
  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  const email = user.session.currentEmail;
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

  // Members already have access; accepting must not lower it or use up the invite.
  const existing = await getPermission(userId, invite.collectionId);
  if (hasJoinedCollection(existing)) {
    redirect(`/c/${invite.collection.cid}`);
  }

  if (isInviteExpired(invite)) {
    return error("Invite has expired");
  }

  if (
    invite.emailDomain !== null &&
    !email.endsWith("@" + invite.emailDomain)
  ) {
    return error("Invalid email domain");
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (invite.oneTimeUse) {
        // Consume the invite first, and only if nobody else has. The row
        // lock makes a concurrent accept wait and then see the used invite.
        const consumed = await tx.invite.updateMany({
          where: { code: inviteCode, expiresAt: null },
          data: { expiresAt: new Date() },
        });
        if (consumed.count === 0) {
          throw new InviteAlreadyUsed();
        }
      }

      await tx.permission.upsert({
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
          // TODO: find a better way to enforce a specific testsolver type
          ...(["topsoj", "mgci"].includes(invite.collection.cid) && {
            testsolverType: "Serious",
            seriousTestsolverStartedAt: invite.collection.createdAt,
          }),
        },
      });
    });
  } catch (err) {
    if (err instanceof InviteAlreadyUsed) {
      return error("Invite has expired");
    }
    throw err;
  }

  redirect(`/c/${invite.collection.cid}`);
}
