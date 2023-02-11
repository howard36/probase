import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import ProblemForm from '@/components/problem-form';
import { find, findOne } from '@/utils/mongodb';
import { useSession } from 'next-auth/react';

interface Context {
  readonly params: {
    readonly cid: string;
  }
}

interface Props {
  readonly collection: any;
}

export async function getStaticPaths() {
  const collections = await find('collections', {
    projection: { 'cid': 1, '_id': 0 }
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
  const collection = await findOne('collections', {
    filter: { cid: params.cid }
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
      <form action={`/api/collections/${collection._id}/problems/add`} method="post">
        <ProblemForm collection={collection}/>
      </form>
    </Sidebar>
  );
}

