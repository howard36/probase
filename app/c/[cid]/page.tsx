import ProblemCard from './problem-card'
import prisma from '@/utils/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Subject } from '@prisma/client'
import type { Params, CollectionProps } from './types'
import { collectionSelect } from './types'

export async function generateStaticParams(): Promise<Params[]> {
  if (process.env.NO_WIFI === "true") {
    return [
      { cid: 'cmimc' }
    ];
  }

  const params = await prisma.collection.findMany({
    select: { cid: true }
  });
  return params;
}

async function getCollection(cid: string): Promise<CollectionProps> {
  if (process.env.NO_WIFI === "true") {
    return {
      cid: 'cmimc',
      name: 'CMIMC',
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
    }
  }

  const collection = await prisma.collection.findUnique({
    where: { cid },
    select: collectionSelect,
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
  const { cid } = params;
  const collection = await getCollection(cid);

  return (
    <div className="p-8 md:py-24">
      <div className="w-128 sm:w-144 md:w-160 max-w-full mx-auto">
        {/* TODO: blue shadow */}
        <Link href={`/c/${cid}/add-problem`} className="mb-8 inline-block rounded-xl py-4 px-8 bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold text-lg soft-shadow-xl">Add Problem</Link>
        <div>
        <ul id="problems">
          {collection.problems.map((problem) => (
            <li key={problem.pid} className="mb-8">
              <ProblemCard collection={collection} problem={problem} />
            </li>
          )).reverse()}
        </ul>
        </div>
      </div>
    </div>
  );
}

