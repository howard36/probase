import prisma from '@/utils/prisma'
import { notFound, redirect } from 'next/navigation'
import type { Params, CollectionProps, ProblemProps } from './types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/api/auth/[...nextauth]'
import { canViewCollection } from '@/utils/permissions'
import ProblemList from './problem-list'
import { revalidateTags } from '@/utils/revalidate'
import { internal_api_url } from '@/utils/urls'

function sortByNew(p1: ProblemProps, p2: ProblemProps): number {
  const t1 = p1.createdAt;
  const t2 = p2.createdAt;
  if (t1 !== t2) {
    return t1 > t2 ? -1 : 1;
  } else {
    return p1.id > p2.id ? -1 : 1;
  }
}

async function getCollection(cid: string): Promise<CollectionProps> {
  const res = await fetch(
    internal_api_url(`/collections/${cid}/get`),
    { next: { tags: [
      `GET /collections/${cid}`
    ]}}
  );
  if (res.status === 404) {
    notFound();
  } else if (!res.ok) {
    console.error(res);
    throw new Error();
  }
  const { collection } = await res.json();

  const res2 = await fetch(
    internal_api_url(`/collections/${collection.id}/problems/get`),
    { next: { tags: [
      `GET /collections/${collection.id}/problems`
    ]}}
  );
  if (!res2.ok) {
    console.error(res2);
    throw new Error();
  }
  let { problems } = await res2.json();

  if (cid === "demo") {
    problems.forEach((problem: ProblemProps) => {
      const date = new Date();
      if (problem.pid === "A1") {  // Quadratic Equation
        date.setHours(date.getHours() - 24);
        problem.createdAt = date;
      } else if (problem.pid === "N1") {  // Fermat's Last Theorem
        date.setHours(date.getHours() - 25);
        problem.createdAt = date;
      } else if (problem.pid === "G1") {  // Edit me!
        date.setHours(date.getHours() - 26);
        problem.createdAt = date;
      } else {
        // String to Date (because JSON doesn't have Date)
        problem.createdAt = new Date(problem.createdAt);
      }
    })
  }
  problems.sort(sortByNew);

  collection.problems = problems;
  return collection;
}

export default async function CollectionPage({
  params
}: {
  params: Params
}) {
  const { cid } = params;
  const collection = await getCollection(cid);

  // This call is still slow.
  // Private pages must wait for security check
  // Public pages can show the problems immediately, and stream personalized data as the page loads
  const session = await getServerSession(authOptions);

  if (session === null) {
    // Not logged in
    if (cid === "demo") {
      return <ProblemList collection={collection} userId="" />;
    } else {
      redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}`);
    }
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  const res = await fetch(
    internal_api_url(`/permissions/${userId}_${collection.id}/get`),
    {
      cache: 'force-cache', // force-cache needed because it comes after await getServerSession?
      next: {
        tags: [`GET /permissions/${userId}_${collection.id}`]
      }
    }
  );
  if (!res.ok) {
    console.error(res);
    throw new Error();
  }
  const { permission } = await res.json();
  
  if (!canViewCollection(permission)) {
    // No permission
    if (cid === "demo") {
      // create permission if it doesn't already exist
      await prisma.permission.upsert({
        where: {
          userId_collectionId: {
            userId,
            collectionId: collection.id,
          }
        },
        update: {
          accessLevel: 'TeamMember',
        },
        create: {
          userId,
          collectionId: collection.id,
          accessLevel: 'TeamMember',
        },
      });
      revalidateTags([`GET /permissions/${userId}_${collection.id}`]);
    } else {
      redirect("/need-permission");
    }
  }

  return <ProblemList collection={collection} userId={userId} />;
}

