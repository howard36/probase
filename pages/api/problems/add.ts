import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/utils/prisma'
import { canAddProblem } from '@/utils/permissions';
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';
import { Subject } from '@prisma/client';
import { revalidateTags } from '@/utils/revalidate';

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

  // TODO: validation
  // TODO: check if author.collection matches collection
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
    return res.status(500).json({
      error: {
        message: "userId is undefined despite being logged in"
      }
    });
  }

  try {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (collection === null) {
      return res.status(404).json({
        error: {
          message: `No collection with id ${collectionId}`
        }
      });
    }

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId,
        }
      }
    });
    if (!canAddProblem(permission)) {
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
      if (!(subject in subjectPrefix)) {
        return res.status(500).json({
          error: {
            message: 'subject must be one of Algebra, Combinatorics, Geometry, or Number Theory'
          }
        });
      }
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
        solutions: (solutionText === undefined) ? undefined : {
          create: [{
            text: solutionText,
            authors: {
              connect: { id: authorId } // TODO: solution might have different list of authors
            }
          }]
        },
        likes: {
          create: {
            user: {
              connect: {
                id: session.userId,
              }
            }
          }
        }
      }
    });

    await revalidateTags([
      `GET /collections/${collection.id}/problems`,
      `GET /collections/${collection.cid}/problems`,
      `GET /problems/${newProblem.id}`,
      `GET /problems/${collectionId}_${pid}`,
    ]);
    res.status(201).json(newProblem);
  } catch (error) {
    handleApiError(error, res);
  }
}
