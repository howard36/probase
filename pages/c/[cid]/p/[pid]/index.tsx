import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import Latex from 'react-latex-next';
import { findOne } from '@/utils/mongodb';

// TODO
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  }
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

export default function ProblemDetails({ collection, problem }) {
  return (
    <Sidebar>
      <Head>
        <title>{problem.title}</title>
      </Head>
      <div className="p-24">
        <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
        <p className="mb-4"><Latex>{problem.statement}</Latex></p>
        <p><Latex>{`Answer: ${problem.answer}`}</Latex></p>
        <p><Latex>{`Solution: ${problem.solution}`}</Latex></p>
      </div>
    </Sidebar>
  )
}

