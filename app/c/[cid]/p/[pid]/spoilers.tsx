"use client";

import { useState } from "react";
import Answer from "./answer";
import Solution from "./solution";
import AddSolution from "./add-solution";
import type { Props } from "./types";

export default function Spoilers(props: Props) {
  const { problem, collection, permission, authors } = props;
  const [hidden, setHidden] = useState(true);

  let answer, solution;
  if (problem.answer !== null) {
    answer = (
      <div className="my-8">
        <Answer {...props} />
      </div>
    );
  } else {
    answer = null;
  }

  if (problem.solutions.length > 0) {
    const sol = problem.solutions[0];
    solution = (
      <div className="my-8">
        <Solution
          solution={sol}
          collection={collection}
          permission={permission}
          authors={authors}
        />
      </div>
    );
  } else if (authors.length > 0) {
    solution = <AddSolution problem={problem} authorId={authors[0].id} />;
  } else {
    solution = null;
  }

  if (answer === null && solution === null) {
    return <div className="py-8"></div>;
  } else {
    if (hidden) {
      return (
        <div className="my-12">
          <button
            onClick={() => setHidden(false)}
            className="w-44 rounded-md bg-violet-500 py-4 text-base font-semibold leading-none text-slate-50 hover:bg-violet-600"
          >
            Show spoilers
          </button>
        </div>
      );
    } else {
      return (
        <div className="my-12">
          <button
            onClick={() => setHidden(true)}
            className="w-44 rounded-md bg-violet-500 py-4 text-base font-semibold leading-none text-slate-50 hover:bg-violet-600"
          >
            Hide spoilers
          </button>
          {answer}
          {solution}
        </div>
      );
    }
  }
}
