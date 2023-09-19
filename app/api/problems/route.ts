import prisma from '@/utils/prisma'

// Add a new problem
export async function POST(
  request: Request,
) {
  let { collectionId, pid, title, subject, statement, answer, solutionText, authorId, difficulty, isAnonymous } = await request.json();

  // TODO: https://github.com/nextauthjs/next-auth/issues/7423
  const session = await getServerSession(req, res, authOptions);
  if (session === null) {
    return res.status(401).json({
      error: {
        message: 'Not signed in'
      }
    });
  }

  const newProblem = await prisma.problem.create({
    data: {
      collection: {
        connect: { id: collectionId }
      },
      pid,
      title,
      subject,
      statement,
      answer,
      difficulty,
      isAnonymous,
      submitter: {
        connect: { id: session.userId }
      },
      authors: {
        connect: { id: authorId }
      },
    }
  });
  if (newProblem === null) {
    return Response.json({}, { status: 500 });
  }
  return Response.json({ newProblem });
}

