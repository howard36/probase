import prisma from '@/utils/prisma'
import { Problem, Collection, Solution, Author, Subject } from '@prisma/client'
import { notFound } from 'next/navigation'
import ProblemPage from './problem-page'
import type { Session } from 'next-auth'
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"

interface Params {
  cid: string;
  pid: string;
}

export async function generateStaticParams() {
  if (process.env.NO_WIFI === "true") {
    return [
      {
        cid: "cmimc",
        pid: "A1",
      }
    ];
  }
  const all_problems = await prisma.problem.findMany({
    select: {
      collection: {
        select: {
          cid: true,
        }
      },
      pid: true,
    }
  });

  const params: Params[] = all_problems.map((problem) => ({
    cid: problem.collection.cid,
    pid: problem.pid,
  }));

  return params;
};

interface SolutionWithAuthor extends Solution {
  authors: Pick<Author, 'displayName'>[];
}

interface ProblemWithSolution extends Problem {
  authors: Pick<Author, 'id' | 'displayName'>[];
  solutions: SolutionWithAuthor[];
}

interface Props {
  collection: Collection;
  problem: ProblemWithSolution;
}

// TODO: params can be null, but the type does not reflect that
async function getProblem(params: Params) {
  // console.log("running getStaticProps for", params)
  if (process.env.NO_WIFI === "true") {
    return {
      problem: {
        id: 1,
        collectionId: 1,
        pid: 'A1',
        title: 'Quadratic Equation',
        subject: 'Algebra' as Subject,
        statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        answer: '$2 \\pm \\sqrt{2}$',
        authors: [{
          id: 1,
          displayName: 'Howard',
        }],
        solutions: [
          {
            id: 1,
            summary: '',
            problemId: 1,
            text: 'Use the quadratic formula to get\n$$x = \\frac{4 \\pm \\sqrt{4^2 - 4 \\cdot 1 \\cdot 2}}{2} = 2 \\pm \\sqrt{2}$$',
            authors: [
              {
                displayName: 'Howard',
              }
            ]
          }
        ],
        submitterId: 'user id goes here',
        likes: 12,
        difficulty: 3,
        source: '',
        isAnonymous: false,
      },
      collection: {}
    }
  }

  // TODO: save list of (collection id, cid) pairs in token permissions,
  // so that we can avoid this extra DB call
  const collection = await prisma.collection.findUnique({
    where: { cid: params.cid }
  });

  if (collection === null) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: {
      collectionId_pid: {
        collectionId: collection.id,
        pid: params.pid,
      }
    },
    include: {
      authors: {
        select: {
          id: true,
          displayName: true,
        }
      },
      solutions: {
        include: {
          authors: {
            select: {
              displayName: true,
            }
          },
        }
      }
    },
  });

  if (problem === null) {
    notFound();
  }

  const props: Props = {
    problem,
    collection,
  }

  return props;
};

function hasProblemEditPerms(session: Session | null, problem: ProblemWithSolution): boolean {
  if (session === null) {
    return false;
  }
  const authorIds1 = session.authors.map(author => author.id);
  const authorIds2 = problem.authors.map(author => author.id);
  return authorIds1?.some(id => authorIds2?.includes(id));
}

export default async function ProblemDetails({
  params
}: {
  params: Params
}) {
  let { problem, collection } = await getProblem(params);
  // const session = await getServerSession(authOptions);
  // const canEdit = hasProblemEditPerms(session, problem);
  // const canEdit = false;

  return <ProblemPage problem={problem} />;
}
