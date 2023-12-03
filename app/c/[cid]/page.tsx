import prisma from "@/utils/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]";
import { canViewCollection } from "@/utils/permissions";
import ProblemList from "./problem-list";
import { revalidateTags } from "@/utils/revalidate";
import { internal_api_url } from "@/utils/urls";
import { Collection, Problem } from "@prisma/client";
import { ProblemProps } from "./types";

async function getCollection(cid: string): Promise<Collection> {
  const collection = await prisma.collection.findUnique({
    where: { cid }
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

  if (collection.cid === "demo") {
    problems.forEach((problem) => {
      const date = new Date();
      if (problem.pid === "A1") {
        // Quadratic Equation
        date.setHours(date.getHours() - 24);
        problem.createdAt = date;
      } else if (problem.pid === "N1") {
        // Fermat's Last Theorem
        date.setHours(date.getHours() - 25);
        problem.createdAt = date;
      } else if (problem.pid === "G1") {
        // Edit me!
        date.setHours(date.getHours() - 26);
        problem.createdAt = date;
      } else {
        // String to Date (because JSON doesn't have Date)
        problem.createdAt = new Date(problem.createdAt);
      }
    });
    problems.sort(sortByNew);
  }

  return problems;
}

interface Params {
  cid: string;
}

export default async function Page({ params }: { params: Params }) {
  const { cid } = params;
  const collection = await getCollection(cid);
  const problems = await getProblems(collection);

  // This call is still slow.
  // Private pages must wait for security check
  // Public pages can show the problems immediately, and stream personalized data as the page loads
  const session = await getServerSession(authOptions);

  if (session === null) {
    // Not logged in
    if (cid === "demo") {
      return (
        <ProblemList
          collection={collection}
          problems={problems}
          userId=""
          authors={[]}
          permission={null}
        />
      );
    } else {
      redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}`);
    }
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

  const res = await fetch(
    internal_api_url(`/permissions/${userId}_${collection.id}/get`),
    {
      cache: "force-cache", // force-cache needed because it comes after await getServerSession?
      next: {
        tags: [`GET /permissions/${userId}_${collection.id}`],
      },
    },
  );
  if (!res.ok) {
    console.error(res);
    throw new Error();
  }
  let { permission } = await res.json();

  if (!canViewCollection(permission)) {
    // No permission
    if (cid === "demo") {
      // create permission if it doesn't already exist
      permission = await prisma.permission.upsert({
        where: {
          userId_collectionId: {
            userId,
            collectionId: collection.id,
          },
        },
        update: {
          accessLevel: "TeamMember",
        },
        create: {
          userId,
          collectionId: collection.id,
          accessLevel: "TeamMember",
        },
      });
      await revalidateTags([`GET /permissions/${userId}_${collection.id}`]);
    } else {
      redirect("/need-permission");
    }
  }

  return (
    <ProblemList
      collection={collection}
      problems={problems}
      userId={userId}
      permission={permission}
      authors={authors}
    />
  );
}
