import ProblemForm from "./problem-form";
import prisma from "@/lib/prisma";
import { Session } from "next-auth";
import { notFound } from "next/navigation";
import { requireCurrentUser, type CurrentUser } from "@/lib/current-user";
import { getAuthorIds } from "@/lib/collection-access";

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
  { userId, session }: CurrentUser,
  collectionId: number,
): Promise<number> {
  // Check if user already has author
  const authors = await getAuthorIds(userId, collectionId);
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
    },
  });

  return newAuthor.id;
}

async function getCollection(cid: string) {
  // TODO: filter only needed fields of collection
  const collection = await prisma.collection.findUnique({
    where: { cid },
  });

  if (collection === null) {
    notFound();
  }

  return collection;
}

export default async function AddProblemPage({ params }: { params: Params }) {
  const { cid } = params;
  const user = await requireCurrentUser(`/c/${cid}/add-problem`);

  // TODO: select only needed fields of collection
  const collection = await getCollection(cid);
  // TODO: ViewOnly should see a different page explaining why they can't submit
  const authorId = await getOrCreateAuthor(user, collection.id);

  return <ProblemForm collection={collection} authorId={authorId} />;
}
