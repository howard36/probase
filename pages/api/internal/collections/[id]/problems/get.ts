import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { handleApiError } from '@/utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.secret !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({
      error: {
        message: `You need an API key to access this endpoint`
      }
    });
  }

  const collectionId = parseInt(req.query.id as string);

  try {
    const problems = await prisma.problem.findMany({
      where: { collectionId },
      orderBy: [
        {
          solveAttempts: {
            _count: 'asc'
          }
        },
        {
          createdAt: 'desc'
        },
      ],
      include: {  // TODO: match ProblemProps in [cid]/types
        authors: {
          select: {
            id: true,
          }
        },
        likes: true,
        solveAttempts: {
          select: {
            userId: true,
          }
        },
      }
    });
    res.status(200).json({ problems });
  } catch (error) {
    handleApiError(error, res);
  }
}
