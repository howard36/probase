// import Head from 'next/head';
import HomeCard from '@/components/home-card'
// import Sidebar from '@/components/sidebar'
import prisma from '@/utils/prisma'
import { Collection, Problem, Subject } from '@prisma/client'
import { notFound } from 'next/navigation'

interface Params {
  cid: string;
}

interface CollectionWithProblem extends Collection {
  problems: Pick<Problem, 'pid' | 'title' | 'subject' | 'statement'>[];
}

export async function generateStaticParams() {
  if (process.env.NO_WIFI === "true") {
    return [
      { cid: 'cmimc' }
    ];
  }
  const params: Params[] = await prisma.collection.findMany({
    select: { cid: true }
  });

  return params;
}

async function getCollection(cid: string) {
  if (process.env.NO_WIFI === "true") {
    return {
      cid: 'cmimc',
      problems: [
        {
          pid: 'A1',
          title: 'Quadratic Equation',
          subject: 'Algebra' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
        {
          pid: 'A2',
          title: 'Quadratic Equation',
          subject: 'Combinatorics' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
        {
          pid: 'A3',
          title: 'Quadratic Equation',
          subject: 'Geometry' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
        {
          pid: 'A4',
          title: 'Quadratic Equation',
          subject: 'NumberTheory' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
        {
          pid: 'A5',
          title: 'Quadratic Equation',
          subject: 'Algebra' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
      ],
      id: 1,
      name: 'CMIMC',
      showAuthors: true,
    }
  }

  // TODO: filter only needed fields of collection
  const collection = await prisma.collection.findUnique({
    where: { cid },
    include: {
      problems: true
    }
  });

  if (collection === null) {
    notFound();
  }

  return collection;
}

export default async function CollectionPage({
  params
}: {
  params: Params
}) {
  const collection = await getCollection(params.cid);

  return (
    <div className="p-12 sm:p-24">
      <div className="w-144 max-w-full mx-auto">
        <ul id="problems" className="">
          {collection.problems.map((problem) => (
            <li key={problem.pid} className="mb-8">
              <HomeCard collection={collection} problem={problem}/>
            </li>
          )).reverse()}
        </ul>
      </div>
    </div>
  );
}

