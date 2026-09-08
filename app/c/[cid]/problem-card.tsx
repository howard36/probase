import Link from "next/link";
import Latex from "@/components/latex";
import type { ProblemProps } from "./types";
import Lightbulbs from "@/components/lightbulbs";
import Likes from "@/components/likes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { Collection, Permission } from "@prisma/client";
import { isProblemLocked } from "@/lib/permissions";
import { Filter, filterToString } from "@/lib/filter";

// TODO: allow each collection to define new subjects and
// customize its own mapping
const subjectToTextColor = {
  Algebra: "text-blue-500",
  Combinatorics: "text-amber-500",
  Geometry: "text-green-500",
  NumberTheory: "text-red-500",
};

export default function ProblemCard({
  collection,
  problem,
  permission,
  userId,
  authors,
  filter,
}: {
  collection: Collection;
  problem: ProblemProps;
  permission: Permission;
  userId: string;
  authors: { id: number }[];
  filter: Filter;
}) {
  const locked = isProblemLocked(
    collection,
    problem,
    permission,
    authors,
    problem.solveAttempts.some((attempt) => attempt.userId === userId),
  );

  const searchParams = filterToString(filter);

  return (
    <Link
      href={`/c/${collection.cid}/p/${problem.pid}${searchParams}`}
      prefetch={true}
    >
      <div className="soft-shadow-xl mb-4 flex flex-col gap-y-2.5 rounded-2xl bg-white p-6 pb-5 pr-[22px] sm:mb-6 sm:gap-y-4 md:p-8 md:pb-7">
        <div className="flex items-start">
          <h2 className="grow truncate text-xl font-bold leading-6 md:text-2xl md:leading-7">
            <span className={`${subjectToTextColor[problem.subject]} mr-1.5`}>
              {problem.pid}.
            </span>
            <span className="text-slate-900">{problem.title}</span>
          </h2>
          <div className="ml-4 hidden h-6 gap-x-4 sm:flex md:h-7 md:gap-x-6">
            {problem.difficulty !== null && problem.difficulty > 0 && (
              <Lightbulbs difficulty={problem.difficulty} />
            )}
            <Likes problem={problem} userId={userId} />
          </div>
        </div>
        {locked ? (
          <div className="pt-1 text-center text-lg sm:pb-2 md:text-xl">
            <FontAwesomeIcon icon={faLock} className="mr-2.5 text-slate-400" />
            <span className="font-semibold text-slate-500">
              Testsolve to view
            </span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words text-base text-slate-800 md:text-lg">
            <Latex>{problem.statement}</Latex>
          </div>
        )}
        <div className="flex h-6 items-center justify-between sm:hidden">
          <Likes problem={problem} userId={userId} />
          {problem.difficulty !== null && problem.difficulty > 0 && (
            <Lightbulbs difficulty={problem.difficulty} />
          )}
        </div>
      </div>
    </Link>
  );
}
