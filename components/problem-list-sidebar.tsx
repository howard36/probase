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
      <div className="mb-2 flex flex-col gap-x-8 gap-y-6 sm:flex-row xl:flex-col">
        <Link
          href={`/c/${collection.cid}/add-problem`}
          prefetch={true}
          className="soft-shadow-xl inline-block w-full rounded-xl bg-violet-500 px-10 py-3 text-center text-base font-bold text-slate-50 hover:bg-violet-600 sm:max-w-56 xl:max-w-full"
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
