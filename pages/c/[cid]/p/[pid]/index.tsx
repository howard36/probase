import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import Latex from 'react-latex-next';
import prisma from '@/utils/prisma';
import { Problem, Collection, Solution, Author } from '@prisma/client';

interface Params {
  cid: string;
  pid: string;
}

interface Path {
  params: Params;
}

export async function getStaticPaths() {
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
  let proposed_by, answer, solution;
  const sol = problem.solutions[0];
  if (sol.authors.length > 0) {
    proposed_by = <p className="italic mb-4">Proposed by {sol.authors[0].displayName}</p>;
  }
  if (problem.answer) {
    answer = <p><Latex>{`Answer: ${problem.answer}`}</Latex></p>;
  }
  if (problem.solutions.length > 0) {
    const sol = problem.solutions[0];
    solution = <p><Latex>{`Solution (by ${sol.authors[0].displayName}): ${sol.text}`}</Latex></p>;
  }

  return (
    <Sidebar>
      <Head>
        <title>{problem.title}</title>
      </Head>
      <div className="p-24">
        <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
        <p className="mb-4"><Latex>{problem.statement}</Latex></p>
        {proposed_by}
        {answer}
        {solution}
      </div>
    </Sidebar>
  );
}

