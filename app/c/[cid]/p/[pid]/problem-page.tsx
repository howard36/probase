import Title from './title'
import Statement from './statement'
import Spoilers from './spoilers'
import type { CollectionProps, ProblemProps } from './types'

// darker color first, for more contrast
const subjectToGradient = {
  'Algebra': {
    subject: 'Algebra',
    gradient: 'from-sky-500 to-cyan-500'
  },
  'Combinatorics': {
    subject: 'Combinatorics',
    gradient: 'from-amber-500 to-yellow-500'
  },
  'Geometry': {
    subject: 'Geometry',
    gradient: 'from-emerald-500 to-green-500'
  },
  'NumberTheory': {
    subject: 'Number Theory',
    gradient: 'from-violet-500 to-purple-500'
  },
}

export default function ProblemPage({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  let written_by;
  if (problem.authors.length > 0) {
    written_by = <p className="italic text-slate-700 text-base mb-8 text-right">Written by {problem.authors[0].displayName}</p>;
  }

  let { subject, gradient } = subjectToGradient[problem.subject];

  return (
    <div className="p-12 sm:py-24 text-slate-800 whitespace-pre-wrap break-words hyphens-auto">
      {/* fixed width container, matching ideal 60-character line length */}
      <div className="mx-auto w-112 sm:w-128 md:w-144 max-w-full text-base sm:text-lg md:text-xl">
        <div className="text-2xl sm:text-3xl text-slate-900 font-bold mb-4">
          <Title problem={problem} collection={collection} />
        </div>
        <div className={`py-2 px-6 inline-block mb-4 text-slate-50 font-semibold text-sm text-center leading-none rounded-full bg-gradient-to-r ${gradient}`}>
          {subject}
        </div>
        <div className="mb-4">
          <Statement problem={problem} collection={collection} />
        </div>
        {written_by}
        <Spoilers problem={problem} collection={collection} />
      </div>
    </div>
  );
}
