"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ActionResponse, error } from "@/lib/server-actions";
import { getCurrentUser } from "@/lib/current-user";
import { getPermission } from "@/lib/collection-access";
import { collectionHomePath, inviteRaisesAccess } from "@/lib/permissions";
import { isInviteExpired } from "./expiry";
import { forcedTestsolverType } from "@/lib/collection-config";
import { parseInput } from "@/lib/validation";
import { z } from "zod";

// Thrown inside the transaction when a one-time invite was used up by a
// concurrent accept between our check and our write.
class InviteAlreadyUsed extends Error {}

const inviteCodeSchema = z.string().min(1);

export async function acceptInvite(
  inviteCode: string,
): Promise<ActionResponse> {
  const input = parseInput(inviteCodeSchema, inviteCode);
  if (!input.ok) {
    return input;
  }

  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  const email = user.email;
  if (email === null) {
    return error("session.email is null or undefined");
  }

  const invite = await prisma.invite.findUnique({
    where: { code: inviteCode },
    include: { collection: true },
  });

  if (!invite) {
    return error("Invalid invite code");
  }

  // Accepting never lowers a member's access: an invite that would not raise
  // it is not used, and the member goes where they usually start.
  const existing = await getPermission(userId, invite.collectionId);
  if (existing !== null && !inviteRaisesAccess(existing, invite.accessLevel)) {
    redirect(collectionHomePath(invite.collection.cid, existing.accessLevel));
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
        // Consume the invite first, and only if nobody else has: using it
        // moves `expiresAt` to now, so the update matches only while
        // `expiresAt` still holds the unexpired value checked above (null or
        // a future date). The row lock makes a concurrent accept wait and
        // then see the used invite.
        const consumed = await tx.invite.updateMany({
          where: { code: inviteCode, expiresAt: invite.expiresAt },
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
          ...(forcedTestsolverType(invite.collection.cid) !== null && {
            testsolverType: forcedTestsolverType(invite.collection.cid),
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

  redirect(collectionHomePath(invite.collection.cid, invite.accessLevel));
}
