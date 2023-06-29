import prisma from '@/utils/prisma'
import { Problem, Collection, Solution, Author } from '@prisma/client'
import { notFound } from 'next/navigation'
import ProblemPage from './problem-page'

interface Params {
  cid: string;
  pid: string;
}

interface Path {
  params: Params;
}

export async function generateStaticParams() {
  // return {
  //   paths: [
  //     {
  //       params: {
  //         cid: "cmimc",
  //         pid: "A1",
  //       }
  //     }
  //   ],
  //   fallback: 'blocking'
  // }
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
  solutions: SolutionWithAuthor[];
}

interface Props {
  collection: Collection;
  problem: ProblemWithSolution;
}

// TODO: params can be null, but the type does not reflect that
async function getProblem(params: Params) {
  // console.log("running getStaticProps for", params)
  // return {
  //   props: {
  //     problem: {
  //       id: 1,
  //       statement: 'What is $1+1$?',
  //       answer: 'The answer is $5 + \\frac{3}{4}$',
  //       subject: 'Algebra',
  //       title: 'Addition',
  //       solutions: [
  //         {
  //           text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
  //           authors: [
  //             {
  //               displayName: 'Howard',
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     collection: {
        
  //     }
  //   }
  // }

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

export default async function ProblemDetails({
  params
}: {
  params: Params
}) {
  let { problem, collection } = await getProblem(params);

  return <ProblemPage problem={problem} />;
}
