import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import { find, findOne } from '@/utils/mongodb';
import { useSession } from 'next-auth/react';

interface Context {
  readonly params: {
    readonly cid: string;
  }
}

interface Props {
  readonly collection: any;
}

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

export async function getStaticProps({ params }: Context): Promise<{props: Props}> {
  const collection = await findOne('collections', {
    filter: { cid: params.cid }
  });

  return {
    props: {
      collection,
    },
  };
}

export default function Collection({ collection }: Props) {
  const session = useSession();
  console.log("session = ", session, "type = ", typeof(session));

  // TODO: change indigo accent color
  return (
    <Sidebar>
      <Head>
        <title>{collection.name} - New Problem</title>
      </Head>
      <div className="container px-6 py-12 mx-auto flex">
        <div className="bg-white rounded-lg p-8 flex flex-col w-full relative z-10 shadow-md">
          <form action={`/api/c/${collection.cid}/new`} method="post">
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Title</label>
              <input id="title" name="title" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
            </div>
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Subject</label>
              <select id="subject" name="subject" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
                <option value="Algebra">Algebra</option>
                <option value="Combinatorics">Combinatorics</option>
                <option value="Geometry">Geometry</option>
                <option value="Number Theory">Number Theory</option>
              </select>
            </div>
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Problem Statement</label>
              <textarea id="statement" name="statement" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
            </div>
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Answer</label>
              <input id="answer" name="answer" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
            </div>
            <div className="relative mb-4">
              <label className="leading-7 text-md text-gray-600">Solution</label>
              <textarea id="solution" name="solution" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
            </div>
            <button className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Submit</button>
          </form>
        </div>
      </div>
    </Sidebar>
  );
}

