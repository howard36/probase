import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { handleApiError } from '@/utils/error';
import { isNonNegativeInt } from '@/utils/utils';
import { canAddComment } from '@/utils/permissions';
import { revalidateTags } from '@/utils/revalidate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: why can't this be PUT? Something about CORS
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Invalid method'
      }
    });
  }

  // TODO: validation
  // TODO: check if author.collection matches collection
  const { problemId, text } = req.body;

  if (!isNonNegativeInt(problemId)) {
    return res.status(400).json({
      error: {
        message: 'problemId must be a non-negative integer'
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
    // Get solution
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        pid: true,
        collection: {
          select: {
            id: true,
          }
        }
      }
    });
    if (problem === null) {
      return res.status(404).json({
        error: {
          message: 'Problem not found'
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
    if (!canAddComment(permission)) {
      // No permission
      return res.status(403).json({
        error: {
          message: 'You do not have permission to comment on this problem'
        }
      });
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        problem: {
          connect: { id: problemId },
        },
        user: {
          connect: { id: userId },
        },
      }
    });

    await revalidateTags([
      `GET /problems/${problemId}`,
      `GET /problems/${problem.collection.id}_${problem.pid}`,
    ]);
    res.status(201).json(newComment);
  } catch (error) {
    handleApiError(error, res);
  }
}

