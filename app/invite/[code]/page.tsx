import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import NotLoggedIn from "./not-logged-in";
import Expired from "./expired";
import InvalidEmail from "./invalid-email";
import type { InviteProps } from "./types";
import { inviteInclude } from "./types";
import { auth } from "auth";
import InviteJoinPage from "./invite-join-page";
import AlreadyJoined from "./already-joined";

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

  if (
    permission !== null &&
    (permission.accessLevel === "Admin" ||
      permission.accessLevel === "TeamMember")
  ) {
    // User has already joined the collection
    return <AlreadyJoined invite={invite} />;
  }

  // User has not joined the collection, so they need to use the invite

  if (invite.expiresAt !== null) {
    return <Expired invite={invite} />;
  }

  if (
    invite.emailDomain !== null &&
    !email.endsWith("@" + invite.emailDomain)
  ) {
    return <InvalidEmail invite={invite} email={email} />;
  }

  return <InviteJoinPage invite={invite} />;
}
