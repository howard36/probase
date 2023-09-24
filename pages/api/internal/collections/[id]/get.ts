import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.secret !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({
      error: {
        message: `You need an API key to access this endpoint`
      }
    });
  }

  const idString = req.query.id as string;
  let where;
  if (isNonNegativeInt(idString)) {
    where = { id: parseInt(idString) };
  } else {
    where = { cid: idString };
  }

  try {
    const collection = await prisma.collection.findUnique({
      where,
    });

    if (collection === null) {
      return res.status(404).json({
        error: {
          message: `No collection with id ${idString}`
        }
      });
    }

    res.status(200).json({collection});
  } catch (error) {
    handleApiError(error, res);
  }
}
