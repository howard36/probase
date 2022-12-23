import Head from 'next/head'
import clientPromise from '@/utils/mongodb';
import Layout from '@/components/layout';
import Latex from 'react-latex-next';

export async function getServerSideProps({ params }) {
  const client = await clientPromise;
  const db = client.db();

  const contest = await db
    .collection("contests")
    .findOne({ cid: params.cid });

  const problem = await db
    .collection('problems')
    .findOne({ contest_id: contest._id, pid: params.pid });

  return {
    props: {
      contest: JSON.parse(JSON.stringify(contest)),
      problem: JSON.parse(JSON.stringify(problem)),
    },
  };
}

export default function ProblemDetails({ contest, problem, statement }) {
  return (
    <Layout>
      <Head>
        <title>{problem.title}</title>
        <meta name="description" content="A math contest problem database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="p-24">
        <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
        {/* is it safe to be inserting statement like this?
        It's user-submitted text */}
        {statement}
        <p className="mb-4"><Latex>{problem.statement}</Latex></p>
        <p><Latex>{`Answer: ${problem.answer}`}</Latex></p>
        <p><Latex>{`Solution: ${problem.solution}`}</Latex></p>
      </div>
    </Layout>
  )
}

