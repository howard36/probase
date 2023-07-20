import type { Session } from 'next-auth'
import type { ProblemProps, SolutionProps } from './types'

export function canEditProblem(session: Session | null, problem: ProblemProps): boolean {
  if (session === null) {
    return false;
  }
  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = problem.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

export function canEditSolution(session: Session | null, solution: SolutionProps): boolean {
  if (session === null) {
    return false;
  }
  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = solution.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}
