import Head from 'next/head';
import HomeCard from '@/components/home-card';
import Sidebar from '@/components/sidebar';
import { useSession } from 'next-auth/react';
import prisma from '@/utils/prisma';

interface Context {
  readonly params: {
    readonly cid: string;
  }
}

interface Props {
  readonly collection: any;
  readonly problems: any[];
}

export async function getStaticPaths() {
  const collections = await prisma.collection.findMany({
    select: { cid: true }
  });

  const paths = collections.map((collection) => ({
    params: { cid: collection.cid },
  }));

  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }: Context): Promise<{props: Props}> {
  const collection = await prisma.collection.findUnique({
    where: { cid: params.cid }
  });

  if (collection === null) {
    // TODO
    // URL has invalid cid
    // show a "404 collection not found" page
    return null;
  }
  // TODO: filter only needed fields of collection

  const problems = await prisma.problem.findMany({
    where: { collection },
    select: {
      pid: true,
      title: true,
      statement: true,
      subject: true,
      likes: true,
      difficulty: true,
      id: true,
    }
  });

  return {
    props: {
      collection,
      problems,
    },
  };
}

export default function Collection({ collection, problems }: Props) {
  const session = useSession();
  console.log("session = ", session, "type = ", typeof(session));

  return (
    <Sidebar>
      <Head>
        <title>{collection.name}</title>
      </Head>
      <ul id="problems" className="px-16 py-16">
        {problems.map((problem) => (
          <HomeCard key={problem.pid} collection={collection} problem={problem}/>
        ))}
      </ul>
    </Sidebar>
  );
}

