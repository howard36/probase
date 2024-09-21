import Link from "next/link";
import { ProblemListSearch } from "./ProblemListSearch";
import { ProblemListFilter } from "./ProblemListFilter";
import { Filter } from "@/lib/filter";

interface ProblemListSidebarProps {
  collectionCid: string;
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}

export function ProblemListSidebar({
  collectionCid,
  filter,
  setFilter,
}: ProblemListSidebarProps) {
  return (
    <>
      <div className="mb-2 flex flex-col sm:flex-row xl:flex-col gap-x-8 gap-y-6">
        <Link
          href={`/c/${collectionCid}/add-problem`}
          prefetch={true}
          className="w-full sm:max-w-56 xl:max-w-full inline-block py-3 px-10 text-center rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-50 font-bold text-base soft-shadow-xl"
        >
          Add Problem
        </Link>
        <ProblemListSearch filter={filter} setFilter={setFilter} />
      </div>
      <ProblemListFilter filter={filter} setFilter={setFilter} />
    </>
  );
}
