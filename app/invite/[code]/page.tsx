import { cache } from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import NotLoggedIn from "./not-logged-in";
import Expired from "./expired";
import InvalidEmail from "./invalid-email";
import type { InviteProps } from "./types";
import { inviteInclude } from "./types";
import { getCurrentUser } from "@/lib/current-user";
import { getPermission } from "@/lib/collection-access";
import { collectionHomePath, inviteRaisesAccess } from "@/lib/permissions";
import { isInviteExpired } from "./expiry";
import InviteJoinPage from "./invite-join-page";
import AlreadyJoined from "./already-joined";

interface Params {
  code: string;
}

// Cached per request, so the page and its title share one lookup.
const getInvite = cache(async function (code: string): Promise<InviteProps> {
  const invite = await prisma.invite.findUnique({
    where: { code },
    include: inviteInclude,
  });

  if (invite === null) {
    notFound();
  }

  return invite;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;
  const invite = await getInvite(code);
  return { title: `Join ${invite.collection.name}` };
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

  const email = user.email;
  if (email === null) {
    throw new Error("session.email is null or undefined");
  }

  const permission = await getPermission(user.userId, invite.collectionId);

  if (
    permission !== null &&
    !inviteRaisesAccess(permission, invite.accessLevel)
  ) {
    // The invite would not add to what they can already do.
    return (
      <AlreadyJoined
        invite={invite}
        homePath={collectionHomePath(
          invite.collection.cid,
          permission.accessLevel,
        )}
      />
    );
  }

  // Not a member yet, or the invite raises their access

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
