import { Prisma } from '@prisma/client'

export interface Params {
  cid: string;
  pid: string;
}

const collectionProps = Prisma.validator<Prisma.CollectionArgs>()({
  select: {
    id: true,
  }
});
export type CollectionProps = Prisma.CollectionGetPayload<typeof collectionProps>;

const solutionSelect = {
  include: {
    authors: {
      select: {
        id: true,
        displayName: true,
      }
    }
  }
};
const solutionProps = Prisma.validator<Prisma.SolutionArgs>()(solutionSelect);
export type SolutionProps = Prisma.SolutionGetPayload<typeof solutionProps>;

export const problemSelect = {
  include: {
    authors: {
      select: {
        id: true,
        displayName: true,
      }
    },
    solutions: solutionSelect,
  }
}
const problemProps = Prisma.validator<Prisma.ProblemArgs>()(problemSelect);
export type ProblemProps = Prisma.ProblemGetPayload<typeof problemProps>;

export interface Props {
  collection: CollectionProps;
  problem: ProblemProps;
}
