import ProblemCard from "./problem-card";
import { Collection, Permission } from "@prisma/client";
import { ProblemProps } from "./types";
import { Filter } from "@/lib/filter";
import { ProblemListPagination } from "@/components/problem-list-pagination";
import { ProblemListSidebar } from "@/components/problem-list-sidebar";

export default function ProblemList({
  collection,
  problems,
  numPages,
  userId,
  authors,
  permission,
  filter,
}: {
  collection: Collection;
  /** The current page of problems, already filtered. */
  problems: ProblemProps[];
  numPages: number;
  userId: string;
  authors: { id: number }[];
  permission: Permission;
  filter: Filter;
}) {
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
