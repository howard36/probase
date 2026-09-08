import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import TestPage from "./test-page";
import { requireCurrentUser } from "@/lib/current-user";
import { getAuthorIds, getPermission } from "@/lib/collection-access";
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

  const { userId } = await requireCurrentUser(`/c/${cid}/t/${testSlug}`);

  const permission = await getPermission(userId, test.collectionId);
  if (permission === null || !canViewCollection(permission)) {
    redirect("/need-permission");
  }

  const solveAttempts = await prisma.solveAttempt.findMany({
    where: { userId },
  });
  const authors = await getAuthorIds(userId, test.collectionId);

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
