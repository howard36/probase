import Head from 'next/head';
import Script from 'next/script';
import HomeCard from '@/components/home-card';
import clientPromise from '@/utils/mongodb';
import Layout from '@/components/layout';

export async function getServerSideProps({ params }) {
  const client = await clientPromise;
  const db = client.db();

  const contest = await db
    .collection("contests")
    .findOne({ cid: params.cid });

  // TODO: check if contest is null
  // TODO: filter only needed fields of contest

  const problems = await db
    .collection("problems")
    .find({ contest_id: contest._id })
    .project({ pid: 1, title: 1, statement: 1, subject: 1, _id: 0 })
    .toArray();

  return {
    props: {
      contest: JSON.parse(JSON.stringify(contest)),
      problems,
    },
  };
}

export default function Contest({ contest, problems }) {
  return (
    <Layout title={contest.name}>
      <ul id="problems" className="px-16 py-16">
        {problems.map((problem) => (
          <HomeCard key={problem.pid} contest={contest} problem={problem}/>
        ))}
      </ul>
    </Layout>
  );
}

