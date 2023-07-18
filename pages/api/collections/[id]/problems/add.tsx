import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '@/utils/prisma';

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

  const collectionId = Number(req.query.id);
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
  if (!session.viewColPerms.includes(cid)) {
    res.status(403).json({
      'error': 'You do not have permission to edit this collection'
    });
    return;
  }

  // TODO: add isAnonymous to api
  const { title, subject, statement, authors, answer, solutions } = req.body;

  let pid = req.body.pid;
  if (pid === undefined) {
    pid = 'P' + Math.ceil(Math.random() * 10000); // TODO
  }

  // const submitterId = session.user_id;

  // TODO: assign PID based on existing problems
  // PID should be optional in input
  // blank PID = calculate by calling function
  // should this be in the problem form component?

  const result = await prisma.problem.create({
    data: {
      collection: {
        connect: {
          id: collectionId
        }
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
        connect: {
          id: session.user_id,
        }
      },
      authors: {
        connect: authors.map((id: number) => ({ id }))
      },
      solutions: {
        create: [
          {
            text: solutions[0].text,
            authors: {
              connect: solutions[0].authors
            }
          }
        ]
      },
    }
  });

  // TODO: properly handle creation error
  // should be try-catch instead
  if (result) {
    res.status(201).json({inserted_id: result.id});
  } else {
    res.status(500).json({'error': 'Failed to add problem'});
  }
}

