import { Collection, Permission, SolveAttempt } from "@prisma/client";
import Label from "@/components/label";
import Latex from "@/components/latex";
import { canEditProblem } from "@/lib/permissions";
import { ProblemProps } from "../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function ProblemCard({
  position,
  problem,
  collection,
  solveAttempts,
  permission,
  authors,
}: {
  position: number;
  problem: ProblemProps;
  collection: Collection;
  solveAttempts: SolveAttempt[];
  permission: Permission | null;
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
      <div className="bg-slate-50 p-8 my-8 rounded-2xl hover:shadow-lg hover:bg-white transition duration-300">
        <Label text={"PROBLEM " + position} />
        {locked ? (
          <div className="text-center text-lg sm:text-xl md:text-2xl my-4">
            <FontAwesomeIcon icon={faLock} className="text-slate-400 mr-2.5" />
            <span className="text-slate-500 font-semibold">
              Testsolve to view
            </span>
          </div>
        ) : (
          <div className="text-base sm:text-lg md:text-xl text-slate-800">
            <Latex>{problem.statement}</Latex>
          </div>
        )}
      </div>
    </Link>
  );
}
