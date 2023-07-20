import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import type { Session } from "next-auth"

function getFullName(session: Session): string {
  if (session.fullName) {
    return session.fullName;
  } else {
    return `${session.givenName} ${session.familyName}`;
  }
}

async function getOrCreateAuthor(session: Session, collectionId: number): Promise<number> {
  // Find if the user has an author for this collection
  let author = session.authors.find(author => author.collectionId === collectionId);
  if (author) {
    return author.id;
  }

  // No existing author found, so create new author and update token and session
  const fullName = getFullName(session);
  const newAuthor = await prisma.author.create({
    data: {
      displayName: fullName, // TODO: currently uses real name by default
      userId: session.user_id,
      // user: {
      //   connect: { id: session.user_id }
      // },
      collectionId,
    }
  });

  // TODO: update token and session with new author info
  return newAuthor.id;
}

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

  const collectionId = parseInt(req.query.id as string);
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      cid: true
    }
  });

  if (collection === null) {
    res.status(404).json({
      'error': `Collection with id ${collectionId} not found`
    });
    return;
  }

  const cid = collection.cid;
  if (!session.collectionPerms.some(perm => perm.cid === cid)) {
    res.status(403).json({
      'error': 'You do not have permission to edit this collection'
    });
    return;
  }

  // TODO: add isAnonymous to api
  const { title, subject, statement, answer, solutionText } = req.body;

  let pid = req.body.pid;
  if (pid === undefined) {
    pid = 'P' + Math.ceil(Math.random() * 10000); // TODO
  }

  const author_id = await getOrCreateAuthor(session, collectionId);

  // const submitterId = session.user_id;

  // TODO: assign PID based on existing problems
  // PID should be optional in input
  // blank PID = calculate by calling function
  // should this be in the problem form component?

  const result = await prisma.problem.create({
    data: {
      collection: {
        connect: { id: collectionId }
      },
      pid,
      title,
      subject,
      statement,
      answer,
      likes: 0,
      difficulty: 0,
      isAnonymous: false,
      submitter: {
        connect: { id: session.user_id }
      },
      authors: {
        connect: { id: author_id }
      },
      solutions: {
        create: [{
          text: solutionText,
          authors: {
            connect: { id: author_id }
          }
        }]
      },
    }
  });

  // TODO: properly handle creation error
  // should be try-catch instead
  if (result) {
    res.status(201).json({insertedPid: pid});
  } else {
    res.status(500).json({'error': 'Failed to add problem'});
  }
}

