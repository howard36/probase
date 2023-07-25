import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { canEditSolution } from '@/utils/permissions'
import { handleApiError } from '@/utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: why can't this be PUT? Something about CORS
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
  if (!Number.isInteger(idString)) {
    return res.status(400).json({
      error: {
        message: 'ID must be an integer'
      }
    });
  }

  try {
    // Get solution
    const solutionId = parseInt(idString);
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
      select: {
        authors: {
          select: { id: true }
        },
        problem: {
          select: {
            collection: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (solution === null) {
      return res.status(404).json({
        error: {
          message: `No solution with id ${solutionId}`
        }
      });
    }

    if (!canEditSolution(session, solution, solution.problem.collection)) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to edit this solution'
        }
      });
    }

    const { text, summary } = req.body;

    await prisma.solution.update({
      where: { id: solutionId },
      data: {
        text,
        summary,
      }
    })

    res.status(200).json({'message': 'Successfully updated'});
  } catch (error) {
    handleApiError(error, res);
  }
}

