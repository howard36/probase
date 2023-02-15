import { updateOne } from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { _id } = req.query;

  // TODO: should this be PUT?
  if (req.method === 'POST') {
    // Process a POST request
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
          solutions: [solution],
        }
      }
    })

    res.status(200).json({'msg': 'updated'});
  } else {
    // Handle any other HTTP method
  }
}

