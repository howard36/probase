// import clientPromise from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

// TODO: add permissions for API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  // TODO: handle invalid id
  const id = Number(req.query._id);

  const { title, subject, statement, answer, solution } = req.body;

  await prisma.problem.update({
    where: { id },
    data: {
      title,
      subject,
      statement,
      answer,
      solutions: {
        update: [
          {
            where: { id: 1 }, // TODO: hardcoded
            data: { text: solution },
          }
        ]
      }
    }
  })

  res.status(200).json({'msg': 'updated'});
}

