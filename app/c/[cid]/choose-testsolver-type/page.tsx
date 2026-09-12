import { redirect } from "next/navigation";
import { requireCollectionAccess } from "@/lib/collection-access";
import ChooseTestsolverTypePage from "@/components/choose-testsolver-type-page";
import { setTestsolverType } from "./actions";

interface Params {
  cid: string;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { cid } = await params;
  const { collection } = await requireCollectionAccess(cid, `/c/${cid}`, {
    skipTestsolverTypeCheck: true,
  });

  if (collection.requireTestsolve === false) {
    redirect(`/c/${cid}`);
  }

  return (
    <ChooseTestsolverTypePage
      collection={collection}
      submitAction={setTestsolverType}
    />
  );
}
