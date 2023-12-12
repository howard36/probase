import prisma from "@/utils/prisma";
import { notFound, redirect } from "next/navigation";
import TestPage from "./test-page";
// import type { AuthorProps, Params, Props } from './types'
// import { problemInclude, collectionSelect, permissionSelect } from './types'
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]";

interface Params {
  cid: string;
  testSlug: string;
}

export default async function Page({ params }: { params: Params }) {
  const { cid, testSlug } = params;
  const session = await getServerSession(authOptions);
  if (session === null) {
    // Not logged in
    if (cid === "demo") {
      return;
      // let props: Props = await getProps(params, null);
      // return <TestPage {...props} />;
    } else {
      redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}%2Ft%2F${testSlug}`);
    }
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  // let props: Props = await getProps(params, userId);

  const testIdStr = testSlug.split("-").pop();
  if (testIdStr === undefined) {
    return;
  }
  const testId = parseInt(testIdStr);

  const test = await prisma.test.findUnique({
    where: {
      id: testId,
    },
  });
  if (test === null) {
    notFound();
  }

  const testProblems = await prisma.testProblem.findMany({
    where: {
      testId,
    },
    include: {
      problem: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  const collection = await prisma.collection.findUnique({
    where: { cid },
  });
  if (collection === null) {
    notFound();
  }

  return (
    <TestPage
      name={test.name}
      testProblems={testProblems}
      collection={collection}
    />
  );
}
