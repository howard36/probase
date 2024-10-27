"use client";

import ProblemCard from "./problem-card";
import { useEffect, useState } from "react";
import { Collection, Permission } from "@prisma/client";
import { ProblemProps } from "./types";
import { usePathname, useRouter } from "next/navigation";
import { Filter, filterToString } from "@/lib/filter";
import { Pagination } from "@/components/pagination";
import { ProblemListSidebar } from "@/components/problem-list-sidebar";

export default function ProblemList({
  collection,
  problems,
  userId,
  authors,
  permission,
  initialFilter,
  solvedProblemIds,
}: {
  collection: Collection;
  problems: ProblemProps[];
  userId: string;
  authors: { id: number }[];
  permission: Permission | null;
  initialFilter: Filter;
  solvedProblemIds: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>(initialFilter);

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
  problems = problems.slice(20 * (filter.page - 1), 20 * filter.page);

  const changePage = (newPage: number) => {
    setFilter((prev) => ({ ...prev, page: newPage }));
    const newParams = filterToString({ ...filter, page: newPage });
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  useEffect(() => {
    if (filter.page > numPages) {
      setFilter((prev) => ({ ...prev, page: numPages }));
    }
  }, [filter.page, numPages]);

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
              setFilter={setFilter}
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
        <Pagination
          currentPage={filter.page}
          totalPages={numPages}
          onPageChange={changePage}
        />
      )}
    </div>
  );
}
