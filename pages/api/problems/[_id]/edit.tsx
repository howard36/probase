import clientPromise from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'

// TODO: add permissions for API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  const { _id } = req.query;

  const { title, subject, statement, answer, solution } = req.body;

  const client = await clientPromise;
  await client.db().collection('problems').updateOne(
    { _id: { $oid: _id } },
    {
      $set: {
        title,
        subject,
        statement,
        answer,
        solutions: [solution], // TODO: multiple solutions
      }
    }
  )

  res.status(200).json({'msg': 'updated'});
}

