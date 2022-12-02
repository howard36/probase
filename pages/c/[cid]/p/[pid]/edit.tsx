import Head from 'next/head'
import HomeCard from '../../../components/home-card.tsx'

export default function Contest({ cid, problems }) {
  return (
    <>
      <Head>
        <title>{cid}</title>
        <meta name="description" content="A math contest problem database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>{cid}</h1>
        <h2>Problems</h2>
        <ul>
          {problems.map((problem) => (
            <HomeCard key={problem.pid} problem={problem} cid={cid}/>
          ))}
        </ul>
      </main>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { cid: 'cmimc' } },
      { params: { cid: 'cmo' } },
      { params: { cid: 'hmmt' } },
    ],
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  if (params.cid === 'cmimc') {
    return {
      props: {
        cid: 'cmimc',
        problems: [
          {
            pid: '1',
            title: 'Problem 1',
            statement: 'This is a problem',
            answer: 'This is an answer',
            solution: 'This is a solution',
          },
          {
            pid: '2',
            title: 'Problem 2',
            statement: 'This is a problem',
            answer: 'This is an answer',
            solution: 'This is a solution',
          },
        ],
      },
    }
  } else if (params.cid === 'cmo') {
    return {
      props: {
        cid: 'cmo',
        problems: [
          {
            pid: '1',
            title: 'Problem 1',
            statement: 'This is a problem',
            answer: 'This is an answer',
            solution: 'This is a solution',
          },
          {
            pid: '2',
            title: 'Problem 2',
            statement: 'This is a problem',
            answer: 'This is an answer',
            solution: 'This is a solution',
          },
        ],
      },
    }
  } else if (params.cid === 'hmmt') {
    return {
      props: {
        cid: 'hmmt',
        problems: [
          {
            pid: '1',
            title: 'Problem 1',
            statement: 'This is a problem',
            answer: 'This is an answer',
            solution: 'This is a solution',
          },
          {
            pid: '2',
            title: 'Problem 2',
            statement: 'This is a problem',
            answer: 'This is an answer',
            solution: 'This is a solution',
          },
        ],
      },
    }
  }
}

