import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import NotLoggedIn from "./not-logged-in";
import Expired from "./expired";
import InvalidEmail from "./invalid-email";
import type { InviteProps } from "./types";
import { inviteInclude } from "./types";
import { getCurrentUser } from "@/lib/current-user";
import { getPermission } from "@/lib/collection-access";
import { hasJoinedCollection } from "@/lib/permissions";
import { isInviteExpired } from "./expiry";
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

export default async function InvitePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const user = await getCurrentUser();

  const { code } = await params;
  const invite = await getInvite(code);

  if (user === null) {
    return <NotLoggedIn invite={invite} />;
  }

  const email = user.session.currentEmail;
  if (email === null || email === undefined) {
    throw new Error("session.email is null or undefined");
  }

  const permission = await getPermission(user.userId, invite.collectionId);

  if (hasJoinedCollection(permission)) {
    // User has already joined the collection
    return <AlreadyJoined invite={invite} />;
  }

  // User has not joined the collection, so they need to use the invite

  if (isInviteExpired(invite)) {
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
