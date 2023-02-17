import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import ProblemForm from '@/components/problem-form';
import clientPromise from '@/utils/mongodb';
import { useSession } from 'next-auth/react';


// TODO
export async function getStaticPaths() {
  const client = await clientPromise;
  const params = await client.db().collection('problems').aggregate([
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
  ]).toArray();

  const paths = params.map((param) => ({
    params: param,
  }));

  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const client = await clientPromise;
  const collection = await client.db().collection('collections').findOne(
    { cid: params.cid }
  )
  if (collection === null) {
    return;
  }

  const problem = await client.db().collection('problems').findOne(
    { collection_id: collection._id, pid: params.pid }
  )

  return {
    props: {
      collection: JSON.parse(JSON.stringify(collection)),
      problem: JSON.parse(JSON.stringify(problem)),
    },
  };
}

export default function ProblemEdit({ collection, problem }) {
  const session = useSession();
  console.log({problem})

  const subjects = [
    "Algebra",
    "Combinatorics",
    "Geometry",
    "Number Theory",
  ];

  // TODO: change indigo accent color
  // TODO: second Head causes a warning
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

