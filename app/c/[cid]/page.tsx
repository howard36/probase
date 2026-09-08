import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { canViewCollection } from "@/lib/permissions";
import ProblemList from "./problem-list";
import { Collection, Problem } from "@prisma/client";
import { ProblemProps } from "./types";
import { auth } from "auth";
import { parseFilter } from "@/lib/filter";

async function getCollection(cid: string): Promise<Collection> {
  const collection = await prisma.collection.findUnique({
    where: { cid },
  });
  if (collection === null) {
    notFound();
  }
  return collection;
}

function sortByNew(p1: Problem, p2: Problem): number {
  const t1 = p1.createdAt;
  const t2 = p2.createdAt;
  if (t1 !== t2) {
    return t1 > t2 ? -1 : 1;
  } else {
    return p1.id > p2.id ? -1 : 1;
  }
}

async function getProblems(collection: Collection): Promise<ProblemProps[]> {
  const problems = await prisma.problem.findMany({
    where: { collectionId: collection.id },
    orderBy: [
      {
        solveAttempts: {
          _count: "asc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
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
  searchParams: { page?: string; subject?: string };
}) {
  const { cid } = params;
  const filter = parseFilter(searchParams);
  const collection = await getCollection(cid);
  const problems = await getProblems(collection);

  // This call is still slow.
  // Private pages must wait for security check
  // Public pages can show the problems immediately, and stream personalized data as the page loads
  const session = await auth();

  if (session === null) {
    // Not logged in
    redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}`);
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  const authors = await prisma.author.findMany({
    where: {
      userId,
      collectionId: collection.id,
    },
    select: { id: true },
  });

  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId: collection.id,
      },
    },
  });

  // canViewCollection already checks for null, but we include it here so TypeScript knows that permission is non-null later in the program
  if (permission === null || !canViewCollection(permission)) {
    // No permission
    redirect("/need-permission");
  }

  if (collection.requireTestsolve && permission.testsolverType === null) {
    redirect(`/c/${cid}/choose-testsolver-type`);
  }

  const solvedAttempts = await prisma.solveAttempt.findMany({
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

  const solvedProblemIds = solvedAttempts.map((attempt) => attempt.problemId);

  return (
    <ProblemList
      collection={collection}
      problems={problems}
      userId={userId}
      permission={permission}
      authors={authors}
      filter={filter}
      solvedProblemIds={solvedProblemIds}
    />
  );
}
