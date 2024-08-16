"use client";

import Link from "next/link";
import ProblemCard from "./problem-card";
import { useCallback, useEffect, useState } from "react";
import { Collection, Permission, Subject } from "@prisma/client";
import { ProblemProps } from "./types";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { usePathname, useRouter } from "next/navigation";
import { Filter, filterToString } from "@/lib/filter";

const allSubjects: Subject[] = [
  "Algebra",
  "Combinatorics",
  "Geometry",
  "NumberTheory",
];

export default function ProblemList({
  collection,
  problems,
  userId,
  authors,
  permission,
  initialFilter,
}: {
  collection: Collection;
  problems: ProblemProps[];
  userId: string;
  authors: { id: number }[];
  permission: Permission | null;
  initialFilter: Filter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const toggleSubject = (subject: Subject) => {
    const newSubjects = filter.subjects.includes(subject)
      ? filter.subjects.filter((s) => s !== subject)
      : [...filter.subjects, subject].sort();
    const newFilter = { ...filter, subjects: newSubjects };
    setFilter(newFilter);
    const newParams = filterToString(newFilter);
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setFilter((prev) => ({ ...prev, search: newSearch }));
    const newParams = filterToString({ ...filter, search: newSearch });
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  const toggleArchived = () => {
    const newFilter = { ...filter, archived: !filter.archived };
    setFilter(newFilter);
    const newParams = filterToString(newFilter);
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  const changePage = (newPage: number) => {
    setFilter((prev) => ({ ...prev, page: newPage }));
    const newParams = filterToString({ ...filter, page: newPage });
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  problems = problems.filter(
    (problem) => problem.isArchived === filter.archived,
  );
  if (filter.subjects.length > 0) {
    problems = problems.filter((problem) =>
      filter.subjects.includes(problem.subject),
    );
  }
  if (filter.search !== "") {
    const lowerQuery = filter.search.toLowerCase();
    problems = problems.filter(
      (problem) =>
        problem.title.toLowerCase().includes(lowerQuery) ||
        problem.statement.toLowerCase().includes(lowerQuery),
    );
  }

  const numPages = Math.max(Math.ceil(problems.length / 20), 1);
  const halfInterval = 3;

  useEffect(() => {
    if (filter.page > numPages) {
      setFilter((prev) => ({ ...prev, page: numPages }));
    }
  }, [filter.page, numPages]);

  let minPage = filter.page - halfInterval;
  let maxPage = filter.page + halfInterval;
  if (minPage <= 0) {
    minPage = 1;
    maxPage = 1 + 2 * halfInterval;
  } else if (maxPage > numPages) {
    minPage = numPages - 2 * halfInterval;
    maxPage = numPages;
  }
  // Clamp to [1, numPages]
  minPage = Math.max(minPage, 1);
  maxPage = Math.min(maxPage, numPages);

  problems = problems.slice(20 * (filter.page - 1), 20 * filter.page);

  return (
    <div className="p-4 sm:p-8 md:py-24 whitespace-pre-wrap break-words">
      <div className="max-w-screen-md mx-auto">
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
                  value={filter.search}
                  onChange={handleSearchChange}
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
        <div className="mb-4 flex flex-row justify-between">
          <div>
            <div className="form-control">
              {allSubjects.map((subject) => (
                <label
                  key={subject}
                  className="label cursor-pointer justify-start"
                >
                  <input
                    type="checkbox"
                    checked={filter.subjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="checkbox checkbox-primary [--chkfg:white]"
                  />
                  <span className="label-text ml-2 text-sm font-medium text-slate-600">
                    {subject}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filter.archived}
                onChange={toggleArchived}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              <span className="ml-2 text-sm font-medium text-slate-600">
                Show archived
              </span>
            </label>
          </div>
        </div>
        <div>
          <ul>
            {problems.map((problem) => (
              <li key={problem.pid}>
                <ProblemCard
                  collection={collection}
                  problem={problem}
                  userId={userId}
                  authors={authors}
                  permission={permission}
                  filter={filter}
                />
              </li>
            ))}
          </ul>
        </div>
        {numPages > 1 && (
          <div className="mt-12 flex flex-row justify-center gap-0.5">
            {filter.page > 1 ? (
              <button
                className="btn btn-ghost btn-circle btn-sm sm:btn-md sm:text-base"
                onClick={() => changePage(filter.page - 1)}
              >
                <FontAwesomeIcon icon={faAngleLeft} />
              </button>
            ) : (
              <div className="min-w-8 sm:min-w-12"></div>
            )}
            {Array.from({ length: maxPage - minPage + 1 }, (_, idx) => (
              <button
                key={idx + minPage}
                className={cn(
                  "btn btn-ghost btn-circle btn-sm sm:btn-md sm:text-base",
                  idx + minPage == filter.page && "btn-active",
                )}
                onClick={() => changePage(idx + minPage)}
              >
                {idx + minPage}
              </button>
            ))}
            {filter.page < numPages ? (
              <button
                className="btn btn-ghost btn-circle btn-sm sm:btn-md sm:text-base"
                onClick={() => changePage(filter.page + 1)}
              >
                <FontAwesomeIcon icon={faAngleRight} />
              </button>
            ) : (
              <div className="min-w-8 sm:min-w-12"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
