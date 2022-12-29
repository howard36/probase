import Head from 'next/head'
import Layout from '@/components/layout';
import Latex from 'react-latex-next';
import { findOne } from '@/utils/mongodb3';

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
    <Layout>
      <Head>
        <title>{problem.title}</title>
        <meta name="description" content="A math contest problem database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="p-24">
        <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
        <p className="mb-4"><Latex>{problem.statement}</Latex></p>
        <p><Latex>{`Answer: ${problem.answer}`}</Latex></p>
        <p><Latex>{`Solution: ${problem.solution}`}</Latex></p>
      </div>
    </Layout>
  )
}

