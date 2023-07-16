'use client'

import { useState } from 'react';
import EditableAnswer from '@/components/editable-answer';
import EditableSolution from '@/components/editable-solution';
import { Problem, Solution, Author } from '@prisma/client';

interface SolutionWithAuthor extends Solution {
  authors: Pick<Author, 'displayName'>[];
}

interface ProblemWithSolution extends Problem {
  solutions: SolutionWithAuthor[];
}

export default function ProblemSpoilers({
  problem
}: {
  problem: ProblemWithSolution
}) {
  const [hidden, setHidden] = useState(true);

  let answer, solution;
  if (problem.answer) {
    answer = (
      <div className="text-xl text-slate-800 mb-8">
        <EditableAnswer problem={problem}/>
      </div>
    );
  }
  if (problem.solutions.length > 0) {
    const sol = problem.solutions[0];
    solution = (
      <div className="text-xl text-slate-800 mb-8">
        <EditableSolution solution={sol}/>
      </div>
    );
  }

  if (hidden) {
    return (
      <button onClick={() => setHidden(false)} className="mb-8 w-40 py-3 rounded-md bg-indigo-500 hover:bg-indigo-600 text-slate-50 font-semibold leading-none">Show spoilers</button>
    );
  } else {
    return (
      <>
        <button onClick={() => setHidden(true)} className="mb-8 w-40 py-3 rounded-md bg-indigo-500 hover:bg-indigo-600 text-slate-50 font-semibold leading-none">Hide spoilers</button>
        {answer}
        {solution}
        <button className="text-indigo-600 font-semibold rounded-md border-4 border-indigo-500 hover:bg-indigo-500 hover:text-slate-50 py-3 w-40 leading-none">Add Solution</button>
      </>
    );
  };
}
