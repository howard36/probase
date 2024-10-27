import Link from "next/link";
import { ProblemListSearch } from "./problem-list-search";
import { ProblemListFilter } from "./problem-list-filter";
import { Filter } from "@/lib/filter";
import { Permission, Collection } from "@prisma/client";

interface ProblemListSidebarProps {
  collection: Collection;
  permission: Permission | null;
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}

export function ProblemListSidebar({
  collection,
  permission,
  filter,
  setFilter,
}: ProblemListSidebarProps) {
  return (
    <>
      <div className="mb-2 flex flex-col sm:flex-row xl:flex-col gap-x-8 gap-y-6">
        <Link
          href={`/c/${collection.cid}/add-problem`}
          prefetch={true}
          className="w-full sm:max-w-56 xl:max-w-full inline-block py-3 px-10 text-center rounded-xl bg-violet-500 hover:bg-violet-600 text-slate-50 font-bold text-base soft-shadow-xl"
        >
          Add Problem
        </Link>
        <ProblemListSearch filter={filter} setFilter={setFilter} />
      </div>
      <ProblemListFilter
        collection={collection}
        permission={permission}
        filter={filter}
        setFilter={setFilter}
      />
    </>
  );
}
