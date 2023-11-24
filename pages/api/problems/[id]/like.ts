import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client'
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { canViewCollection } from '@/utils/permissions'
import { isNonNegativeInt } from '@/utils/utils';
import { handleApiError } from '@/utils/error';
import { revalidateTags } from '@/utils/revalidate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: why can't this be PUT? Something to do with CORS
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Invalid method'
      }
    });
  }

  const idString = req.query.id as string;
  if (!isNonNegativeInt(idString)) {
    return res.status(400).json({
      error: {
        message: 'ID must be a non-negative integer'
      }
    });
  }

  try {
    // Get problem
    const problemId = parseInt(idString);
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        pid: true,
        collection: {
          select: {
            id: true,
            cid: true,
          }
        },
      }
    });

    if (problem === null) {
      return res.status(404).json({
        error: {
          message: `No problem with id ${problemId}`
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

    const userId = session.userId;
    if (userId === undefined) {
      return res.status(500).json({
        error: {
          message: "userId is undefined despite being logged in"
        }
      });
    }

    const collectionId = problem.collection.id;
    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId,
        }
      }
    });
    if (!canViewCollection(permission)) {
      // No permission
      return res.status(403).json({
        error: {
          message: 'You do not have permission to edit this problem'
        }
      });
    }

    const { like } = req.body;

    if (like === true) {
      await prisma.problemLike.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          }
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    } else if (like === false) {
      try {
        await prisma.problemLike.delete({
          where: {
            userId_problemId: {
              userId,
              problemId,
            }
          }
        })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError  && error?.code === 'P2025') {
          // This error is okay, we're deleting something that doesn't exist.
          // But it's still unexpected, because it shouldn't happen under normal use. So we log it
          console.error(error);
        } else {
          handleApiError(error, res);
        }
      }
    } else {
      return res.status(400).json({
        error: {
          message: `like must be a boolean, but got ${like}`
        }
      });
    }

    const { cid } = problem.collection;
    const { pid } = problem;

    await revalidateTags([
      `GET /collections/${collectionId}/problems`,
      `GET /collections/${cid}/problems`,
      `GET /problems/${problemId}`,
      `GET /problems/${collectionId}_${pid}`,
    ]);
    res.status(200).json({});
  } catch (error) {
    handleApiError(error, res);
  }
}
