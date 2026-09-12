import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProblemPage from "./problem-page";
import { problemInclude, type Params, type Props } from "./types";
import { requireCollectionAccess } from "@/lib/collection-access";
import { parseFilter } from "@/lib/filter";

// TODO: params can be null, but the type does not reflect that
async function getProps(params: Params): Promise<Props> {
  const { cid, pid } = params;

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
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filter = parseFilter(await searchParams);
  const props: Props = await getProps(await params);

  return <ProblemPage {...props} filter={filter} />;
}
