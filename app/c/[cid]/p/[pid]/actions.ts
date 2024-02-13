'use server'

import { canAddComment, canAddSolution, canEditProblem, canEditSolution, canViewCollection } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { error } from "@/lib/server-actions";
import { Prisma } from "@prisma/client";
import { auth } from "auth";
import { revalidateTag } from "next/cache";

export async function likeProblem(problemId: number, like: boolean) {
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

    const session = await auth();
    if (session === null) {
      return error("Not signed in");
    }

    const userId = session.userId;
    if (userId === undefined) {
      return error("userId is undefined despite being logged in");
    }

    const collectionId = problem.collection.id;
    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId,
        },
      },
    });
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
    } else if (like === false) {
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
          return error(String(err));
        }
      }
    } else {
      return error(`like must be a boolean, but got ${like}`);
    }

    revalidateTag(`problem/${problem.collection.cid}_${problem.pid}`);
  } catch (err) {
    return error(String(err));
  }
}

interface Data {
  title?: string;
  statement?: string;
  answer?: string;
  isArchived?: boolean;
}

export async function editProblem(problemId: number, data: Data) {
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

    if (problem.collection.cid !== "demo") {
      const session = await auth();
      if (session === null) {
        return error("Not signed in");
      }

      const userId = session.userId;
      if (userId === undefined) {
        return error("userId is undefined despite being logged in");
      }

      const collectionId = problem.collection.id;
      const permission = await prisma.permission.findUnique({
        where: {
          userId_collectionId: {
            userId,
            collectionId,
          },
        },
      });
      const authors = await prisma.author.findMany({
        where: {
          userId,
          collectionId,
        },
        select: { id: true },
      });
      if (!canEditProblem(problem, permission, authors)) {
        // No permission
        return error("You do not have permission to edit this problem");
      }
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
  } catch (err) {
    return error(String(err));
  }
}

export async function addComment(problemId: number, text: string) {
  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in")
  }

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

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: problem.collection.id,
        },
      },
    });
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
    return error(String(err))
  }
}

export async function startTestsolve(problemId: number) {
  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in")
  }

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

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: problem.collection.id,
        },
      },
    });
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
    return error(String(err))
  }
}

const BUFFER_TIME_MILLIS = 10_000;

export async function submitTestsolve(problemId: number, answer: string) {
  const submittedAt = new Date();

  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in")
  }

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

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: problem.collection.id,
        },
      },
    });
    // TODO: use canTestsolveProblem
    if (!canViewCollection(permission)) {
      return error("You do not have permission to edit this collection");
    }

    const difficulty = problem.difficulty;
    if (difficulty === null) {
      return error("Problem difficulty should not be null");
    }
    const testsolveTimeMinutes = difficulty * 5 + 5; // 10, 15, 20, 25, 30
    const testsolveTimeMillis =
      testsolveTimeMinutes * 60 * 1000 + BUFFER_TIME_MILLIS;

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

    const deadline = new Date(
      solveAttempt.startedAt.getTime() + testsolveTimeMillis,
    );
    if (submittedAt >= deadline || solveAttempt.gaveUp) {
      return error("Tried to submit after testsolve finished");
    }

    const correct = answer === problem.answer;

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

    return { ok: true, correct };
  } catch (err) {
    return error(String(err))
  }
}

export async function giveUpTestsolve(problemId: number) {
  const submittedAt = new Date();

  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in")
  }

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

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: problem.collection.id,
        },
      },
    });
    // TODO: use canTestsolveProblem
    if (!canViewCollection(permission)) {
      return error("You do not have permission to edit this collection");
    }

    const difficulty = problem.difficulty;
    if (difficulty === null) {
      return error("Problem difficulty should not be null");
    }
    const testsolveTimeMinutes = difficulty * 5 + 5; // 10, 15, 20, 25, 30
    const testsolveTimeMillis =
      testsolveTimeMinutes * 60 * 1000;

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

    const deadline = new Date(
      solveAttempt.startedAt.getTime() + testsolveTimeMillis,
    );
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
    return error(String(err))
  }
}

export async function addSolution(problemId: number, text: string, authorId: number) {
  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in")
  }

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });
    if (problem === null) {
      return error("Problem not found");
    }

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: problem.collectionId,
        },
      },
    });
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
    return error(String(err))
  }
}

export async function editSolution(solutionId: number, text: string) {
  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in")
  }

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

    const collectionId = solution.problem.collection.id
    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId,
        },
      },
    });
    const authors = await prisma.author.findMany({
      where: {
        userId,
        collectionId,
      },
      select: { id: true },
    });
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
    return error(String(err))
  }
}
