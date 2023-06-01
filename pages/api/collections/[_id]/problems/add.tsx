import clientPromise from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '@/utils/prisma';
import { connect } from 'http2';

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
  const collectionId = Number(req.query._id);
  // TODO: add isAnonymous to api
  const { pid, title, subject, statement, authors, answer, solutions } = req.body;
  // solutions.forEach(sol => {
  //   sol.authors = sol.authors.map(id => new ObjectId(id));
  // });

  // TODO: assign PID based on existing problems
  // TODO: PID should be given as input, and calculated by calling function
  // const problem = {
  //   pid,
  //   title,
  //   subject,
  //   statement,
  //   authors: authors.map(id => new ObjectId(id)),
  //   answer,
  //   solutions,
  //   collection_id: new ObjectId(_id),
  // };

  // TODO: handle insertOne error response
  // const client = await clientPromise;
  // const result = await client.db().collection('problems').insertOne(problem);
  // const inserted_id = result.insertedId.toHexString();
  console.log({authors, solutions})

  const result = await prisma.problem.create({
    data: {
      collectionId,
      pid,
      title,
      subject,
      statement,
      answer,
      likes: 0,
      difficulty: 0,
      isAnonymous: false,
      authors: {
        connect: authors
      },
      solutions: {
        create: [
          {
            text: solutions[0],
            authors: {
              connect: solutions[0].authors
            }
          }
        ]
      },
      submitterId: authors[0],
    }
  });
  console.log({pid, result});

  if (result) {
    res.status(201).json({inserted_id: result.id});
  } else {
    res.status(500).json({'error': 'Failed to add problem'});
  }
}

