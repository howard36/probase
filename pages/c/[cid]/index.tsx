import Head from 'next/head';
import HomeCard from '@/components/home-card';
import Sidebar from '@/components/sidebar';
import clientPromise from '@/utils/mongodb';
import { useSession } from 'next-auth/react';

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

