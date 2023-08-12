import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { canEditProblem } from '@/utils/permissions'
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: why can't this be PUT? Something to do with CORS
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Invalid method'
      }
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({
      error: {
        message: 'Not signed in'
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
          select: { id: true }
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

    if (!canEditProblem(session, problem, problem.collection)) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to edit this problem'
        }
      });
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
