import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canAddProblem } from '@/utils/permissions';
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';
import { Subject } from '@prisma/client';

const subjectPrefix = {
  'Algebra': 'A',
  'Combinatorics': 'C',
  'Geometry': 'G',
  'NumberTheory': 'N',
};

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

  let { collectionId, pid, title, subject, statement, answer, solutionText, authorId, difficulty, isAnonymous } = req.body;

  if (!isNonNegativeInt(collectionId)) {
    return res.status(400).json({
      error: {
        message: 'collectionId must be a non-negative integer'
      }
    });
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId,
      }
    }
  });
  if (permission === null || !canAddProblem(permission.accessLevel)) {
    // No permission
    return res.status(403).json({
      error: {
        message: 'You do not have permission to edit this collection'
      }
    });
  }

  // assign PID based on existing problems
  // blank PID = calculate by calling function
  if (pid === undefined) {
    const prefix = subjectPrefix[subject as Subject];

    // The most recent problem in this subject
    const lastProblem = await prisma.problem.findFirst({
      where: {
        collectionId,
        pid: {
          startsWith: prefix
        },
      },
      orderBy: {
        id: 'desc'
      },
      select: {
        pid: true,
      },
    });

    if (lastProblem === null) {
      // first problem in this subject
      pid = prefix + '1';
    } else {
      const oldPid = lastProblem.pid;
      const num = oldPid.substring(prefix.length);
      const incrementedNum = parseInt(num, 10) + 1;
      pid = prefix + incrementedNum;
    }
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
          connect: { id: session.userId }
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

