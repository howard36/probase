import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { canEditProblem } from '@/utils/permissions'

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

  // Get problem
  const problemId = parseInt(req.query.id as string);
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: {
      collectionId: true,
      authors: {
        select: { id: true }
      }
    }
  });

  if (problem === null) {
    res.status(404).json({
      'error': `No problem with id ${problemId}`
    });
    return;
  }

  if (!canEditProblem(session, problem)) {
    res.status(403).json({
      'error': 'You do not have permission to edit this problem'
    });
    return;
  }

  await prisma.problem.update({
    where: { id: problemId },
    data: req.body,
  })

  res.status(200).json({'msg': 'updated'});
}

