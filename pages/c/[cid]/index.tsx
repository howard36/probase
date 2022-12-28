import Head from 'next/head';
import Script from 'next/script';
import HomeCard from '@/components/home-card';
import Layout from '@/components/layout';
import { find, findOne } from '@/utils/mongodb3';

export async function getStaticPaths() {
  const contests = await find('contests', {
    projection: { 'cid': 1, '_id': 0 }
  });

  const paths = contests.map((contest) => ({
    params: { cid: contest.cid },
  }));

  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  console.log(params);
  const contest = await findOne('contests', {
    filter: { cid: params.cid }
  });

  // TODO: check if contest is null
  // TODO: filter only needed fields of contest

  const problems = await find('problems', {
    filter: { contest_id: { '$oid': contest._id } },
    projection: {
      'pid': 1,
      'title': 1,
      'statement': 1,
      'subject': 1,
      'likes': 1,
      'difficulty': 1,
      '_id': 0
    }
  });

  return {
    props: {
      contest,
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

