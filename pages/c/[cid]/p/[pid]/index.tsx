import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import Latex from 'react-latex-next';
import clientPromise from '@/utils/mongodb';

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
  const db = client.db();

  const collection = await db.collection('collections').findOne(
    { cid: params.cid }
  );
  if (collection === null) {
    return;
  }

  const problem = await db.collection('problems').findOne(
    { collection_id: collection._id, pid: params.pid }
  );
  const authors = await db.collection('authors').find(
    { _id: { $in: problem?.authors } },
  ).toArray();

  return {
    props: {
      collection: JSON.parse(JSON.stringify(collection)),
      problem: JSON.parse(JSON.stringify(problem)),
      authors: JSON.parse(JSON.stringify(authors)),
    },
  };
}

export default function ProblemDetails({ collection, problem, authors }) {
  // console.log({authors});
  return (
    <Sidebar>
      <Head>
        <title>{problem.title}</title>
      </Head>
      <div className="p-24">
        <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
        <p className="mb-4"><Latex>{problem.statement}</Latex></p>
        <p className="italic mb-4">Proposed by {authors[0].name}</p>
        <p><Latex>{`Answer: ${problem.answer}`}</Latex></p>
        <p><Latex>{`Solution: ${problem.solutions[0]}`}</Latex></p>
      </div>
    </Sidebar>
  );
}

