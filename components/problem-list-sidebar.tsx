import PrefetchLink from "@/components/prefetch-link";
import { ProblemListSearch } from "./problem-list-search";
import { ProblemListFilter } from "./problem-list-filter";
import { ProblemListFilterState } from "./problem-list-filter-state";
import { Filter } from "@/lib/filter";
import { Permission, Collection } from "@prisma/client";
import { canAddProblem } from "@/lib/permissions";

interface ProblemListSidebarProps {
  collection: Collection;
  permission: Permission;
  filter: Filter;
}

export function ProblemListSidebar({
  collection,
  permission,
  filter,
}: ProblemListSidebarProps) {
  return (
    <ProblemListFilterState filter={filter}>
      <div className="mb-2 flex flex-col gap-x-8 gap-y-6 sm:flex-row xl:flex-col">
        {canAddProblem(permission) && (
          <PrefetchLink
            href={`/c/${collection.cid}/add-problem`}
            className="soft-shadow-xl inline-block w-full rounded-xl bg-violet-500 px-10 py-3 text-center text-base font-bold text-slate-50 hover:bg-violet-600 sm:max-w-56 xl:max-w-full"
          >
            Add Problem
          </PrefetchLink>
        )}
        <ProblemListSearch />
      </div>
      <ProblemListFilter collection={collection} permission={permission} />
    </ProblemListFilterState>
  );
}
