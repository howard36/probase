import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import NotLoggedIn from "./not-logged-in";
import Expired from "./expired";
import InvalidEmail from "./invalid-email";
import type { InviteProps } from "./types";
import { inviteInclude } from "./types";
import { auth } from "auth";

interface Params {
  code: string;
}

async function getInvite(code: string): Promise<InviteProps> {
  const invite = await prisma.invite.findUnique({
    where: { code },
    include: inviteInclude,
  });

  if (invite === null) {
    notFound();
  }

  return invite;
}

export default async function InvitePage({ params }: { params: Params }) {
  const session = await auth();

  const { code } = params;
  const invite = await getInvite(code);

  if (session === null) {
    return <NotLoggedIn invite={invite} />;
  }

  const email = session.currentEmail;
  if (email === null || email === undefined) {
    throw new Error("session.email is null or undefined");
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("session.userId is undefined");
  }

  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId: invite.collectionId,
      },
    },
  });

  let hasPermission = false;
  if (
    permission !== null &&
    (permission.accessLevel === "Admin" ||
      permission.accessLevel === "TeamMember")
  ) {
    hasPermission = true;
  }

  if (!hasPermission) {
    if (invite.expiresAt !== null) {
      return <Expired invite={invite} />;
    }

    if (
      invite.emailDomain !== null &&
      !email.endsWith("@" + invite.emailDomain)
    ) {
      return <InvalidEmail invite={invite} email={email} />;
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
  }

  if (invite.oneTimeUse) {
    await prisma.invite.update({
      where: { code: invite.code },
      data: {
        expiresAt: new Date(),
      },
    });
  }

  redirect(`/c/${invite.collection.cid}`);
}
