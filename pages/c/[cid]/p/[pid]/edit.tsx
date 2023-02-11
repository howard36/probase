import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import ProblemForm from '@/components/problem-form';
import { find, findOne, aggregate } from '@/utils/mongodb';
import { useSession } from 'next-auth/react';


// TODO
export async function getStaticPaths() {
  const params = await aggregate('problems', [
    {
      $lookup: {
        from: 'collections',
        localField: 'collection_id',
        foreignField: '_id',
        as: 'collection',
      },
    },
    {
      $unwind: '$collection',
    },
    {
      $project: {
        _id: 0,
        cid: '$collection.cid',
        pid: '$pid',
      },
    },
  ]);

  const paths = params.map((param) => ({
    params: param,
  }));

  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const collection = await findOne('collections', {
    filter: { cid: params.cid },
  });

  const problem = await findOne('problems', {
    filter: { collection_id: { '$oid': collection._id }, pid: params.pid }
  });

  return {
    props: {
      collection,
      problem,
    },
  };
}

export default function ProblemEdit({ collection, problem }) {
  const session = useSession();
  console.log("session = ", session, "type = ", typeof(session));

  const subjects = [
    "Algebra",
    "Combinatorics",
    "Geometry",
    "Number Theory",
  ];

  // TODO: change indigo accent color
  return (
    <Sidebar>
      <Head>
        <title>{collection.name} - New Problem</title>
      </Head>
      <form action={`/api/problems/${problem._id}/edit`} method="post">
        <ProblemForm collection={collection} problem={problem}/>
      </form>
    </Sidebar>
  );
}

