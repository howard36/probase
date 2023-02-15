import { insertOne } from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { _id } = req.query;

  if (req.method === 'POST') {
    // Process a POST request
    const { title, statement, subject, answer, solution } = req.body;

    // TODO: assign PID based on existing problems
    const pid = 'G1';
    const problem = {
      pid,
      title,
      subject,
      statement,
      answer,
      solutions: [solution],
      authors: [],
      collection_id: { $oid: _id },
    };

    // TODO: handle insertOne error response
    await insertOne("problems", { document: problem });

    res.status(201).json({'msg': 'created'});
  } else {
    // Handle any other HTTP method
  }
}

