import Head from 'next/head';
import HomeCard from '@/components/home-card';
import Sidebar from '@/components/sidebar';
import { useSession } from 'next-auth/react';
import prisma from '@/utils/prisma';
// import { Session } from '@/types/next-auth';

interface Params {
  cid: string;
}

interface Path {
  params: Params;
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

function getAccessLevel(session, collectionId: number) {
  if (session?.collectionPerms === undefined) {
    return null;
  }
  for (let i = 0; i < session.collectionPerms.length; i++) {
    let perm = session.collectionPerms[i];
    if (perm.collectionId === collectionId) {
      return perm.accessLevel;
    }
  }
}

export default function Collection({ collection }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  const access = getAccessLevel(session, collection.id);
  if (access === null) {
    return (
      <Sidebar>
        <p>No permissions to view this page</p>
      </Sidebar>
    );
  }

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

