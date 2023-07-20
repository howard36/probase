import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

// TODO: add permissions for API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  // TODO: handle invalid id
  const id = parseInt(req.query.id as string);

  let { solution, ...data } = req.body;

  if (solution !== undefined) {
    data.solutions = {
      update: [
        {
          where: { id }, // TODO: hardcoded
          data: { text: solution },
        }
      ]
    }
  }

  // TODO: multiple solutions, multiple authors per solution
  await prisma.problem.update({
    where: { id },
    data,
  })

  res.status(200).json({'msg': 'updated'});
}

