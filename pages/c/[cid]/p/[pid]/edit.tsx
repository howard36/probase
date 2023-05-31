import Head from 'next/head';
import Sidebar from '@/components/sidebar';
import ProblemForm from '@/components/problem-form';
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

// TODO: handle null params
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
    collection,
    problem,
  };

  return {
    props
  };
}

export default function ProblemEdit({ collection, problem }: Props) {
  const subjects = [
    "Algebra",
    "Combinatorics",
    "Geometry",
    "Number Theory",
  ];
  console.log(problem.solutions[0].text)

  // TODO: change indigo accent color
  // TODO: second Head causes a warning
  return (
    <Sidebar>
      <Head>
        <title>{collection.name} - New Problem</title>
      </Head>
      <ProblemForm collection={collection} problem={problem}/>
    </Sidebar>
  );
}

