import prisma from '@/utils/prisma'
import { notFound, redirect } from 'next/navigation'
import TestPage from './test-page'
// import type { AuthorProps, Params, Props } from './types'
// import { problemInclude, collectionSelect, permissionSelect } from './types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/api/auth/[...nextauth]'
import { canViewCollection } from '@/utils/permissions'
import { AccessLevel } from '@prisma/client'
import { internal_api_url } from '@/utils/urls'

// TODO: params can be null, but the type does not reflect that
// async function getProps(params: Params, userId: string | null): Promise<Props> {
//   const { cid, testSlug } = params;

//   let res = await fetch(
//     internal_api_url(`/collections/${cid}/get`),
//     {
//       cache: 'force-cache', // force-cache needed because it comes after await getServerSession?
//       next: { tags: [
//       `GET /collections/${cid}`
//     ]}}
//   );
//   if (res.status === 404) {
//     notFound();
//   } else if (!res.ok) {
//     console.error(res);
//     throw new Error();
//   }
//   const { collection } = await res.json();

//   const collectionId = collection.id;
//   res = await fetch(
//     internal_api_url(`/problems/${collectionId}_${pid}/get`),
//     {
//       cache: 'force-cache', // force-cache needed because it comes after await getServerSession?
//       next: { tags: [
//       `GET /problems/${collectionId}_${pid}`
//     ]}}
//   );
//   if (res.status === 404) {
//     notFound();
//   } else if (!res.ok) {
//     console.error(res);
//     throw new Error();
//   }
//   const { problem } = await res.json();

//   // TODO: separate internal API calls for solutions and comments

//   if (userId === null) {
//     if (collection.cid !== "demo") {
//       throw new Error("null userId on non-demo problem page");
//     }
//     const permission = {
//       accessLevel: 'TeamMember' as AccessLevel
//     };
//     const authors: AuthorProps[] = [];
//     const props: Props = {
//       problem,
//       collection,
//       permission,
//       authors,
//     };
//     return props;
//   }

//   res = await fetch(
//     internal_api_url(`/permissions/${userId}_${collectionId}/get`),
//     {
//       cache: 'force-cache', // force-cache needed because it comes after await getServerSession?
//       next: {
//         tags: [`GET /permissions/${userId}_${collectionId}`]
//       }
//     }
//   );
//   if (!res.ok) {
//     console.error(res);
//     throw new Error();
//   }
//   const { permission } = await res.json();

//   // canViewCollection already checks for null, but we include it here so TypeScript knows that permission is non-null later in the program
//   if (permission === null || !canViewCollection(permission)) {
//     // No permission to view this page
//     redirect("/need-permission");
//   }

//   const authors = await prisma.author.findMany({
//     where: {
//       userId,
//       collectionId,
//     },
//     select: { id: true },
//   });

//   const props: Props = {
//     problem,
//     collection,
//     permission,
//     authors,
//   };

//   return props;
// };

interface Params {
  cid: string
  testSlug: string
}

export default async function Page({
  params
}: {
  params: Params
}) {
  let { cid, testSlug } = params;
  let session = await getServerSession(authOptions);
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

  const testIdStr = testSlug.split('-').pop();
  if (testIdStr === undefined) {
    return;
  }
  const testId = parseInt(testIdStr);

  const test = await prisma.test.findUnique({
    where: {
      id: testId,
    }
  })
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
      position: "asc"
    },
  })
  
  let res = await fetch(
    internal_api_url(`/collections/${cid}/get`),
    {
      cache: 'force-cache', // force-cache needed because it comes after await getServerSession?
      next: { tags: [
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

  return <TestPage name={test.name} testProblems={testProblems} collection={collection} />;
}
