import { redirect } from "next/navigation";
import { requireCollectionAccess } from "@/lib/collection-access";
import ChooseTestsolverTypePage from "@/components/choose-testsolver-type-page";
import { setTestsolverType } from "./actions";
import { hasTimedTestsolving } from "@/lib/testsolve";

interface Params {
  cid: string;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { cid } = await params;
  const { collection } = await requireCollectionAccess(cid, `/c/${cid}`, {
    skipTestsolverTypeCheck: true,
  });

  if (!hasTimedTestsolving(collection)) {
    redirect(`/c/${cid}`);
  }

  return (
    <ChooseTestsolverTypePage
      collection={collection}
      submitAction={setTestsolverType}
    />
  );
}
