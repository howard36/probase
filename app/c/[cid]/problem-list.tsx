'use client'

import Link from "next/link"
import { CollectionProps } from "./types";
import ProblemCard from "./problem-card";
import { useState } from "react";

export default function ProblemList({
  collection,
}: {
  collection: CollectionProps
}) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }

  const lowerQuery = query.toLowerCase();
  const filteredProblems = collection.problems.filter((problem) => {
    if (query === "") {
      // Don't apply filter, just include all problems
      return true;
    }
    return problem.title.toLowerCase().includes(lowerQuery) || problem.statement.toLowerCase().includes(lowerQuery);
  })

  return (
    <div className="p-8 md:py-24 whitespace-pre-wrap break-words">
      <div className="w-128 sm:w-144 md:w-160 max-w-full mx-auto">
        {/* TODO: blue shadow */}
        <Link href={`/c/${collection.cid}/add-problem`} className="my-8 py-4 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold text-lg soft-shadow-xl">Add Problem</Link>
        <div>
          <form>
            <input type="search" value={query} onChange={handleChange} />
          </form>
        </div>
        <div>
          <ul id="problems">
            {filteredProblems.map((problem) => (
              <li key={problem.pid}>
                <ProblemCard collection={collection} problem={problem} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
