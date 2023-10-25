import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canAddSolution } from '@/utils/permissions';
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';
import { revalidateTags } from '@/utils/revalidate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Invalid method'
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

  // TODO: validation
  // TODO: check if author.collection matches problem.collection
  let { problemId, text, summary, authorId } = req.body;

  if (!isNonNegativeInt(problemId)) {
    return res.status(400).json({
      error: {
        message: 'problemId must be a non-negative integer'
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
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
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
          collectionId: problem.collectionId,
        }
      }
    });
    // TODO: use canAddSolution
    if (!canAddSolution(permission)) {
      // No permission
      return res.status(403).json({
        error: {
          message: 'You do not have permission to add a solution'
        }
      });
    }

    // TODO: solution should probably be in separate API
    const newSolution = await prisma.solution.create({
      data: {
        problem: {
          connect: { id: problemId }
        },
        text,
        summary,
        // submitter: {
        //   connect: { id: session.userId }
        // },
        authors: {
          connect: { id: authorId }
        },
      }
    });

    await revalidateTags([
      `GET /problems/${problem.id}`,
      `GET /problems/${problem.collectionId}_${problem.pid}`,
    ]);
    res.status(201).json(newSolution);
  } catch (error) {
    handleApiError(error, res);
  }
}
