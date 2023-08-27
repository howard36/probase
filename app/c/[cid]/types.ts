import { Prisma } from '@prisma/client'

export interface Params {
  cid: string;
}

const problemSelect = {
  pid: true,
  title: true,
  subject: true,
  statement: true,
};
const problemProps = Prisma.validator<Prisma.ProblemArgs>()({
  select: problemSelect
});
export type ProblemProps = Prisma.ProblemGetPayload<typeof problemProps>;

export const collectionSelect = {
  id: true,
  cid: true,
  name: true,
  problems: {
    select: problemSelect,
    orderBy: {
      id: 'desc' as Prisma.SortOrder,
    },
  }
};
const collectionProps = Prisma.validator<Prisma.CollectionArgs>()({
  select: collectionSelect
});
export type CollectionProps = Prisma.CollectionGetPayload<typeof collectionProps>;
