import { Collection, Permission, Problem, SolveAttempt } from "@prisma/client";
import Label from "@/components/label";
import Latex from "@/components/latex";
import { canEditProblem } from "@/utils/permissions";
import { ProblemProps } from "../../types";

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
    <div>
      <Label text={"PROBLEM " + position} />
      <Latex>{problem.statement}</Latex>
    </div>
  );
}

