"use client";

import Link from "next/link";
import ProblemCard from "./problem-card";
import { useState } from "react";
import { Collection, Permission } from "@prisma/client";
import { ProblemProps } from "./types";

export default function ProblemList({
  collection,
  problems,
  userId,
  authors,
  permission,
}: {
  collection: Collection;
  problems: ProblemProps[];
  userId: string;
  authors: { id: number }[];
  permission: Permission | null;
}) {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const lowerQuery = query.toLowerCase();

  const showProblem = (problem: ProblemProps): boolean => {
    if (!showArchived && problem.isArchived) {
      // hide archived problems
      return false;
    }
    if (query) {
      return (
        problem.title.toLowerCase().includes(lowerQuery) ||
        problem.statement.toLowerCase().includes(lowerQuery)
      );
    }
    // include all problems by default
    return true;
  }


  return (
    <div className="p-8 md:py-24 whitespace-pre-wrap break-words">
      <div className="w-128 sm:w-144 md:w-160 max-w-full mx-auto">
        <div className="flex flex-wrap gap-x-12 gap-y-6 mb-6">
          {/* TODO: blue shadow */}
          <Link
            href={`/c/${collection.cid}/add-problem`}
            prefetch={true}
            className="shrink-0 grow inline-block py-3 px-10 text-center rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-50 font-bold text-base soft-shadow-xl"
          >
            Add Problem
          </Link>
          <div className="grow-[1000]">
            <div className="relative text-slate-600">
              <form>
                <input
                  type="search"
                  placeholder="Search"
                  value={query}
                  onChange={handleChange}
                  className="border-2 border-slate-300 bg-white h-12 w-full pl-4 pr-12 rounded-xl text-base focus:outline-none"
                />
                <div className="absolute right-0 top-0 mt-4 mr-4">
                  <svg
                    className="text-slate-600 h-4 w-4 fill-current"
                    x="0px"
                    y="0px"
                    viewBox="0 0 56.966 56.966"
                    width="512px"
                    height="512px"
                  >
                    <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
                  </svg>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="mb-8 flex">
          <div className="ml-auto">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={() => setShowArchived(!showArchived)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              <span className="ms-3 text-sm font-medium text-slate-600">
                Show archived problems
              </span>
            </label>
          </div>
        </div>
        <div>
          <ul>
            {problems.map((problem) => (
              <li key={problem.pid} className={showProblem(problem) ? "" : "hidden"}>
                <ProblemCard
                  collection={collection}
                  problem={problem}
                  userId={userId}
                  authors={authors}
                  permission={permission}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
