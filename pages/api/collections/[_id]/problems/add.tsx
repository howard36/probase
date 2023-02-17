import clientPromise from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
// import getServerSession from 'next-auth/next';
// import { authOptions } from '../../../auth/[...nextauth]';
import { ObjectId } from 'mongodb';
import { getToken } from "next-auth/jwt"

// TODO: add permissions for API
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  // const session = await getServerSession(req, res, authOptions);
  const token = await getToken({ req })
  if (!token) {
    res.status(401).end();
    return;
  }
  console.log({token});

  const _id = req.query._id as string;
  // TODO: check if user is allowed to add problem
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
    collection_id: new ObjectId(_id),
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

