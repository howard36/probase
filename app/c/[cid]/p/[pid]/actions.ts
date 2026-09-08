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
import { idSchema, parseInput } from "@/lib/validation";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  BUFFER_TIME_MILLIS,
  SUBMISSION_LIMIT,
  testsolveDeadline,
} from "@/lib/testsolve";

const likeSchema = z.object({ problemId: idSchema, like: z.boolean() });
const editProblemSchema = z.object({
  problemId: idSchema,
  data: z.object({
    title: z.string().min(1).optional(),
    statement: z.string().min(1).optional(),
    answer: z.string().optional(),
    isArchived: z.boolean().optional(),
  }),
});
const commentSchema = z.object({ problemId: idSchema, text: z.string() });
const testsolveSchema = z.object({ problemId: idSchema });
const submitSchema = z.object({ problemId: idSchema, answer: z.string() });
const addSolutionSchema = z.object({
  problemId: idSchema,
  text: z.string().min(1),
  authorId: idSchema,
});
const editSolutionSchema = z.object({
  solutionId: idSchema,
  text: z.string().min(1),
});

export async function likeProblem(
  problemId: number,
  like: boolean,
): Promise<ActionResponse> {
  const input = parseInput(likeSchema, { problemId, like });
  if (!input.ok) {
    return input;
  }
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

    revalidatePath(`/c/${problem.collection.cid}/p/${problem.pid}`);
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
  const input = parseInput(editProblemSchema, { problemId, data });
  if (!input.ok) {
    return input;
  }
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

    const { title, statement, answer, isArchived } = input.data.data;

    await prisma.problem.update({
      where: { id: problemId },
      data: {
        title,
        statement,
        answer,
        isArchived,
      },
    });

    revalidatePath(`/c/${problem.collection.cid}/p/${problem.pid}`);
    return { ok: true };
  } catch (err) {
    return unexpectedError("editProblem", err);
  }
}

export async function addComment(
  problemId: number,
  formData: FormData,
): Promise<ActionResponse> {
  const text = formData.get("comment");
  if (text === null) {
    return error("Text is null");
  }
  const input = parseInput(commentSchema, { problemId, text });
  if (!input.ok) {
    return input;
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
            cid: true,
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
        text: input.data.text,
        problem: {
          connect: { id: problemId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    revalidatePath(`/c/${problem.collection.cid}/p/${problem.pid}`);
    return { ok: true };
  } catch (err) {
    return unexpectedError("addComment", err);
  }
}

export async function startTestsolve(
  problemId: number,
): Promise<ActionResponse> {
  const input = parseInput(testsolveSchema, { problemId });
  if (!input.ok) {
    return input;
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
  const input = parseInput(submitSchema, { problemId, answer });
  if (!input.ok) {
    return input;
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

    // Re-check the limits inside the write so two overlapping submissions
    // cannot both get through.
    const { count } = await prisma.solveAttempt.updateMany({
      where: {
        userId,
        problemId,
        numSubmissions: { lt: SUBMISSION_LIMIT },
        gaveUp: false,
      },
      data: {
        numSubmissions: {
          increment: 1,
        },
        solvedAt: correct ? submittedAt : undefined,
      },
    });
    if (count === 0) {
      return error("Tried to submit after testsolve finished");
    }

    return { ok: true, data: { correct, remaining } };
  } catch (err) {
    return unexpectedError("submitTestsolve", err);
  }
}

export async function giveUpTestsolve(
  problemId: number,
): Promise<ActionResponse> {
  const submittedAt = new Date();
  const input = parseInput(testsolveSchema, { problemId });
  if (!input.ok) {
    return input;
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

    const { count } = await prisma.solveAttempt.updateMany({
      where: { userId, problemId, gaveUp: false },
      data: {
        gaveUp: true,
      },
    });
    if (count === 0) {
      return error("Tried to submit after testsolve finished");
    }

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
  const input = parseInput(addSolutionSchema, { problemId, text, authorId });
  if (!input.ok) {
    return input;
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
            cid: true,
          },
        },
      },
    });
    if (problem === null) {
      return error("Problem not found");
    }

    const permission = await getPermission(userId, problem.collection.id);
    if (!canAddSolution(permission)) {
      return error("You do not have permission to edit this collection");
    }

    // The page submits the user's own Author; do not let a crafted request
    // attribute a solution to someone else.
    const authors = await getAuthorIds(userId, problem.collection.id);
    if (!authors.some((author) => author.id === authorId)) {
      return error("Invalid input (authorId): not one of your authors");
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

    revalidatePath(`/c/${problem.collection.cid}/p/${problem.pid}`);
    return { ok: true };
  } catch (err) {
    return unexpectedError("addSolution", err);
  }
}

export async function editSolution(
  solutionId: number,
  text: string,
): Promise<ActionResponse> {
  const input = parseInput(editSolutionSchema, { solutionId, text });
  if (!input.ok) {
    return input;
  }
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

    revalidatePath(
      `/c/${solution.problem.collection.cid}/p/${solution.problem.pid}`,
    );
    return { ok: true };
  } catch (err) {
    return unexpectedError("editSolution", err);
  }
}
