import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]'
import prisma from '@/utils/prisma'

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
      'error': `No collection with id ${collectionId}`
    });
    return;
  }

  // TODO: use util function
  // TODO: cid not needed, can use collectionId instead
  const cid = collection.cid;
  if (!session.collectionPerms.some(perm => perm.cid === cid)) {
    res.status(403).json({
      'error': 'You do not have permission to edit this collection'
    });
    return;
  }

  // TODO: add isAnonymous to api
  const { title, subject, statement, answer, solutionText, authorId } = req.body;

  let pid = req.body.pid;
  if (pid === undefined) {
    pid = 'P' + Math.ceil(Math.random() * 10000); // TODO
  }

  // TODO: assign PID based on existing problems
  // PID should be optional in input
  // blank PID = calculate by calling function
  // should this be in the problem form component?

  const newProblem = await prisma.problem.create({
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
        connect: { id: authorId }
      },
      solutions: {
        create: [{
          text: solutionText,
          authors: {
            connect: { id: authorId }
          }
        }]
      },
    }
  });

  // TODO: properly handle creation error
  // should be try-catch instead
  if (newProblem) {
    res.status(201).json(newProblem);
  } else {
    res.status(500).json({'error': 'Failed to add problem'});
  }
}

