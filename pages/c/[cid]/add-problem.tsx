import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import ProblemForm from '@/components/problem-form';
import clientPromise from '@/utils/mongodb';
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
  const client = await clientPromise;
  const collections = await client.db().collection('collections').find(
    {},
    { projection: { cid: 1, _id: 0 } }
  ).toArray();

  const paths = collections.map((collection) => ({
    params: { cid: collection.cid },
  }));

  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }: Context): Promise<{props: Props}> {
  const client = await clientPromise;
  const collection = await client.db().collection('collections').findOne(
    { cid: params.cid }
  );

  if (collection === null) {
    return null; // TODO
  }
  // TODO: filter only needed fields of collection

  const problems = await client.db().collection('problems').find(
    { collection_id: { $oid: collection._id } },
    {
      projection: {
        'pid': 1,
        'title': 1,
        'statement': 1,
        'subject': 1,
        'likes': 1,
        'difficulty': 1,
        '_id': 0
      }
    }
  ).toArray();

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
      <ProblemForm collection={collection} problem={null}/>
    </Sidebar>
  );
}

