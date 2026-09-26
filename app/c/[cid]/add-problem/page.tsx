import ProblemForm from "./problem-form";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/current-user";
import { getPermission } from "@/lib/collection-access";
import { canAddProblem, canViewCollection } from "@/lib/permissions";

interface Params {
  cid: string;
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
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ submitted?: string | string[] }>;
}) {
  const { cid } = await params;
  const { submitted } = await searchParams;
  const user = await requireCurrentUser(`/c/${cid}/add-problem`);

  // TODO: select only needed fields of collection
  const collection = await getCollection(cid);

  // SubmitOnly members may add problems even though they cannot view the
  // collection, so this is deliberately not requireCollectionAccess(). The
  // member's author is created when they submit, not here: this page is
  // prefetched from the collection page, and viewing must leave no trace.
  const permission = await getPermission(user.userId, collection.id);
  if (!canAddProblem(permission)) {
    redirect("/need-permission");
  }

  // After a submission by a member who cannot view the collection (and so
  // cannot be sent to the new problem), the form says it was received.
  const submission =
    typeof submitted === "string"
      ? await prisma.problem.findFirst({
          where: {
            collectionId: collection.id,
            pid: submitted,
            submitterId: user.userId,
          },
          select: { pid: true, title: true },
        })
      : null;

  return (
    <ProblemForm
      // A fresh, empty form after each submission.
      key={submission?.pid ?? "new"}
      collection={collection}
      canViewCollection={canViewCollection(permission)}
      submission={submission}
    />
  );
}
