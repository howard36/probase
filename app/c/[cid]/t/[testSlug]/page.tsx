import { cache } from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TestPage from "./test-page";
import { requireCollectionAccess } from "@/lib/collection-access";

interface Params {
  cid: string;
  testSlug: string;
}

/** The test's id from the end of its address, as in "mock-aime-12". */
function parseTestId(testSlug: string): number | null {
  const idStr = testSlug.split("-").pop() ?? "";
  const id = Number(idStr);
  // Postgres integers stop at 2^31 - 1.
  return /^\d+$/.test(idStr) && id >= 1 && id <= 2147483647 ? id : null;
}

// Cached per request, so the page and its title share one check.
const getTest = cache(async function (cid: string, testSlug: string) {
  const access = await requireCollectionAccess(cid, `/c/${cid}/t/${testSlug}`);
  const testId = parseTestId(testSlug);
  const test =
    testId === null
      ? null
      : await prisma.test.findUnique({ where: { id: testId } });
  if (test === null || test.collectionId !== access.collection.id) {
    notFound();
  }
  return { ...access, test };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { cid, testSlug } = await params;
  const { test, collection } = await getTest(cid, testSlug);
  return { title: `${test.name} · ${collection.name}` };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { cid, testSlug } = await params;
  const { userId, collection, permission, authors, test } = await getTest(
    cid,
    testSlug,
  );

  const solveAttempts = await prisma.solveAttempt.findMany({
    where: { userId },
  });

  const testProblems = await prisma.testProblem.findMany({
    where: {
      testId: test.id,
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
      collection={collection}
      solveAttempts={solveAttempts}
      permission={permission}
      authors={authors}
    />
  );
}
