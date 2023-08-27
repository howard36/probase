import ProblemCard from './problem-card'
import prisma from '@/utils/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Params, CollectionProps } from './types'
import { collectionSelect } from './types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/api/auth/[...nextauth]'
import { canViewCollection } from '@/utils/permissions'
import ProblemList from './problem-list'

// export async function generateStaticParams(): Promise<Params[]> {
//   if (process.env.NO_WIFI === "true") {
//     return [
//       { cid: 'cmimc' }
//     ];
//   }

//   const params = await prisma.collection.findMany({
//     select: { cid: true }
//   });
//   return params;
// }

async function getCollection(cid: string): Promise<CollectionProps> {
  // if (process.env.NO_WIFI === "true") {
  //   return {
  //     id: 1,
  //     cid: 'cmimc',
  //     name: 'CMIMC',
  //     problems: [
  //       {
  //         pid: 'A1',
  //         title: 'Quadratic Equation',
  //         subject: 'Algebra' as Subject,
  //         statement: 'Compute the roots of $$x^2 - 4x + 2$$',
  //       },
  //       {
  //         pid: 'A2',
  //         title: 'Quadratic Equation',
  //         subject: 'Combinatorics' as Subject,
  //         statement: 'Compute the roots of $$x^2 - 4x + 2$$',
  //       },
  //       {
  //         pid: 'A3',
  //         title: 'Quadratic Equation',
  //         subject: 'Geometry' as Subject,
  //         statement: 'Compute the roots of $$x^2 - 4x + 2$$',
  //       },
  //       {
  //         pid: 'A4',
  //         title: 'Quadratic Equation',
  //         subject: 'NumberTheory' as Subject,
  //         statement: 'Compute the roots of $$x^2 - 4x + 2$$',
  //       },
  //       {
  //         pid: 'A5',
  //         title: 'Quadratic Equation',
  //         subject: 'Algebra' as Subject,
  //         statement: 'Compute the roots of $$x^2 - 4x + 2$$',
  //       },
  //     ],
  //   }
  // }

  const collection = await prisma.collection.findUnique({
    where: { cid },
    select: collectionSelect,
  });

  if (collection === null) {
    notFound();
  }

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

  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId: collection.id,
      }
    }
  });
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
    } else {
      redirect("/need-permission");
    }
  }

  return <ProblemList collection={collection} />;
}

