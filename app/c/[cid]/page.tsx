import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProblemList from "./problem-list";
import { Collection, Problem } from "@prisma/client";
import { ProblemProps } from "./types";
import { requireCollectionAccess } from "@/lib/collection-access";
import { applyFilter, filterToString, parseFilter } from "@/lib/filter";

function sortByNew(p1: Problem, p2: Problem): number {
  const t1 = p1.createdAt.getTime();
  const t2 = p2.createdAt.getTime();
  if (t1 !== t2) {
    return t1 > t2 ? -1 : 1;
  } else {
    return p1.id > p2.id ? -1 : 1;
  }
}

async function getProblems(collection: Collection): Promise<ProblemProps[]> {
  const problems = await prisma.problem.findMany({
    where: { collectionId: collection.id },
    include: {
      // TODO: match ProblemProps in [cid]/types
      authors: {
        select: {
          id: true,
        },
      },
      likes: true,
      solveAttempts: {
        select: {
          userId: true,
        },
      },
    },
  });

  problems.sort(sortByNew);

  return problems;
}

interface Params {
  cid: string;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { cid } = params;
  const filter = parseFilter(searchParams);
  const { userId, collection, permission, authors } =
    await requireCollectionAccess(cid, `/c/${cid}`);
  const problems = await getProblems(collection);

  const attempts = await prisma.solveAttempt.findMany({
    where: {
      userId,
      problem: {
        collectionId: collection.id,
      },
    },
    select: {
      problemId: true,
    },
  });
  const attemptedProblemIds = attempts.map((attempt) => attempt.problemId);

  const { page, numPages } = applyFilter(problems, filter, attemptedProblemIds);
  if (filter.page > numPages) {
    redirect(`/c/${cid}${filterToString({ ...filter, page: numPages })}`);
  }

  return (
    <ProblemList
      collection={collection}
      problems={page}
      numPages={numPages}
      userId={userId}
      permission={permission}
      authors={authors}
      filter={filter}
    />
  );
}
