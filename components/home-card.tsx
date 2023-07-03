'use client'

import Link from 'next/link';
import Latex from 'react-latex-next';
import { Problem, Collection } from '@prisma/client';

const titleLineColors = [
  'bg-red-400', // 0
  'bg-orange-300',
  'bg-amber-300',
  'bg-yellow-300',
  'bg-lime-400',
  'bg-green-400', // 5
  'bg-emerald-400',
  'bg-teal-400',
  'bg-cyan-400',
  'bg-sky-400',
  'bg-blue-400', // 10
  'bg-indigo-400',
  'bg-violet-400',
  'bg-purple-400',
  'bg-fuchsia-400',
  'bg-pink-400', // 15
  'bg-rose-400',
];

// Gradients:
// alg: sky-blue (9-10)
// combo: yellow-amber (2-3)
// geo: green-emerald (5-6)
// nt: purple-violet (13-12)
// cs?: pink-rose (15-16)

// TODO: allow each collection to define new subjects and 
// customize its own mapping
const subjectToColor = {
  'Algebra': 9,
  'Combinatorics': 2,
  'Geometry': 5,
  'NumberTheory': 12,
};

export default function HomeCard({
  collection,
  problem,
}: {
  collection: Collection
  problem: Pick<Problem, 'pid' | 'title' | 'subject' | 'statement'>
}) {
  const subjectColor = subjectToColor[problem.subject];
  const titleLineColor = titleLineColors[subjectColor];

  return (
    <Link href={`/c/${collection.cid}/p/${problem.pid}`}>
      <div className="bg-white p-8 rounded-2xl soft-shadow-xl">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{problem.title}</h2>
        <div className={`w-16 h-2 mb-4 ${titleLineColor} rounded-full`}></div>
        <p className="text-xl text-slate-800"><Latex>{problem.statement}</Latex></p>
      </div>
    </Link>
  );
}
