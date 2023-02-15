import { updateOne } from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'

// TODO: add permissions for API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  const { _id } = req.query;

  const { title, subject, statement, answer, solution } = req.body;

  // TODO: handle updateOne error response
  updateOne('problems', {
    "filter": { _id: { $oid: _id } },
    "update": {
      "$set": {
        title,
        subject,
        statement,
        answer,
        solutions: [solution], // TODO: multiple solutions
      }
    }
  })

  res.status(200).json({'msg': 'updated'});
}

