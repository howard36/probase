'use client'

import { useState } from 'react';
import Answer from './answer';
import Solution from './solution'
import type { CollectionProps, ProblemProps } from './types'

export default function Spoilers({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  const [hidden, setHidden] = useState(true);

  let answer, solution;
  if (problem.answer) {
    answer = (
      <div className="my-8">
        <Answer problem={problem} collection={collection} />
      </div>
    );
  }
  if (problem.solutions.length > 0) {
    const sol = problem.solutions[0];
    solution = (
      <div className="my-8">
        <Solution solution={sol} collection={collection} />
      </div>
    );
  }

  if (hidden) {
    return (
      <div className="my-12">
        <button onClick={() => setHidden(false)} className="w-40 py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold leading-none">Show spoilers</button>
      </div>
    );
  } else {
    return (
      <div className="my-12">
        <button onClick={() => setHidden(true)} className="w-40 py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold leading-none">Hide spoilers</button>
        {answer}
        {solution}
        <button className="w-40 py-3 text-blue-600 font-semibold rounded-md border-4 border-blue-500 hover:bg-blue-500 hover:text-slate-50 leading-none">Add Solution</button>
      </div>
    );
  };
}
