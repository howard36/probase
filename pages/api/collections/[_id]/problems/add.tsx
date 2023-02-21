import clientPromise from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';

// TODO: add permissions for API
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  // TODO: fix missing API route!
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401);
    return;
  }

  // TODO: check if user is allowed to add problem
  const _id = req.query._id as string;
  const { pid, title, subject, statement, authors, answer, solutions } = req.body;
  solutions.forEach(sol => {
    sol.authors = sol.authors.map(id => new ObjectId(id));
  });

  // TODO: assign PID based on existing problems
  // TODO: PID should be given as input, and calculated by calling function
  const problem = {
    pid,
    title,
    subject,
    statement,
    authors: authors.map(id => new ObjectId(id)),
    answer,
    solutions,
    collection_id: new ObjectId(_id),
  };

  // TODO: handle insertOne error response
  const client = await clientPromise;
  const result = await client.db().collection('problems').insertOne(problem);
  const inserted_id = result.insertedId.toHexString();

  if (inserted_id) {
    res.status(201).json({inserted_id});
  } else {
    res.status(500).json({'error': 'Failed to add problem'});
  }
}

