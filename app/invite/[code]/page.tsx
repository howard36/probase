import prisma from '@/utils/prisma'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/api/auth/[...nextauth]'
import NotLoggedIn from './not-logged-in'
import InvalidEmail from './invalid-email'
import type { InviteProps } from './types'
import { inviteInclude } from './types'

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
  params
}: {
  params: Params
}) {
  const session = await getServerSession(authOptions);

  const { code } = params;
  const invite = await getInvite(code);

  if (session === null) {
    return <NotLoggedIn inviterName={invite.inviter.name} collectionName={invite.collection.name}/>;
  }

  // TODO: if you already have permission, skip (unless this gives you higher permission)

  const email = session.currentEmail;
  if (email === null || email === undefined) {
    throw new Error('session.email is null or undefined');
  }

  if (invite.emailDomain !== null && !email.endsWith("@" + invite.emailDomain)) {
    return <InvalidEmail
      inviterName={invite.inviter.name}
      collectionName={invite.collection.name}
      email={email}
      emailDomain={invite.emailDomain}
    />;
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
