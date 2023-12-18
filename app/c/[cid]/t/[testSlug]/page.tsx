import prisma from "@/utils/prisma";
import { notFound, redirect } from "next/navigation";
import TestPage from "./test-page";
// import type { AuthorProps, Params, Props } from './types'
// import { problemInclude, collectionSelect, permissionSelect } from './types'
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]";
import { canViewCollection } from "@/utils/permissions";
import { AccessLevel, Author, SolveAttempt } from "@prisma/client";

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
    }
  });
  if (test === null) {
    notFound();
  }


  let userId = null;
  const session = await getServerSession(authOptions);
  if (session === null) {
    if (cid !== "demo") {
      redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}%2Ft%2F${testSlug}`);
    }
  } else {
    userId = session.userId;
    if (userId === undefined) {
      throw new Error("userId is undefined despite being logged in");
    }
  }


  let permission = null;
  if (userId !== null) {
    permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: test.collectionId,
        },
      },
      select: {
        accessLevel: true,
      }
    });
  } else if (cid === "demo") {
    permission = {
      accessLevel: "TeamMember" as AccessLevel,
    }
  }

  let solveAttempts: SolveAttempt[] = [];
  let authors: { id: number }[] = [];
  if (userId !== null) {
    if (!canViewCollection(permission)) {
      redirect("/need-permission");
    }
    solveAttempts = await prisma.solveAttempt.findMany({
      where: { userId }
    });
    authors = await prisma.author.findMany({
      where: {
        userId,
        collectionId: test.collectionId,
      },
      select: { id: true },
    });
  }

  const testProblems = await prisma.testProblem.findMany({
    where: {
      testId,
    },
    include: {
      problem: {
        include: {
          authors: {
            select: {
              id: true
            }
          }
        }
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
