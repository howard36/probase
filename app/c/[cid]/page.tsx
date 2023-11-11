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
  if (cid === "throw-error") {
    throw new Error("ERROR ERROR ERROR");
  }
  if (process.env.NO_WIFI === "true") {
    return {
      id: 1,
      cid: 'demo',
      name: 'Probase Demo',
      problems: [
        {
          pid: 'C2',
          id: 1,
          title: 'Here is a title',
          subject: 'Combinatorics',
          statement: 'And this is some example text. Totally not random',
          createdAt: new Date(),
        },
        {
          pid: 'A4',
          id: 2,
          title: 'Does Latex work here? $$x$$ Wow that sure looks weird',
          subject: 'Algebra',
          statement: 'And what about here? $$1+1$$ Oh cool it renders properly in the problem card',
          createdAt: new Date(),
        },
        {
          pid: 'A3',
          id: 3,
          title: 'a2',
          subject: 'Algebra',
          statement: 'a34',
          createdAt: new Date(),
        },
        {
          pid: 'N3',
          id: 4,
          title: 'my problem',
          subject: 'NumberTheory',
          statement: 'hi',
          createdAt: new Date(),
        },
        { pid: 'G1', id: 5, title: 'title', subject: 'Geometry', statement: 'e', createdAt: new Date(), },
        { pid: 'A2', id: 6, title: 'second', subject: 'Algebra', statement: 's', createdAt: new Date(), },
        {
          pid: 'N2',
          id: 7,
          title: 'n hi',
          subject: 'NumberTheory',
          statement: 'n',
          createdAt: new Date(),
        },
        {
          pid: 'C1',
          id: 8,
          title: 'Combinatorics',
          subject: 'Combinatorics',
          statement: 'The best combo problems involve reading walls of text, so...\n' +
            '\n' +
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          createdAt: new Date(),
        },
        {
          pid: 'N1',
          id: 9,
          title: "Fermat's Last Theorem",
          subject: 'NumberTheory',
          statement: 'Find all positive integer solutions to $$a^n + b^n = c^n$$ which satisfy $n \\ge 3$.',
          createdAt: new Date(),
        },
        {
          pid: 'A1',
          id: 10,
          title: 'Quadratic Equation',
          subject: 'Algebra',
          statement: 'Find all roots of the quadratic $$x^2 - 4x + 2.$$',
          createdAt: new Date(),
        }
      ],
      showAuthors: true,
    };
  }

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
      return <ProblemList collection={collection} />;
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

  return <ProblemList collection={collection} />;
}

