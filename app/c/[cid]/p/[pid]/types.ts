import { Prisma } from '@prisma/client'

export interface Params {
  cid: string;
  pid: string;
}

export const collectionSelect = {
  id: true,
  cid: true,
  name: true,
};
const collectionProps = Prisma.validator<Prisma.CollectionArgs>()({
  select: collectionSelect
});
export type CollectionProps = Prisma.CollectionGetPayload<typeof collectionProps>;

const solutionInclude = {
  authors: {
    select: {
      id: true,
      displayName: true,
    }
  }
};
const solutionProps = Prisma.validator<Prisma.SolutionArgs>()({
  include: solutionInclude
});
export type SolutionProps = Prisma.SolutionGetPayload<typeof solutionProps>;

export const problemInclude = {
  authors: {
    select: {
      id: true,
      displayName: true,
    }
  },
  solutions: {
    include: solutionInclude
  },
};
const problemProps = Prisma.validator<Prisma.ProblemArgs>()({
  include: problemInclude
});
export type ProblemProps = Prisma.ProblemGetPayload<typeof problemProps>;

export const permissionSelect = {
  accessLevel: true
};
const permissionProps = Prisma.validator<Prisma.PermissionArgs>()({
  select: permissionSelect
});
export type PermissionProps = Prisma.PermissionGetPayload<typeof permissionProps>;

export const authorSelect = {
  id: true
};
const authorProps = Prisma.validator<Prisma.AuthorArgs>()({
  select: authorSelect
});
export type AuthorProps = Prisma.AuthorGetPayload<typeof authorProps>;


export interface Props {
  problem: ProblemProps;
  collection: CollectionProps;
  permission: PermissionProps;
  authors: AuthorProps[];
}
