import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import TestPage from "./test-page";
import { auth } from "auth";
import { canViewCollection } from "@/lib/permissions";

interface Params {
  cid: string;
  testSlug: string;
}

export default async function Page({ params }: { params: Params }) {
  const { cid, testSlug } = params;
  const testIdStr = testSlug.split("-").pop();
  if (testIdStr === undefined) {
    return;
  }
  const testId = parseInt(testIdStr);

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      collection: true,
    },
  });
  if (test === null) {
    notFound();
  }

  const session = await auth();
  if (session === null) {
    redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}%2Ft%2F${testSlug}`);
  }
  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId: test.collectionId,
      },
    },
    select: {
      accessLevel: true,
    },
  });
  if (permission === null || !canViewCollection(permission)) {
    redirect("/need-permission");
  }

  const solveAttempts = await prisma.solveAttempt.findMany({
    where: { userId },
  });
  const authors = await prisma.author.findMany({
    where: {
      userId,
      collectionId: test.collectionId,
    },
    select: { id: true },
  });

  const testProblems = await prisma.testProblem.findMany({
    where: {
      testId,
    },
    include: {
      problem: {
        include: {
          authors: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  return (
    <TestPage
      name={test.name}
      testProblems={testProblems}
      collection={test.collection}
      solveAttempts={solveAttempts}
      permission={permission}
      authors={authors}
    />
  );
}
