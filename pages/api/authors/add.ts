import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canEditCollection } from '@/utils/permissions'

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

  const collection = { id: req.body.collectionId };
  if (!canEditCollection(session, collection)) {
    res.status(403).json({
      'error': 'You do not have permission to edit this collection'
    });
    return;
  }

  const newAuthor = await prisma.author.create({
    data: {
      ...req.body, // Don't do this, can overwrite other fields without permission
      userId: session.user_id, // TODO: admin should be able to create authors for anyone, not just self
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

