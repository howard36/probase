import ProblemForm from "./problem-form";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireCurrentUser, type CurrentUser } from "@/lib/current-user";
import { getAuthorIds, getPermission } from "@/lib/collection-access";
import { canAddProblem } from "@/lib/permissions";

interface Params {
  cid: string;
}

async function getOrCreateAuthor(
  { userId, name }: CurrentUser,
  collectionId: number,
): Promise<number> {
  // Check if user already has author
  const authors = await getAuthorIds(userId, collectionId);
  if (authors.length > 0) {
    return authors[0].id;
  }

  // No existing author found, so create one named after the signed-in user
  const newAuthor = await prisma.author.create({
    data: {
      displayName: name,
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

export default async function AddProblemPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { cid } = await params;
  const user = await requireCurrentUser(`/c/${cid}/add-problem`);

  // TODO: select only needed fields of collection
  const collection = await getCollection(cid);

  // Check before creating an Author row, so visiting the URL without the
  // right to submit leaves no trace. SubmitOnly members may add problems
  // even though they cannot view the collection, so this is deliberately
  // not requireCollectionAccess().
  const permission = await getPermission(user.userId, collection.id);
  if (!canAddProblem(permission)) {
    redirect("/need-permission");
  }

  const authorId = await getOrCreateAuthor(user, collection.id);

  return <ProblemForm collection={collection} authorId={authorId} />;
}
