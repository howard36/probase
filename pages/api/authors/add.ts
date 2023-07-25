import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canEditCollection, isAdmin } from '@/utils/permissions'
import { handleApiError } from '@/utils/error'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  // TODO: validation
  // 400 response code
  const { collectionId, userId, displayName, country } = req.body;

  const collection = { id: collectionId };
  if (!canEditCollection(session, collection)) {
    return res.status(403).json({
      error: {
        message: 'You do not have permission to edit this collection'
      }
    });
  }

  // TODO: what if someone wants to submit a joint-author problem?
  // The second author might not have an acccount,
  // or might not have submitted a problem (meaning no author was created)
  // Solution: allow submitting on behalf of someone else,
  // but if submitter is not one of the authors,
  // include "(Submitted by X)" underneath "Written by Y"
  if (!isAdmin(session, collection) && userId !== session.user_id) {
    return res.status(403).json({ 
      error: {
        message: 'You can only create authors associated with your own account'
      }
    });
  }

  try {
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
