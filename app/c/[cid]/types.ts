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
};
const collectionProps = Prisma.validator<Prisma.CollectionDefaultArgs>()({
  select: collectionSelect
});
export type CollectionProps = Prisma.CollectionGetPayload<typeof collectionProps>;
