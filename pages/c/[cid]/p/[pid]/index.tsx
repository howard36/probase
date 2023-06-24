import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import EditableAnswer from '@/components/editable-answer';
import EditableSolution from '@/components/editable-solution';
import Latex from 'react-latex-next';
import prisma from '@/utils/prisma';
import { Problem, Collection, Solution, Author } from '@prisma/client';
import EditableStatement from '@/components/editable-statement';

interface Params {
  cid: string;
  pid: string;
}

interface Path {
  params: Params;
}

export async function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          cid: "cmimc",
          pid: "A1",
        }
      }
    ],
    fallback: 'blocking'
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

  const paths: Path[] = all_problems.map((problem) => ({
    params: {
      cid: problem.collection.cid,
      pid: problem.pid,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

interface SolutionProps extends Solution {
  authors: Pick<Author, 'displayName'>[];
}

interface ProblemProps extends Problem {
  solutions: SolutionProps[];
}

interface Props {
  collection: Collection;
  problem: ProblemProps;
}

// TODO: params can be null, but the type does not reflect that
export async function getStaticProps({ params }: Path) {
  return {
    props: {
      problem: {
        id: 1,
        statement: 'What is $1+1$?',
        answer: 'The answer is $5 + \\frac{3}{4}$',
        subject: 'Algebra',
        title: 'Addition',
        solutions: [
          {
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
            authors: [
              {
                displayName: 'Howard',
              }
            ]
          }
        ]
      },
      collection: {
        
      }
    }
  }
  if (!params) {
    return {
      notFound: true,
    };
  }

  const collection = await prisma.collection.findUnique({
    where: { cid: params.cid }
  });

  if (collection === null) {
    return {
      notFound: true,
    };
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
    return {
      notFound: true,
    };
  }

  const props: Props = {
    problem,
    collection,
  }

  return {
    props,
    revalidate: 1,
  };
};

export default function ProblemDetails({ collection, problem }: Props) {
  let written_by, answer, solution;
  const sol = problem.solutions[0];
  if (sol.authors.length > 0) {
    written_by = <p className="italic mb-8 text-right">Written by {sol.authors[0].displayName}</p>;
  }
  if (problem.answer) {
    answer = (
      <div className="mb-8">
        <EditableAnswer initialText={problem.answer} problemId={problem.id}/>
      </div>
    );
  }
  if (problem.solutions.length > 0) {
    const sol = problem.solutions[0];
    solution = (
      <div className="mb-8">
        <EditableSolution solution={sol}/>
      </div>
    );
  }

  return (
    <Sidebar>
      <Head>
        <title>{problem.title}</title>
      </Head>
      {/* fixed width container, matching ideal 60-character line length.
      TODO: should be max-width. TODO: extend tailwind to go past w-96 */}
      <div className="w-128 mx-auto my-24">
        <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
        <div className="mb-4">
          <EditableStatement initialText={problem.statement} problemId={problem.id}/>
        </div>
        {written_by}
        {answer}
        {solution}
      </div>
    </Sidebar>
  );
}

