import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { handleApiError } from '@/utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Slow DB in permission")

  if (req.query.secret !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({
      error: {
        message: `You need an API key to access this endpoint`
      }
    });
  }

  const [userId, collectionId] = (req.query.uid_colid as string).split('_');

  try {
    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: parseInt(collectionId),
        }
      }
    });
    res.status(200).json({ permission });
  } catch (error) {
    handleApiError(error, res);
  }
}
