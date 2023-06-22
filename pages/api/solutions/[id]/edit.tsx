import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

// TODO: add permissions for API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  // TODO: handle invalid id
  const id = Number(req.query.id);

  // TODO: multiple authors per solution
  await prisma.solution.update({
    where: { id },
    data: req.body,
  })

  res.status(200).json({'msg': 'updated'});
}

