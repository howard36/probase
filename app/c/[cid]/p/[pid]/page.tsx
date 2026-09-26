import { cache } from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProblemPage from "./problem-page";
import { problemInclude, type Params, type Props } from "./types";
import { requireCollectionAccess } from "@/lib/collection-access";
import { parseFilter } from "@/lib/filter";

// Cached per request, so the page and its title share one load.
const getProps = cache(async function (
  cid: string,
  pid: string,
): Promise<Props> {
  const { userId, collection, permission, authors } =
    await requireCollectionAccess(cid, `/c/${cid}/p/${pid}`);

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

  const props: Props = {
    problem,
    collection,
    permission,
    authors,
    userId,
  };

  return props;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { cid, pid } = await params;
  const { problem, collection } = await getProps(cid, pid);
  // A locked problem's title is on its card too, so it may be shown here.
  return { title: `${problem.pid}. ${problem.title} · ${collection.name}` };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filter = parseFilter(await searchParams);
  const { cid, pid } = await params;
  const props: Props = await getProps(cid, pid);

  return <ProblemPage {...props} filter={filter} />;
}
