import Title from './title'
import Statement from './statement'
import ProblemSpoilers from './problem-spoilers'
import type { CollectionProps, ProblemProps } from './types'

export default function ProblemPage({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  let written_by;
  if (problem.authors.length > 0) {
    written_by = <p className="italic text-slate-700 mb-8 text-right">Written by {problem.authors[0].displayName}</p>;
  }

  return (
    <div className="p-12 sm:p-24 whitespace-pre-wrap">
      {/* fixed width container, matching ideal 60-character line length */}
      <div className="w-128 max-w-full mx-auto">
        <div className="text-3xl text-slate-900 font-bold mb-4">
          <Title problem={problem} collection={collection} />
        </div>
        <div className="text-xl text-slate-800 mb-4">
          <Statement problem={problem} collection={collection} />
        </div>
        {written_by}
        <ProblemSpoilers problem={problem} collection={collection} />
      </div>
    </div>
  );
}
