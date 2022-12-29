import Head from 'next/head';
import Script from 'next/script';
import HomeCard from '@/components/home-card';
import Layout from '@/components/layout';
import { find, findOne } from '@/utils/mongodb3';

export async function getStaticPaths() {
  const collections = await find('collections', {
    projection: { 'cid': 1, '_id': 0 }
  });

  const paths = collections.map((collection) => ({
    params: { cid: collection.cid },
  }));

  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const collection = await findOne('collections', {
    filter: { cid: params.cid }
  });

  // TODO: check if collection is null
  // TODO: filter only needed fields of collection

  const problems = await find('problems', {
    filter: { collection_id: { '$oid': collection._id } },
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
      collection,
      problems,
    },
  };
}

export default function Collection({ collection, problems }) {
  return (
    <Layout title={collection.name}>
      <ul id="problems" className="px-16 py-16">
        {problems.map((problem) => (
          <HomeCard key={problem.pid} collection={collection} problem={problem}/>
        ))}
      </ul>
    </Layout>
  );
}

