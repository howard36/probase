import Link from "next/link";
import Latex from "@/components/latex";
import type { ProblemProps } from "./types";
import Lightbulbs from "@/components/lightbulbs";
import Likes from "@/components/likes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { Collection, Permission } from "@prisma/client";
import { canEditProblem } from "@/lib/permissions";
import { Filter, filterToString } from "@/lib/filter";

const titleLineColors = [
  "bg-red-400", // 0
  "bg-orange-400",
  "bg-amber-400",
  "bg-yellow-400",
  "bg-lime-400",
  "bg-green-400", // 5
  "bg-emerald-400",
  "bg-teal-400",
  "bg-cyan-400",
  "bg-sky-400",
  "bg-blue-400", // 10
  "bg-indigo-400",
  "bg-violet-400",
  "bg-purple-400",
  "bg-fuchsia-400",
  "bg-pink-400", // 15
  "bg-rose-400",
];

// Gradients:
// alg: cyan-sky (8-9)
// combo: yellow-amber (2-3)
// geo: green-emerald (5-6)
// nt: purple-violet (13-12)
// cs?: rose-red (16-0)

// TODO: allow each collection to define new subjects and
// customize its own mapping
const subjectToColor = {
  Algebra: 10,
  Combinatorics: 1,
  Geometry: 6,
  NumberTheory: 13,
  ComputerScience: 16,
};

const subjectToTextColor = {
  Algebra: "text-blue-500",
  Combinatorics: "text-amber-500",
  Geometry: "text-green-500",
  NumberTheory: "text-red-500",
  ComputerScience: "text-cyan-500",
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
  permission: Permission | null;
  userId: string;
  authors: { id: number }[];
  filter: Filter;
}) {
  let locked = false;
  // TODO: use locked = !canViewProblem(), which should also check solveAttempts
  if (
    permission === null ||
    (collection.requireTestsolve &&
      permission.testsolveLockStartedAt !== null &&
      permission.testsolveLockStartedAt < problem.createdAt &&
      !canEditProblem(problem, permission, authors))
  ) {
    // authors shouldn't testsolve their own problems
    if (!problem.solveAttempts.some((attempt) => attempt.userId === userId)) {
      // User hasn't started testsolving this problem
      locked = true;
    }
  }

  const searchParams = filterToString(filter);

  return (
    <Link
      href={`/c/${collection.cid}/p/${problem.pid}${searchParams}`}
      prefetch={true}
    >
      <div className="bg-white p-6 pb-5 pr-[22px] md:p-8 md:pb-7 mb-4 sm:mb-6 rounded-2xl soft-shadow-xl flex flex-col gap-y-2.5 sm:gap-y-4">
        <div className="flex items-start">
          <h2 className="grow text-xl leading-6 md:text-2xl md:leading-7 font-bold truncate">
            <span className={`${subjectToTextColor[problem.subject]} mr-1.5`}>
              {problem.pid}.
            </span>
            <span className="text-slate-900">{problem.title}</span>
          </h2>
          <div className="hidden sm:flex ml-4 h-6 md:h-7 gap-x-4 md:gap-x-6">
            {problem.difficulty !== null && problem.difficulty > 0 && (
              <Lightbulbs difficulty={problem.difficulty} />
            )}
            <Likes problem={problem} userId={userId} />
          </div>
        </div>
        {locked ? (
          <div className="text-center text-lg md:text-xl pt-1 sm:pb-2">
            <FontAwesomeIcon icon={faLock} className="text-slate-400 mr-2.5" />
            <span className="text-slate-500 font-semibold">
              Testsolve to view
            </span>
          </div>
        ) : (
          <div className="text-base md:text-lg text-slate-800 whitespace-pre-wrap break-words">
            <Latex>{problem.statement}</Latex>
          </div>
        )}
        <div className="h-6 flex sm:hidden items-center justify-between">
          <Likes problem={problem} userId={userId} />
          {problem.difficulty !== null && problem.difficulty > 0 && (
            <Lightbulbs difficulty={problem.difficulty} />
          )}
        </div>
      </div>
    </Link>
  );
}
