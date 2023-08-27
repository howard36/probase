import { authOptions } from '@/api/auth/[...nextauth]';
import ProblemForm from './problem-form'
import prisma from '@/utils/prisma'
import { Session, getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation'

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
  if (process.env.NO_WIFI === "true") {
    return {
      cid: 'cmimc',
      id: 1,
      name: 'CMIMC',
      showAuthors: true,
    }
  }

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
    redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}%2Fadd-problem`);
  }

  // TODO: select only needed fields of collection
  const collection = await getCollection(cid);
  const authorId = await getOrCreateAuthor(session, collection.id);

  return (
    <ProblemForm collection={collection} authorId={authorId} />
  );
}
