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
  const params: Params[] = await prisma.collection.findMany({
    select: { cid: true }
  });

  return params;
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

export default async function CollectionPage({
  params
}: {
  params: Params
}) {
  const collection = await getCollection(params.cid);

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

