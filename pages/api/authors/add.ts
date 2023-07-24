import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canEditCollection } from '@/utils/permissions'

// function getFullName(session: Session): string {
//   if (session.fullName) {
//     return session.fullName;
//   } else {
//     return `${session.givenName} ${session.familyName}`;
//   }
// }

// // TODO: move this to a separate API.
// // Problem Page submit should call both APIs if no author
// async function getOrCreateAuthor(session: Session, collectionId: number): Promise<number> {
//   // Find if the user has an author for this collection
//   let author = session.authors.find(author => author.collectionId === collectionId);
//   if (author) {
//     return author.id;
//   }

//   // No existing author found, so create new author and update token and session
//   const fullName = getFullName(session);

//   // TODO: update token and session with new author info
//   return newAuthor.id;
// }

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
      userId: session.user_id,
      ...req.body,
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

