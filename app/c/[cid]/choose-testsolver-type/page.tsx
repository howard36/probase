import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { canViewCollection } from "@/lib/permissions";
import { Collection } from "@prisma/client";
import { auth } from "auth";
import ChooseTestsolverTypePage from "@/components/choose-testsolver-type-page";

async function getCollection(cid: string): Promise<Collection> {
  const collection = await prisma.collection.findUnique({
    where: { cid },
  });
  if (collection === null) {
    notFound();
  }
  return collection;
}

interface Params {
  cid: string;
}

export default async function Page({ params }: { params: Params }) {
  const { cid } = params;
  const collection = await getCollection(cid);

  const session = await auth();

  if (session === null) {
    redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}`);
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId: collection.id,
      },
    },
  });

  if (permission === null || !canViewCollection(permission)) {
    redirect("/need-permission");
  }

  if (
    collection.requireTestsolve === false ||
    permission.testsolverType !== null
  ) {
    redirect(`/c/${cid}`);
  }

  return <ChooseTestsolverTypePage collection={collection} />;
}
