import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { canEditSolution } from '@/utils/permissions'

// TODO: add permissions for API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({'error': 'Not signed in'});
    return;
  }

  // Get solution
  const solutionId = parseInt(req.query.id as string);
  const solution = await prisma.solution.findUnique({
    where: { id: solutionId },
    select: {
      authors: {
        select: { id: true }
      },
      problem: {
        select: { collectionId: true }
      }
    }
  });

  if (solution === null) {
    res.status(404).json({
      'error': `No solution with id ${solutionId}`
    });
    return;
  }

  if (!canEditSolution(session, solution, solution.problem.collectionId)) {
    res.status(403).json({
      'error': 'You do not have permission to edit this solution'
    });
    return;
  }

  // TODO: multiple authors per solution
  await prisma.solution.update({
    where: { id: solutionId },
    data: req.body,
  })

  res.status(200).json({'msg': 'updated'});
}

