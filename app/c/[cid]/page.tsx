// import Head from 'next/head';
import HomeCard from '@/components/home-card'
import Sidebar from '@/components/sidebar'
import prisma from '@/utils/prisma'
import { Collection, Problem } from '@prisma/client'
import { notFound } from 'next/navigation'

interface Params {
  cid: string;
}

interface CollectionWithProblem extends Collection {
  problems: Problem[]
}

export async function generateStaticParams() {
  const collections: Params[] = await prisma.collection.findMany({
    select: { cid: true }
  });

  return collections;
}

async function getCollection(cid: string) {
  // TODO: filter only needed fields of collection
  const collection: CollectionWithProblem | null = await prisma.collection.findUnique({
    where: { cid },
    include: {
      problems: true
    }
  });

  return collection;
}

export default async function CollectionPage({
  params
}: {
  params: Params
}) {
  const collection = await getCollection(params.cid);

  if (collection === null) {
    notFound();
  }

  return (
    <Sidebar>
      <ul id="problems" className="px-16 py-16">
        {collection.problems.map((problem) => (
          <HomeCard key={problem.pid} collection={collection} problem={problem}/>
        )).reverse()}
      </ul>
    </Sidebar>
  );
}

