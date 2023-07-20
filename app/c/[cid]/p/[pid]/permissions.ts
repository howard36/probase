import type { Session } from 'next-auth'
import type { ProblemProps } from './types'

export function canEditProblem(session: Session | null, problem: ProblemProps): boolean {
  if (session === null) {
    return false;
  }
  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = problem.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}
