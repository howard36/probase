import clientPromise from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'

// TODO: add permissions for API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  const { _id } = req.query;
  const { pid, title, subject, statement, answer, solution } = req.body;

  // TODO: assign PID based on existing problems
  // TODO: PID should be given as input, and calculated by calling function
  const problem = {
    pid,
    title,
    subject,
    statement,
    answer,
    solutions: [solution], // TODO: multiple solutions
    authors: [], // TODO: authors
    collection_id: { $oid: _id },
  };

  const client = await clientPromise;
  // TODO: handle insertOne error response
  const inserted_id = await client.db().collection('problems').insertOne(problem);

  if (inserted_id) {
    res.status(201).json({inserted_id});
  } else {
    res.status(500).json({'error': 'Failed to add problem'});
  }
}

