import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Filter, filterToString } from "@/lib/filter";

export function ProblemListSearch({
  filter,
  setFilter,
}: {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = { ...filter, search: e.target.value };
    setFilter(newFilter);
    const newParams = filterToString(newFilter);
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  return (
    <div className="w-full">
      <div className="relative text-slate-600">
        <form>
          <input
            type="search"
            placeholder="Search"
            value={filter.search}
            onChange={handleSearchChange}
            className="border-2 border-slate-300 bg-white h-12 w-full pl-4 pr-12 rounded-xl text-base focus:outline-none"
          />
          <div className="absolute right-0 top-0 mt-4 mr-4">
            <svg
              className="text-slate-600 h-4 w-4 fill-current"
              x="0px"
              y="0px"
              viewBox="0 0 56.966 56.966"
              width="512px"
              height="512px"
            >
              <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
            </svg>
          </div>
        </form>
      </div>
    </div>
  );
}
