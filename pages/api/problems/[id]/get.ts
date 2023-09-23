import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { canEditProblem } from '@/utils/permissions'
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

  try {
    // Get problem
    const problemId = parseInt(idString);
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        collection: {
          select: {
            id: true,
            cid: true,
          }
        },
        authors: {
          select: { id: true }
        },
      }
    });

    if (problem === null) {
      return res.status(404).json({
        error: {
          message: `No problem with id ${problemId}`
        }
      });
    }

    if (problem.collection.cid !== "demo") {
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

      const collectionId = problem.collection.id;
      const permission = await prisma.permission.findUnique({
        where: {
          userId_collectionId: {
            userId,
            collectionId,
          }
        }
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
        return res.status(403).json({
          error: {
            message: 'You do not have permission to edit this problem'
          }
        });
      }
    }

    const { title, statement, answer, source, isAnonymous } = req.body;

    const updatedProblem = await prisma.problem.update({
      where: { id: problemId },
      data: {
        title,
        statement,
        answer,
        source,
        isAnonymous,
      }
    });

    res.status(200).json(updatedProblem);
  } catch (error) {
    handleApiError(error, res);
  }
}