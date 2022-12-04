import Head from 'next/head'

export default function ProblemDetails({ cid, problem }) {
  return (
    <>
      <Head>
        <title>{cid}</title>
        <meta name="description" content="A math contest problem database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="p-16">
          <h1 className="text-3xl font-bold mb-4">Title: {problem.title}</h1>
          <p className="mb-4">{problem.statement}</p>
          <p>Answer: {problem.answer}</p>
          <p>Solution: {problem.solution}</p>
        </div>
      </main>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { cid: 'cmimc', pid: '1' } },
      { params: { cid: 'cmimc', pid: '2' } },
      { params: { cid: 'cmo', pid: '1' } },
      { params: { cid: 'cmo', pid: '2' } },
      { params: { cid: 'hmmt', pid: '1' } },
      { params: { cid: 'hmmt', pid: '2' } },
    ],
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  if (params.pid == 1) {
    return {
      props: {
        cid: params.cid,
        problem: {
          pid: 1,
          title: 'Problem 1',
          statement: 'This is a problem',
          answer: 'This is an answer',
          solution: 'This is a solution',
        },
      },
    }
  } else if (params.pid == 2) {
    return {
      props: {
        cid: params.cid,
        problem: {
          pid: 2,
          title: 'Problem 2',
          statement: 'This is a problem',
          answer: 'This is an answer',
          solution: 'This is a solution',
        },
      },
    }
  }
}

