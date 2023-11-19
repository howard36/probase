import { authOptions } from '@/api/auth/[...nextauth]';
import ProblemForm from './problem-form'
import prisma from '@/utils/prisma'
import { Session, getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation'
import LoginRequired from '@/components/login-required';

interface Params {
  cid: string;
}

function getFullName(session: Session): string {
  if (session.fullName) {
    return session.fullName;
  } else {
    return `${session.givenName} ${session.familyName}`;
  }
}

async function getOrCreateAuthor(
  session: Session,
  collectionId: number,
): Promise<number> {
  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  // Check if user already has author
  const authors = await prisma.author.findMany({
    where: {
      userId,
      collectionId,
    },
    select: { id: true },
  });
  if (authors.length > 0) {
    return authors[0].id;
  }

  // No existing author found, so create new author and update token and session
  const fullName = getFullName(session);
  const newAuthor = await prisma.author.create({
    data: {
      displayName: fullName,
      userId,
      collectionId,
    }
  });

  return newAuthor.id;
}

async function getCollection(cid: string) {
  // TODO: filter only needed fields of collection
  const collection = await prisma.collection.findUnique({
    where: { cid },
    include: {
      problems: true
    }
  });

  if (collection === null) {
    notFound();
  }

  return collection;
}

export default async function AddProblemPage({
  params
}: {
  params: Params
}) {
  const { cid } = params;
  let session = await getServerSession(authOptions);
  if (session === null) {
    // Not logged in
    if (cid === "demo") {
      return <LoginRequired message="Log in to Probase to add a problem" callbackUrl="/c/demo/add-problem" />;
    } else {
      redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}%2Fadd-problem`);
    }
  }

  // TODO: select only needed fields of collection
  const collection = await getCollection(cid);
  // TODO: ViewOnly should see a different page explaining why they can't submit
  const authorId = await getOrCreateAuthor(session, collection.id);

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  if (cid === "demo") {
    // create permission if it doesn't already exist
    await prisma.permission.upsert({
      where: {
        userId_collectionId: {
          userId,
          collectionId: collection.id,
        }
      },
      update: {
        accessLevel: 'TeamMember',
      },
      create: {
        userId,
        collectionId: collection.id,
        accessLevel: 'TeamMember',
      },
    });
  }

  return <ProblemForm collection={collection} authorId={authorId} />;
}
