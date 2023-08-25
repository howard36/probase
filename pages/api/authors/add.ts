import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canAddProblem, canEditCollection, isAdmin } from '@/utils/permissions'
import { handleApiError } from '@/utils/error'
import { isNonNegativeInt } from '@/utils/utils'

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
  // 400 response code
  const { collectionId, userId, displayName, country } = req.body;

  if (!isNonNegativeInt(collectionId)) {
    return res.status(400).json({
      error: {
        message: 'collectionId must be a non-negative integer'
      }
    });
  }

  const callerUserId = session.userId;
  if (callerUserId === undefined) {
    return res.status(500).json({
      error: {
        message: "callerUserId is undefined despite being logged in"
      }
    });
  }

  try {
    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId: callerUserId,
          collectionId,
        }
      }
    });
    if (permission === null || !canAddProblem(permission.accessLevel)) {
      // No permission
      return res.status(403).json({
        error: {
          message: 'You do not have permission to add a new problem'
        }
      });
    }

    // TODO: what if someone wants to submit a joint-author problem?
    // The second author might not have an account,
    // or might not have submitted a problem (meaning no author was created)
    // Solution: allow submitting on behalf of someone else,
    // but if submitter is not one of the authors,
    // include "(Submitted by X)" underneath "Written by Y"
    const collection = { id: collectionId };
    if (!isAdmin(session, collection) && userId !== session.userId) {
      return res.status(403).json({ 
        error: {
          message: 'You can only create authors associated with your own account'
        }
      });
    }

    const newAuthor = await prisma.author.create({
      data: {
        collectionId,
        userId,
        displayName,
        country,
      }
    });

    res.status(201).json(newAuthor);
  } catch (error) {
    handleApiError(error, res);
  }
}
