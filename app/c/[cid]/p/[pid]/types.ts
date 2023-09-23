import { Prisma } from '@prisma/client'

export interface Params {
  cid: string;
  pid: string;
}

export const collectionSelect = {
  id: true,
  cid: true,
  name: true,
  showAuthors: true,
};
const collectionProps = Prisma.validator<Prisma.CollectionDefaultArgs>()({
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
const solutionProps = Prisma.validator<Prisma.SolutionDefaultArgs>()({
  include: solutionInclude
});
export type SolutionProps = Prisma.SolutionGetPayload<typeof solutionProps>;

const commentSelect = {
  id: true,
  text: true,
  user: {
    select: {
      id: true,
      name: true,
      image: true,
    }
  },
  createdAt: true,
};
const commentProps = Prisma.validator<Prisma.CommentDefaultArgs>()({
  select: commentSelect
});
export type CommentProps = Prisma.CommentGetPayload<typeof commentProps>;

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
  comments: {
    select: commentSelect,
  },
};
const problemProps = Prisma.validator<Prisma.ProblemDefaultArgs>()({
  include: problemInclude
});
export type ProblemProps = Prisma.ProblemGetPayload<typeof problemProps>;

export const permissionSelect = {
  accessLevel: true
};
const permissionProps = Prisma.validator<Prisma.PermissionDefaultArgs>()({
  select: permissionSelect
});
export type PermissionProps = Prisma.PermissionGetPayload<typeof permissionProps>;

export const authorSelect = {
  id: true
};
const authorProps = Prisma.validator<Prisma.AuthorDefaultArgs>()({
  select: authorSelect
});
export type AuthorProps = Prisma.AuthorGetPayload<typeof authorProps>;


export interface Props {
  problem: ProblemProps;
  collection: CollectionProps;
  permission: PermissionProps;
  authors: AuthorProps[];
}
