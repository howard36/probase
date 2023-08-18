import prisma from '@/utils/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AccessLevel, Prisma } from '@prisma/client'
import { useSession } from "next-auth/react"

interface Params {
  code: string;
}

const inviteInclude = {
  collection: {
    select: { cid: true }
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
  return invite.emailDomain === null && email.endsWith("@" + invite.emailDomain);
}

export default async function InvitePage({
  params
}: {
  params: Params
}) {
  const { data: session, status } = useSession();

  const { code } = params;
  const invite = await getInvite(code);

  if (status === "loading") {
    return <p>Loading...</p>; // TODO: better loading page
  }

  if (status === "unauthenticated") {
    return <p>You must be logged in to accept the invite</p>;
  }

  const email = session?.email;
  if (email === null || email === undefined) {
    throw new Error('session.email is null or undefined');
  }

  if (!validEmail(invite, email)) {
    return <p>Your email must end in @{invite.emailDomain}</p>; // TODO: option to link a second account
  }

  const userId = session?.userId;
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
