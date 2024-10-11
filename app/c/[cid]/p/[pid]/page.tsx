import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ProblemPage from "./problem-page";
import {
  problemInclude,
  type AuthorProps,
  type Params,
  type Props,
} from "./types";
import { canViewCollection } from "@/lib/permissions";
import { AccessLevel, TestsolverType } from "@prisma/client";
import { auth } from "auth";
import { parseFilter } from "@/lib/filter";

// TODO: params can be null, but the type does not reflect that
async function getProps(params: Params, userId: string | null): Promise<Props> {
  const { cid, pid } = params;

  const collection = await prisma.collection.findUnique({
    where: { cid },
  });
  if (collection === null) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: {
      collectionId_pid: {
        collectionId: collection.id,
        pid,
      },
    },
    include: problemInclude,
  });
  if (problem === null) {
    notFound();
  }

  if (userId === null) {
    if (collection.cid !== "demo") {
      throw new Error("null userId on non-demo problem page");
    }
    const permission = {
      accessLevel: "TeamMember" as AccessLevel,
      testsolverType: "Casual" as TestsolverType,
      seriousTestsolverStartedAt: null,
    };
    const authors: AuthorProps[] = [];
    const props: Props = {
      problem,
      collection,
      permission,
      authors,
      userId: "",
    };
    return props;
  }

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
    // No permission to view this page
    redirect("/need-permission");
  }

  const authors = await prisma.author.findMany({
    where: {
      userId,
      collectionId: collection.id,
    },
    select: { id: true },
  });

  const props: Props = {
    problem,
    collection,
    permission,
    authors,
    userId,
  };

  return props;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { cid, pid } = params;
  const filter = parseFilter(searchParams);
  const session = await auth();
  if (session === null) {
    // Not logged in
    if (cid === "demo") {
      const props: Props = await getProps(params, null);
      return <ProblemPage {...props} filter={filter} />;
    } else {
      redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}%2Fp%2F${pid}`);
    }
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  const props: Props = await getProps(params, userId);

  return <ProblemPage {...props} filter={filter} />;
}
