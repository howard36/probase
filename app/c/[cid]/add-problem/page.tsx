import ProblemForm from '@/components/problem-form'
import prisma from '@/utils/prisma'
import { notFound } from 'next/navigation'

interface Params {
  cid: string;
}

export async function generateStaticParams() {
  if (process.env.NO_WIFI === "true") {
    return [
      { cid: 'cmimc' }
    ];
  }
  const params: Params[] = await prisma.collection.findMany({
    select: { cid: true }
  });

  return params;
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
  // TODO: select only needed fields of collection
  const collection = await getCollection(params.cid);

  // TODO: change blue accent color
  return (
    <ProblemForm collection={collection}/>
  );
}
