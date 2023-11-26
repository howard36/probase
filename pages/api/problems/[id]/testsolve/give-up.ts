import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canViewCollection } from '@/utils/permissions';
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const submittedAt = new Date();

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Invalid method'
      }
    });
  }

  const idString = req.query.id as string;
  if (!isNonNegativeInt(idString)) {
    return res.status(400).json({
      error: {
        message: 'ID must be a non-negative integer'
      }
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (session === null) {
    return res.status(401).json({
      error: {
        message: 'Not signed in'
      }
    });
  }

  const userId = session.userId;
  if (userId === undefined) {
    return res.status(500).json({
      error: {
        message: "userId is undefined despite being logged in"
      }
    });
  }

  try {
    const problemId = parseInt(idString);
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
          }
        }
      }
    });
    if (problem === null) {
      return res.status(404).json({
        error: {
          message: `No problem with id ${problemId}`
        }
      });
    }

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: problem.collection.id,
        }
      }
    });
    // TODO: use canTestsolveProblem
    if (!canViewCollection(permission)) {
      // No permission
      return res.status(403).json({
        error: {
          message: 'You do not have permission to edit this collection'
        }
      });
    }

    const difficulty = problem.difficulty;
    if (difficulty === null) {
      return res.status(500).json({
        error: {
          message: 'Problem difficulty should not be null'
        }
      });
    }
    const testsolveTimeMinutes = difficulty * 5 + 5;  // 10, 15, 20, 25, 30
    const testsolveTimeMillis = testsolveTimeMinutes * 60 * 1000;

    const solveAttempt = await prisma.solveAttempt.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: problem.id,
        }
      }
    });
    if (solveAttempt === null) {
      return res.status(400).json({
        error: {
          message: 'Tried to submit before starting testsolve'
        }
      });
    }

    const deadline = new Date(solveAttempt.startedAt.getTime() + testsolveTimeMillis);
    if (submittedAt >= deadline || solveAttempt.gaveUp) {
      return res.status(400).json({
        error: {
          message: 'Tried to submit after testsolve finished'
        }
      });
    }

    await prisma.solveAttempt.update({
      where: {
        userId_problemId: {
          userId,
          problemId,
        }
      },
      data: {
        gaveUp: true,
      }
    });

    res.status(200).json({});
  } catch (error) {
    handleApiError(error, res);
  }
}
