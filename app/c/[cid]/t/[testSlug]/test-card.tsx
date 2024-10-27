import { AccessLevel, Collection, Problem, SolveAttempt } from "@prisma/client";
import Label from "@/components/label";
import Latex from "@/components/latex";
import { canEditProblem } from "@/lib/permissions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface ProblemWithAuthors extends Problem {
  authors: { id: number }[];
}

export default function TestCard({
  position,
  problem,
  collection,
  solveAttempts,
  permission,
  authors,
}: {
  position: number;
  problem: ProblemWithAuthors;
  collection: Collection;
  solveAttempts: SolveAttempt[];
  permission: { accessLevel: AccessLevel } | null;
  authors: { id: number }[];
}) {
  let locked = false;
  if (collection.requireTestsolve) {
    // TODO: use locked = !canViewProblem(), which should also check solveAttempts
    if (!canEditProblem(problem, permission, authors)) {
      // authors shouldn't testsolve their own problems
      if (!solveAttempts.some((attempt) => attempt.problemId === problem.id)) {
        // User hasn't started testsolving this problem
        locked = true;
      }
    }
  }
  return (
    <Link href={`/c/${collection.cid}/p/${problem.pid}`} prefetch={true}>
      <div className="my-8 rounded-2xl bg-slate-50 p-8 transition duration-300 hover:bg-white hover:shadow-lg">
        <Label text={"PROBLEM " + position} />
        {locked ? (
          <div className="my-4 text-center text-lg sm:text-xl md:text-2xl">
            <FontAwesomeIcon icon={faLock} className="mr-2.5 text-slate-400" />
            <span className="font-semibold text-slate-500">
              Testsolve to view
            </span>
          </div>
        ) : (
          <div className="text-base text-slate-800 sm:text-lg md:text-xl">
            <Latex>{problem.statement}</Latex>
          </div>
        )}
      </div>
    </Link>
  );
}
