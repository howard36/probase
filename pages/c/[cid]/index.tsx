import Head from 'next/head';
import HomeCard from '@/components/home-card';
import Sidebar from '@/components/sidebar';
import { find, findOne } from '@/utils/mongodb';
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

  // TODO: check if collection is null
  // TODO: filter only needed fields of collection

  const problems = await find('problems', {
    filter: { collection_id: { '$oid': collection._id } },
    projection: {
      'pid': 1,
      'title': 1,
      'statement': 1,
      'subject': 1,
      'likes': 1,
      'difficulty': 1,
      '_id': 0
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

