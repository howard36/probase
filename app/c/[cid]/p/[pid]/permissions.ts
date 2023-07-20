import type { Session } from 'next-auth'
import type { ProblemProps, SolutionProps } from './types'

function isAdmin(session: Session, colId: number) {
  return session.collectionPerms.some(perm => (perm.colId === colId && perm.isAdmin));
}

// TODO: when is session null?
// read next-auth docs to figure out
export function canEditProblem(
  session: Session | null,
  problem: ProblemProps,
): boolean {
  if (session === null) {
    return false;
  }
  if (isAdmin(session, problem.collectionId)) {
    return true;
  }
  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = problem.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

export function canEditSolution(
  session: Session | null,
  solution: SolutionProps,
  colId: number,
): boolean {
  if (session === null) {
    return false;
  }
  if (isAdmin(session, colId)) {
    return true;
  }
  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = solution.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}
