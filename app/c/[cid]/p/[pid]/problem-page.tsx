'use client'
// TODO: move this down the tree

import Title from './title'
import Statement from './statement'
import ProblemSpoilers from '@/components/problem-spoilers'
import type { Problem, Solution, Author } from '@prisma/client'
import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'

interface SolutionWithAuthor extends Solution {
  authors: Pick<Author, 'displayName'>[];
}

interface ProblemWithSolution extends Problem {
  authors: Pick<Author, 'id' | 'displayName'>[];
  solutions: SolutionWithAuthor[];
}

function hasProblemEditPerms(session: Session | null, problem: ProblemWithSolution): boolean {
  if (session === null) {
    return false;
  }
  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = problem.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

export default function ProblemPage({
  problem,
}: {
  problem: ProblemWithSolution
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : hasProblemEditPerms(session, problem);

  let written_by;
  if (problem.authors.length > 0) {
    written_by = <p className="italic text-slate-700 mb-8 text-right">Written by {problem.authors[0].displayName}</p>;
  }

  return (
    <div className="p-12 sm:p-24 whitespace-pre-wrap">
      {/* fixed width container, matching ideal 60-character line length */}
      <div className="w-128 max-w-full mx-auto">
        <div className="text-3xl text-slate-900 font-bold mb-4">
          <Title problem={problem} canEdit={canEdit} />
        </div>
        <div className="text-xl text-slate-800 mb-4">
          <Statement problem={problem} canEdit={canEdit} />
        </div>
        {written_by}
        <ProblemSpoilers problem={problem} canEdit={canEdit} />
      </div>
    </div>
  );
}
