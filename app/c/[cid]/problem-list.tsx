"use client";

import Link from "next/link";
import ProblemCard from "./problem-card";
import { useEffect, useState } from "react";
import { Collection, Permission } from "@prisma/client";
import { ProblemProps } from "./types";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { usePathname, useRouter } from "next/navigation";
import { Filter, filterToString } from "@/lib/filter";
import { ProblemListFilter } from "@/components/ProblemListFilter";
import { ProblemListSearch } from "@/components/ProblemListSearch";

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
    <div className="p-4 sm:p-8 xl:py-24 whitespace-pre-wrap break-words">
      <div className="mx-auto">
        <div className="flex flex-col xl:flex-row xl:gap-x-12">
          <div className="xl:max-w-72 xl:flex-grow"></div>
          <div className="xl:max-w-72 w-full xl:mr-auto xl:mt-0 xl:order-3">
            <div className="xl:sticky xl:top-24">
              <div className="mb-2 flex flex-col sm:flex-row xl:flex-col gap-x-8 gap-y-6">
                <Link
                  href={`/c/${collection.cid}/add-problem`}
                  prefetch={true}
                  className="w-full sm:max-w-56 xl:max-w-full inline-block py-3 px-10 text-center rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-50 font-bold text-base soft-shadow-xl"
                >
                  Add Problem
                </Link>
                <ProblemListSearch filter={filter} setFilter={setFilter} />
              </div>
              <ProblemListFilter filter={filter} setFilter={setFilter} />
            </div>
          </div>
          <div className="xl:max-w-screen-md w-full">
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
        </div>
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
                idx + minPage === filter.page && "btn-active",
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
  );
}
