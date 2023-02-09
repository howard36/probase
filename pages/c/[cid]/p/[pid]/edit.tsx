import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import { find, findOne, aggregate } from '@/utils/mongodb';
import { useSession } from 'next-auth/react';


// TODO
export async function getStaticPaths() {
  const params = await aggregate('problems', [
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
  ]);

  const paths = params.map((param) => ({
    params: param,
  }));

  return {
    paths,
    fallback: 'blocking'
  };
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

export default function ProblemEdit({ collection, problem }) {
  const session = useSession();
  console.log("session = ", session, "type = ", typeof(session));

  const subjects = [
    "Algebra",
    "Combinatorics",
    "Geometry",
    "Number Theory",
  ];

  // TODO: change indigo accent color
  return (
    <Sidebar>
      <Head>
        <title>{collection.name} - New Problem</title>
      </Head>
      <div className="container px-6 py-12 mx-auto flex">
        <div className="bg-white rounded-lg p-8 flex flex-col w-full relative z-10 shadow-md">
          <form action={`/api/problem/${problem._id}/edit`} method="post">
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Title</label>
              <input id="title" name="title" value={problem.title} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
            </div>
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Subject</label>
              <select id="subject" name="subject" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
                {subjects.map(subject => <option value={subject} selected={subject == problem.subject}>{subject}</option>)}
              </select>
            </div>
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Problem Statement</label>
              <textarea id="statement" name="statement" value={problem.statement} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
            </div>
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Answer</label>
              <input id="answer" name="answer" value={problem.answer} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
            </div>
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Solution</label>
              <textarea id="solution" name="solution" value={problem.solution} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
            </div>
            <button className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Submit</button>
          </form>
        </div>
      </div>
    </Sidebar>
  );
}

