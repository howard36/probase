"use client";

import ProblemCard from "./problem-card";
import { Collection, Permission } from "@prisma/client";
import { ProblemProps } from "./types";
import { Filter, filterToString } from "@/lib/filter";
import { ProblemListPagination } from "@/components/problem-list-pagination";
import { ProblemListSidebar } from "@/components/problem-list-sidebar";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ProblemList({
  collection,
  problems,
  userId,
  authors,
  permission,
  filter,
  solvedProblemIds,
}: {
  collection: Collection;
  problems: ProblemProps[];
  userId: string;
  authors: { id: number }[];
  permission: Permission | null;
  filter: Filter;
  solvedProblemIds: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  problems = problems.filter(
    (problem) => problem.isArchived === filter.archived,
  );
  if (filter.subjects.length > 0) {
    problems = problems.filter((problem) =>
      filter.subjects.includes(problem.subject),
    );
  }
  if (filter.unsolvedOnly) {
    problems = problems.filter(
      (problem) => !solvedProblemIds.includes(problem.id),
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

  useEffect(() => {
    if (filter.page > numPages) {
      const newParams = filterToString({ ...filter, page: numPages });
      router.replace(`${pathname}${newParams}`);
    }
  }, [filter, numPages, router, pathname]);

  problems = problems.slice(20 * (filter.page - 1), 20 * filter.page);

  return (
    <div className="p-4 sm:p-8 xl:px-12 xl:py-24">
      <div className="flex flex-col xl:flex-row xl:justify-center xl:gap-x-12">
        <div className="xl:max-w-72 xl:flex-grow"></div>
        <div className="w-full xl:order-3 xl:max-w-72">
          <div className="xl:sticky xl:top-24">
            <ProblemListSidebar
              collection={collection}
              permission={permission}
              filter={filter}
            />
          </div>
        </div>
        <div className="w-full xl:max-w-screen-md">
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
      {numPages > 1 && (
        <ProblemListPagination totalPages={numPages} filter={filter} />
      )}
    </div>
  );
}
