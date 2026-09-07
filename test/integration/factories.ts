import type { AccessLevel, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Minimal row builders. Every required column gets a sane default; pass overrides for the rest.
// A counter keeps unique columns (email, cid, pid, invite code, token) distinct within a test.

let counter = 0;
function next(): number {
  counter += 1;
  return counter;
}

export function createUser(overrides: Partial<Prisma.UserCreateInput> = {}) {
  const n = next();
  return prisma.user.create({
    data: {
      id: `user-${n}`,
      name: `User ${n}`,
      email: `user${n}@example.com`,
      ...overrides,
    },
  });
}

export function createCollection(
  overrides: Partial<Prisma.CollectionCreateInput> = {},
) {
  const n = next();
  return prisma.collection.create({
    data: {
      name: `Collection ${n}`,
      cid: `collection-${n}`,
      showAuthors: true,
      ...overrides,
    },
  });
}

export function createPermission(
  user: { id: string },
  collection: { id: number },
  accessLevel: AccessLevel = "TeamMember",
  overrides: Partial<Prisma.PermissionUncheckedCreateInput> = {},
) {
  return prisma.permission.create({
    data: {
      userId: user.id,
      collectionId: collection.id,
      accessLevel,
      ...overrides,
    },
  });
}

export function createAuthor(
  collection: { id: number },
  overrides: Partial<Prisma.AuthorUncheckedCreateInput> = {},
) {
  const n = next();
  return prisma.author.create({
    data: {
      displayName: `Author ${n}`,
      collectionId: collection.id,
      ...overrides,
    },
  });
}

export function createProblem(
  collection: { id: number },
  overrides: Partial<Prisma.ProblemUncheckedCreateInput> & {
    authorIds?: number[];
  } = {},
) {
  const n = next();
  const { authorIds, ...rest } = overrides;
  return prisma.problem.create({
    data: {
      collectionId: collection.id,
      pid: `A${n}`,
      title: `Problem ${n}`,
      statement: `Statement ${n}`,
      subject: "Algebra",
      answer: "42",
      difficulty: 1,
      isAnonymous: false,
      ...(authorIds && {
        authors: { connect: authorIds.map((id) => ({ id })) },
      }),
      ...rest,
    },
  });
}

export function createSolution(
  problem: { id: number },
  overrides: Partial<Prisma.SolutionUncheckedCreateInput> & {
    authorIds?: number[];
  } = {},
) {
  const n = next();
  const { authorIds, ...rest } = overrides;
  return prisma.solution.create({
    data: {
      problemId: problem.id,
      text: `Solution ${n}`,
      ...(authorIds && {
        authors: { connect: authorIds.map((id) => ({ id })) },
      }),
      ...rest,
    },
  });
}

export function createInvite(
  collection: { id: number },
  inviter: { id: string },
  overrides: Partial<Prisma.InviteUncheckedCreateInput> = {},
) {
  const n = next();
  return prisma.invite.create({
    data: {
      collectionId: collection.id,
      inviterId: inviter.id,
      accessLevel: "TeamMember",
      code: `invite-${n}`,
      ...overrides,
    },
  });
}

export function createApiToken(
  collection: { id: number },
  createdBy: { id: string },
  overrides: Partial<Prisma.ApiTokenUncheckedCreateInput> = {},
) {
  const n = next();
  return prisma.apiToken.create({
    data: {
      collectionId: collection.id,
      createdByUserId: createdBy.id,
      token: `token-${n}`,
      name: `Token ${n}`,
      ...overrides,
    },
  });
}
