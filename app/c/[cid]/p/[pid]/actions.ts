"use server";

import {
  canAddComment,
  canAddSolution,
  canEditProblem,
  canEditSolution,
  canViewCollection,
} from "@/lib/permissions";
import prisma from "@/lib/prisma";
import {
  type ActionResponse,
  error,
  unexpectedError,
} from "@/lib/server-actions";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { getAuthorIds, getPermission } from "@/lib/collection-access";
import { revalidateTag } from "next/cache";
import {
  BUFFER_TIME_MILLIS,
  SUBMISSION_LIMIT,
  testsolveDeadline,
} from "@/lib/testsolve";

export async function likeProblem(
  problemId: number,
  like: boolean,
): Promise<ActionResponse> {
  // TODO: zod
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        pid: true,
        collection: {
          select: {
            id: true,
            cid: true,
          },
        },
      },
    });

    if (problem === null) {
      return error(`No problem with id ${problemId}`);
    }

    const user = await getCurrentUser();
    if (user === null) {
      return error("Not signed in");
    }
    const { userId } = user;

    const collectionId = problem.collection.id;
    const permission = await getPermission(userId, collectionId);
    if (!canViewCollection(permission)) {
      // No permission
      return error("You do not have permission to like this problem");
    }

    if (like === true) {
      await prisma.problemLike.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    } else {
      try {
        await prisma.problemLike.delete({
          where: {
            userId_problemId: {
              userId,
              problemId,
            },
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err?.code === "P2025"
        ) {
          // This error is okay, we're deleting something that doesn't exist.
          // But it's still unexpected, because it shouldn't happen under normal use. So we log it
          console.error(err);
        } else {
          return unexpectedError("likeProblem", err);
        }
      }
    }

    revalidateTag(`problem/${problem.collection.cid}_${problem.pid}`);
    return { ok: true };
  } catch (err) {
    return unexpectedError("likeProblem", err);
  }
}

interface Data {
  title?: string;
  statement?: string;
  answer?: string;
  isArchived?: boolean;
}

export async function editProblem(
  problemId: number,
  data: Data,
): Promise<ActionResponse> {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        pid: true,
        collection: {
          select: {
            id: true,
            cid: true,
          },
        },
        authors: {
          select: { id: true },
        },
      },
    });

    if (problem === null) {
      return error(`No problem with id ${problemId}`);
    }

    const user = await getCurrentUser();
    if (user === null) {
      return error("Not signed in");
    }
    const { userId } = user;

    const collectionId = problem.collection.id;
    const permission = await getPermission(userId, collectionId);
    const authors = await getAuthorIds(userId, collectionId);
    if (!canEditProblem(problem, permission, authors)) {
      // No permission
      return error("You do not have permission to edit this problem");
    }

    // TODO: validate input
    const { title, statement, answer, isArchived } = data;

    await prisma.problem.update({
      where: { id: problemId },
      data: {
        title,
        statement,
        answer,
        isArchived,
      },
    });

    revalidateTag(`problem/${problem.collection.cid}_${problem.pid}`);
    return { ok: true };
  } catch (err) {
    return unexpectedError("editProblem", err);
  }
}

export async function addComment(
  problemId: number,
  formData: FormData,
): Promise<ActionResponse> {
  const text = formData.get("comment") as string;
  // TODO: replace with zod
  if (text === null) {
    return error("Text is null");
  }

  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        pid: true,
        collection: {
          select: {
            id: true,
          },
        },
      },
    });
    if (problem === null) {
      return error("Problem not found");
    }

    const permission = await getPermission(userId, problem.collection.id);
    if (!canAddComment(permission)) {
      return error("You do not have permission to comment on this problem");
    }

    await prisma.comment.create({
      data: {
        text,
        problem: {
          connect: { id: problemId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    revalidateTag(`problem/${problemId}/comments`);
    return { ok: true };
  } catch (err) {
    return unexpectedError("addComment", err);
  }
}

export async function startTestsolve(
  problemId: number,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        id: true,
        pid: true,
        collection: {
          select: {
            id: true,
            cid: true,
          },
        },
      },
    });
    if (problem === null) {
      return error("Problem not found");
    }

    const permission = await getPermission(userId, problem.collection.id);
    // TODO: use canTestsolveProblem
    if (!canViewCollection(permission)) {
      return error("You do not have permission to edit this collection");
    }

    await prisma.solveAttempt.create({
      data: {
        problemId,
        userId,
      },
    });

    return { ok: true };
  } catch (err) {
    return unexpectedError("startTestsolve", err);
  }
}

export async function submitTestsolve(
  problemId: number,
  answer: string,
): Promise<ActionResponse<{ correct: boolean; remaining: number }>> {
  const submittedAt = new Date();

  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        id: true,
        pid: true,
        difficulty: true,
        answer: true,
        collection: {
          select: {
            id: true,
            cid: true,
          },
        },
      },
    });
    if (problem === null) {
      return error("Problem not found");
    }

    const permission = await getPermission(userId, problem.collection.id);
    // TODO: use canTestsolveProblem
    if (!canViewCollection(permission)) {
      return error("You do not have permission to edit this collection");
    }

    const difficulty = problem.difficulty;
    if (difficulty === null) {
      return error("Problem difficulty should not be null");
    }

    const solveAttempt = await prisma.solveAttempt.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: problem.id,
        },
      },
    });
    if (solveAttempt === null) {
      return error("Tried to submit before starting testsolve");
    }

    if (solveAttempt.numSubmissions >= SUBMISSION_LIMIT) {
      return error(
        `Reached maximum number of submissions (${SUBMISSION_LIMIT})`,
      );
    }

    // Submissions get a grace buffer past the deadline for network latency.
    const deadline = new Date(
      testsolveDeadline(solveAttempt.startedAt, difficulty).getTime() +
        BUFFER_TIME_MILLIS,
    );
    if (submittedAt >= deadline || solveAttempt.gaveUp) {
      return error("Tried to submit after testsolve finished");
    }

    const correct = answer === problem.answer;
    const remaining = Math.max(
      0,
      SUBMISSION_LIMIT - (solveAttempt.numSubmissions + 1),
    );

    await prisma.solveAttempt.update({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      data: {
        numSubmissions: {
          increment: 1,
        },
        solvedAt: correct ? submittedAt : undefined,
      },
    });

    return { ok: true, data: { correct, remaining } };
  } catch (err) {
    return unexpectedError("submitTestsolve", err);
  }
}

export async function giveUpTestsolve(
  problemId: number,
): Promise<ActionResponse> {
  const submittedAt = new Date();

  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        id: true,
        pid: true,
        difficulty: true,
        answer: true,
        collection: {
          select: {
            id: true,
            cid: true,
          },
        },
      },
    });
    if (problem === null) {
      return error("Problem not found");
    }

    const permission = await getPermission(userId, problem.collection.id);
    // TODO: use canTestsolveProblem
    if (!canViewCollection(permission)) {
      return error("You do not have permission to edit this collection");
    }

    const difficulty = problem.difficulty;
    if (difficulty === null) {
      return error("Problem difficulty should not be null");
    }

    const solveAttempt = await prisma.solveAttempt.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: problem.id,
        },
      },
    });
    if (solveAttempt === null) {
      return error("Tried to submit before starting testsolve");
    }

    const deadline = testsolveDeadline(solveAttempt.startedAt, difficulty);
    if (submittedAt >= deadline || solveAttempt.gaveUp) {
      return error("Tried to submit after testsolve finished");
    }

    await prisma.solveAttempt.update({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      data: {
        gaveUp: true,
      },
    });

    return { ok: true };
  } catch (err) {
    return unexpectedError("giveUpTestsolve", err);
  }
}

export async function addSolution(
  problemId: number,
  text: string,
  authorId: number,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });
    if (problem === null) {
      return error("Problem not found");
    }

    const permission = await getPermission(userId, problem.collectionId);
    if (!canAddSolution(permission)) {
      return error("You do not have permission to edit this collection");
    }

    await prisma.solution.create({
      data: {
        problem: {
          connect: { id: problemId },
        },
        text,
        authors: {
          connect: { id: authorId },
        },
      },
    });

    // TODO: revalidateTag problem.id/solutions
    return { ok: true };
  } catch (err) {
    return unexpectedError("addSolution", err);
  }
}

export async function editSolution(
  solutionId: number,
  text: string,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  try {
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
      select: {
        authors: {
          select: { id: true },
        },
        problem: {
          select: {
            id: true,
            pid: true,
            collection: {
              select: {
                id: true,
                cid: true,
              },
            },
          },
        },
      },
    });
    if (solution === null) {
      return error("Problem not found");
    }

    const collectionId = solution.problem.collection.id;
    const permission = await getPermission(userId, collectionId);
    const authors = await getAuthorIds(userId, collectionId);
    if (!canEditSolution(solution, permission, authors)) {
      return error("You do not have permission to edit this collection");
    }

    await prisma.solution.update({
      where: { id: solutionId },
      data: {
        text,
      },
    });

    // TODO: revalidateTag problem.id/solutions
    return { ok: true };
  } catch (err) {
    return unexpectedError("editSolution", err);
  }
}
