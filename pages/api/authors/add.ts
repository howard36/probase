import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canEditCollection, isAdmin } from '@/utils/permissions'

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

  // TODO: validation
  const { collectionId, userId, displayName, country } = req.body;

  const collection = { id: collectionId };
  if (!canEditCollection(session, collection)) {
    res.status(403).json({
      'error': 'You do not have permission to edit this collection'
    });
    return;
  }

  // TODO: what if someone wants to submit a joint-author problem?
  // The second author might not have an acccount,
  // or might not have submitted a problem (meaning no author was created)
  // Solution: allow submitting on behalf of someone else,
  // but if submitter is not one of the authors,
  // include "(Submitted by X)" underneath "Written by Y"
  if (!isAdmin(session, collection) && userId !== session.user_id) {
    res.status(403).json({
      'error': 'You can only create authors associated with your own account'
    });
    return;
  }

  const newAuthor = await prisma.author.create({
    data: {
      collectionId,
      userId,
      displayName,
      country,
    }
  });

  // TODO: properly handle creation error
  // should be try-catch instead
  if (newAuthor) {
    res.status(201).json(newAuthor);
  } else {
    res.status(500).json({'error': 'Failed to add author'});
  }
}

