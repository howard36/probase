import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canEditCollection } from '@/utils/permissions';
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';

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

  let { collectionId, pid, title, subject, statement, answer, solutionText, authorId, difficulty, isAnonymous } = req.body;

  if (!isNonNegativeInt(collectionId)) {
    return res.status(400).json({
      error: {
        message: 'collectionId must be a non-negative integer'
      }
    });
  }

  const collection = { id: parseInt(collectionId) };
  if (!canEditCollection(session, collection)) {
    return res.status(403).json({
      error: {
        message: 'You do not have permission to edit this collection'
      }
    });
  }

  // TODO: assign PID based on existing problems
  // PID should be optional in input
  // blank PID = calculate by calling function
  // should this be in the problem form component?
  if (pid === undefined) {
    pid = 'P' + Math.ceil(Math.random() * 10000); // TODO
  }

  try {
    // TODO: solution should probably be in separate API
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
        difficulty,
        isAnonymous,
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
              connect: { id: authorId } // TODO: solution might have different list of authors
            }
          }]
        },
      }
    });

    res.status(201).json(newProblem);
  } catch (error) {
    handleApiError(error, res);
  }
}

