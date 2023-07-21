import type { Problem, Collection, Solution, Author } from '@prisma/client'

export interface Params {
  cid: string;
  pid: string;
}

export interface SolutionProps extends Solution {
  authors: Pick<Author, 'id' | 'displayName'>[];
}

export interface ProblemProps extends Problem {
  authors: Pick<Author, 'id' | 'displayName'>[];
  solutions: SolutionProps[];
}

export interface Props {
  collection: Collection;
  problem: ProblemProps;
}
