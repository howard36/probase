import Head from 'next/head'
import clientPromise from '@/utils/mongodb';
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'

export async function getServerSideProps({ params }) {
  const client = await clientPromise;
  const db = client.db();

  const contest = await db
    .collection("contests")
    .findOne({ cid: params.cid });

  const problem = await db
    .collection('problems')
    .findOne({ contest_id: contest._id, pid: params.pid });
 
  const statement = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(problem.statement);

  console.log(statement.toString());

  return {
    props: {
      contest: JSON.parse(JSON.stringify(contest)),
      problem: JSON.parse(JSON.stringify(problem)),
      statement: statement.toString(),
    },
  };
}

export default function ProblemDetails({ contest, problem, statement }) {
  return (
    <>
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
        <p className="mb-4">{problem.statement}</p>
        <p>Answer: {problem.answer}</p>
        <p>Solution: {problem.solution}</p>
      </div>
    </>
  )
}

