import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import ProblemForm from '@/components/problem-form';
import { useSession } from 'next-auth/react';
import prisma from '@/utils/prisma';

interface Context {
  readonly params: {
    readonly cid: string;
  }
}

interface Props {
  readonly collection: any;
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

export async function getStaticProps({ params }: Context) {
  // TODO: select only needed fields of collection
  const collection = await prisma.collection.findUnique({
    where: { cid: params.cid }
  });

  if (collection === null) {
    return {
      notFound: true
    };
  }

  const problems = await prisma.problem.findMany({
    where: { collection },
    select: {
      pid: true,
      title: true,
      statement: true,
      subject: true,
      likes: true,
      difficulty: true,
    }
  });

  return {
    props: {
      collection,
    },
  };
}

export default function Collection({ collection }: Props) {
  const session = useSession();
  console.log("session = ", session, "type = ", typeof(session));

  // TODO: change indigo accent color
  return (
    <Sidebar>
      <Head>
        <title>{collection.name} - New Problem</title>
      </Head>
      <ProblemForm collection={collection}/>
    </Sidebar>
  );
}

