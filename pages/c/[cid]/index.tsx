import Head from 'next/head';
import HomeCard from '@/components/home-card';
import Sidebar from '@/components/sidebar';
import prisma from '@/utils/prisma';
import { Collection, Problem } from '@prisma/client'

interface Params {
  cid: string;
}

interface Path {
  params: Params;
}

interface CollectionWithProblem extends Collection {
  problems: Problem[]
}

export async function getStaticPaths() {
  const collections = await prisma.collection.findMany({
    select: { cid: true }
  });

  const paths: Path[] = collections.map((collection) => ({
    params: { cid: collection.cid },
  }));

  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }: Path) {
  // TODO: filter only needed fields of collection
  const collection = await prisma.collection.findUnique({
    where: { cid: params.cid },
    include: {
      problems: {
        select: {
          pid: true,
          title: true,
          statement: true,
          subject: true,
          likes: true,
          difficulty: true,
          id: true,
        }
      }
    }
  });

  if (collection === null) {
    // TODO
    // URL has invalid cid
    // show a "404 collection not found" page
    return null;
  }

  return {
    props: {
      collection,
    },
  };
}

export default function Collection({
  collection
}: {
  collection: CollectionWithProblem
}) {
  return (
    <Sidebar>
      <Head>
        <title>{collection.name}</title>
      </Head>
      <ul id="problems" className="px-16 py-16">
        {collection.problems.map((problem) => (
          <HomeCard key={problem.pid} collection={collection} problem={problem}/>
        )).reverse()}
      </ul>
    </Sidebar>
  );
}

