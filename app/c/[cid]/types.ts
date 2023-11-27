import { Prisma } from '@prisma/client'

export interface Params {
  cid: string;
}

const problemSelect = {
  pid: true,
  id: true,
  title: true,
  subject: true,
  statement: true,
  createdAt: true,
  isArchived: true,
  difficulty: true,
  likes: {
    select: {
      userId: true,
    }
  },
  authors: {
    select: {
      id: true,
    }
  },
  solveAttempts: {
    select: {
      userId: true,
    }
  },
};
const problemProps = Prisma.validator<Prisma.ProblemDefaultArgs>()({
  select: problemSelect
});
export type ProblemProps = Prisma.ProblemGetPayload<typeof problemProps>;

export const collectionSelect = {
  id: true,
  cid: true,
  name: true,
  problems: {
    select: problemSelect,
  },
  showAuthors: true,
  requireTestsolve: true,
};
const collectionProps = Prisma.validator<Prisma.CollectionDefaultArgs>()({
  select: collectionSelect
});
export type CollectionProps = Prisma.CollectionGetPayload<typeof collectionProps>;
