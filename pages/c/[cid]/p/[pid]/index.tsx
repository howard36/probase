import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import Latex from 'react-latex-next';
import clientPromise from '@/utils/mongodb';
import Problem from '@/types/problem';
import Collection from '@/types/collection';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';

interface Params extends ParsedUrlQuery {
  cid: string;
  pid: string;
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
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
    fallback: 'blocking',
  };
};

interface PropsProblem {
  _id: string;
  author_ids: string[];
}

interface PropsCollection {
  _id: string;
  cid: string;
}

interface Props {
  problem: PropsProblem;
  collection: PropsCollection;
}

// TODO: consider changing to a more type-safe database to make this easier
export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const client = await clientPromise;
  const db = client.db();

  const collection = await db.collection('collections').findOne(
    { cid: params.cid }
  );
  if (collection === null) {
    return {
      notFound: true,
    };
  }

  const result = await db.collection('problems').aggregate([
    {
      $match: { collection_id: collection._id, pid: params.pid }
    },
    {
      $lookup: {
        from: 'authors',
        localField: 'authors',
        foreignField: '_id',
        as: 'author_ids',
      }
    },
  ]).toArray();
  const problem = result[0] as PropsProblem;

  return {
    props: {
      problem,
      collection,
    },
    revalidate: 1,
  };
};

interface ProblemDetailsProps {
  collection: Collection;
  problem: Problem;
}

export default function ProblemDetails({ collection, problem }: ProblemDetailsProps) {
  let proposed_by, answer, solution;
  const sol = problem.solutions[0];
  if (sol.authors.length > 0) {
    proposed_by = <p className="italic mb-4">Proposed by {sol.authors[0].name}</p>;
  }
  if (problem.answer) {
    answer = <p><Latex>{`Answer: ${problem.answer}`}</Latex></p>;
  }
  if (problem.solutions.length > 0) {
    const sol = problem.solutions[0];
    solution = <p><Latex>{`Solution (by ${sol.authors[0].name}): ${sol.text}`}</Latex></p>;
  }

  return (
    <Sidebar>
      <Head>
        <title>{problem.title}</title>
      </Head>
      <div className="p-24">
        <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
        <p className="mb-4"><Latex>{problem.statement}</Latex></p>
        {proposed_by}
        {answer}
        {solution}
      </div>
    </Sidebar>
  );
}

