import prisma from '@/utils/prisma'
import { notFound, redirect } from 'next/navigation'
import type { Params, CollectionProps } from './types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/api/auth/[...nextauth]'
import { canViewCollection } from '@/utils/permissions'
import ProblemList from './problem-list'
import { revalidateTags } from '@/utils/revalidate'

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
          title: 'Here is a title',
          subject: 'Combinatorics',
          statement: 'And this is some example text. Totally not random'
        },
        {
          pid: 'A4',
          title: 'Does Latex work here? $$x$$ Wow that sure looks weird',
          subject: 'Algebra',
          statement: 'And what about here? $$1+1$$ Oh cool it renders properly in the problem card'
        },
        { pid: 'A3', title: 'a2', subject: 'Algebra', statement: 'a34' },
        {
          pid: 'N3',
          title: 'my problem',
          subject: 'NumberTheory',
          statement: 'hi'
        },
        { pid: 'G1', title: 'title', subject: 'Geometry', statement: 'e' },
        { pid: 'A2', title: 'second', subject: 'Algebra', statement: 's' },
        {
          pid: 'N2',
          title: 'n hi',
          subject: 'NumberTheory',
          statement: 'n'
        },
        {
          pid: 'C1',
          title: 'Combinatorics',
          subject: 'Combinatorics',
          statement: 'The best combo problems involve reading walls of text, so...\n' +
            '\n' +
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
          pid: 'N1',
          title: "Fermat's Last Theorem",
          subject: 'NumberTheory',
          statement: 'Find all positive integer solutions to $$a^n + b^n = c^n$$ which satisfy $n \\ge 3$.'
        },
        {
          pid: 'A1',
          title: 'Quadratic Equation',
          subject: 'Algebra',
          statement: 'Find all roots of the quadratic $$x^2 - 4x + 2.$$'
        }
      ],
      showAuthors: true,
    };
  }

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/internal/collections/${cid}/get?secret=${process.env.INTERNAL_API_KEY}`,
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
    `${process.env.NEXTAUTH_URL}/api/internal/collections/${collection.id}/problems/get?secret=${process.env.INTERNAL_API_KEY}`,
    { next: { tags: [
      `GET /collections/${collection.id}/problems`
    ]}}
  );
  if (!res2.ok) {
    console.error(res2);
    throw new Error();
  }
  const { problems } = await res2.json();

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
    `${process.env.NEXTAUTH_URL}/api/internal/permissions/${userId}_${collection.id}/get?secret=${process.env.INTERNAL_API_KEY}`,
    {
      cache: 'force-cache',
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

