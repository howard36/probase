import Link from 'next/link';
import Latex from 'react-latex-next';
import { Problem, Collection } from '@prisma/client';

const titleLineColors = [
  'bg-red-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-amber-400',
  'bg-purple-500',
  'bg-rose-400',
];

// TODO: allow each collection to define new subjects and 
// customize its own mapping
const subjectToColor = {
  'Algebra': 5,
  'Combinatorics': 1,
  'Geometry': 2,
  'NumberTheory': 3,
};

export default function HomeCard({
  collection,
  problem,
}: {
  collection: Collection
  problem: Problem
}) {
  const subjectColor = subjectToColor[problem.subject];
  const titleLineColor = titleLineColors[subjectColor];

  return (
    <Link href={`/c/${collection.cid}/p/${problem.pid}`}>
      <div className="bg-white p-6 m-8 rounded-2xl soft-shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{problem.title}</h1>
        <div className={`w-16 h-2 mb-4 ${titleLineColor} rounded-full`}></div>
        <p className="text-slate-700"><Latex>{problem.statement}</Latex></p>
      </div>
    </Link>
  );
}
