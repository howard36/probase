import prisma from '@/utils/prisma'
import { notFound, redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/api/auth/[...nextauth]'
import GoogleLoginButton from '@/components/google-login-button'
import NotLoggedIn from './not-logged-in'

interface Params {
  code: string;
}

const inviteInclude = {
  collection: {
    select: { cid: true }
  },
  inviter: {
    select: { name: true }
  }
};
const inviteProps = Prisma.validator<Prisma.InviteArgs>()({
  include: inviteInclude
});
export type InviteProps = Prisma.InviteGetPayload<typeof inviteProps>;


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

function validEmail(invite: InviteProps, email: string): boolean {
  return invite.emailDomain === null || email.endsWith("@" + invite.emailDomain);
}

export default async function InvitePage({
  params
}: {
  params: Params
}) {
  const session = await getServerSession(authOptions);

  const { code } = params;
  const invite = await getInvite(code);

  if (session === null) {
    return <NotLoggedIn inviterName={invite.inviter.name} />;
  }

  // TODO: if you already have permission, skip (unless this gives you higher permission)

  const email = session.currentEmail;
  if (email === null || email === undefined) {
    throw new Error('session.email is null or undefined');
  }

  if (!validEmail(invite, email)) {
    return <>
      <h1>{invite.inviter.name} invited you!</h1>
      <p>You must log in with an @{invite.emailDomain} email. You are currently logged in as {email}.</p>
      <GoogleLoginButton />
    </>
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error('session.userId is undefined')
  }

  // create permission if it doesn't already exist
  await prisma.permission.upsert({
    where: {
      userId_collectionId: {
        userId,
        collectionId: invite.collectionId,
      }
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

  redirect(`/c/${invite.collection.cid}`);
}
