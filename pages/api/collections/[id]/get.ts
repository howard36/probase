import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { canViewCollection } from '@/utils/permissions'
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

    if (collection.cid !== "demo") {
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

      const collectionId = collection.id;
      const permission = await prisma.permission.findUnique({
        where: {
          userId_collectionId: {
            userId,
            collectionId,
          }
        }
      });
      if (!canViewCollection(permission)) {
        // No permission
        return res.status(403).json({
          error: {
            message: 'You do not have permission to view this collection'
          }
        });
      }
    }

    res.status(200).json({collection});
  } catch (error) {
    handleApiError(error, res);
  }
}
