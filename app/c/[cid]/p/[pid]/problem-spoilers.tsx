'use client'

import { useState } from 'react';
import Answer from './answer';
import Solution from './solution'
import type { ProblemProps } from './types'

export default function ProblemSpoilers({
  problem,
}: {
  problem: ProblemProps
}) {
  const [hidden, setHidden] = useState(true);

  let answer, solution;
  if (problem.answer) {
    answer = (
      <div className="text-xl text-slate-800 mb-8">
        <Answer problem={problem} />
      </div>
    );
  }
  if (problem.solutions.length > 0) {
    const sol = problem.solutions[0];
    solution = (
      <div className="text-xl text-slate-800 mb-8">
        <Solution solution={sol} collectionId={problem.collectionId}/>
      </div>
    );
  }

  if (hidden) {
    return (
      <button onClick={() => setHidden(false)} className="mb-8 w-40 py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold leading-none">Show spoilers</button>
    );
  } else {
    return (
      <>
        <button onClick={() => setHidden(true)} className="mb-8 w-40 py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold leading-none">Hide spoilers</button>
        {answer}
        {solution}
        <button className="text-blue-600 font-semibold rounded-md border-4 border-blue-500 hover:bg-blue-500 hover:text-slate-50 py-3 w-40 leading-none">Add Solution</button>
      </>
    );
  };
}