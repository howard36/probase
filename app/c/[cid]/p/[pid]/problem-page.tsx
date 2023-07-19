import EditableTitle from '@/components/editable-title'
import EditableStatement from '@/components/editable-statement'
import ProblemSpoilers from '@/components/problem-spoilers'
import type { Problem, Solution, Author } from '@prisma/client'

interface SolutionWithAuthor extends Solution {
  authors: Pick<Author, 'displayName'>[];
}

interface ProblemWithSolution extends Problem {
  authors: Pick<Author, 'id' | 'displayName'>[];
  solutions: SolutionWithAuthor[];
}

export default function ProblemPage({
  problem,
  canEdit
}: {
  problem: ProblemWithSolution
  canEdit: boolean
}) {
  let written_by;
  if (problem.authors.length > 0) {
    written_by = <p className="italic text-slate-700 mb-8 text-right">Written by {problem.authors[0].displayName}</p>;
  }

  return (
    <div className="p-12 sm:p-24">
      {/* fixed width container, matching ideal 60-character line length */}
      <div className="w-128 max-w-full mx-auto">
        <div className="text-3xl text-slate-900 font-bold mb-4">
          <EditableTitle problem={problem} />
        </div>
        <div className="text-xl text-slate-800 mb-4">
          <EditableStatement problem={problem} />
        </div>
        {written_by}
        <ProblemSpoilers problem={problem} />
      </div>
    </div>
  );
}
