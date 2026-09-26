"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Filter, filterToString } from "@/lib/filter";

interface FilterState {
  /** The filter as the user has set it; runs ahead of the list while it loads. */
  filter: Filter;
  /** Applies a change to the filter and loads the list for it. */
  update: (change: Partial<Filter>) => void;
}

const FilterStateContext = createContext<FilterState | null>(null);

/**
 * Holds the collection page's filter for the search box and the filter
 * controls. Each change is shown at once and builds on the previous one, even
 * while the list for it is still loading; reading the filter back from the
 * server instead would undo the changes made in the meantime, dropping typed
 * characters and cancelling quick clicks. Whenever the page is shown with a
 * different filter (the user's change has loaded, or a page link or Back won
 * over it), that filter is taken up.
 */
export function ProblemListFilterState({
  filter: serverFilter,
  children,
}: {
  filter: Filter;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState(serverFilter);
  const latest = useRef(filter);

  // Navigations commit one at a time and a newer one replaces an older one
  // still loading, so a new filter from the server is never an out-of-date
  // copy of the user's own changes.
  const serverKey = filterToString(serverFilter);
  const [seenServerKey, setSeenServerKey] = useState(serverKey);
  if (serverKey !== seenServerKey) {
    setSeenServerKey(serverKey);
    setFilter(serverFilter);
  }
  useEffect(() => {
    latest.current = filter;
  }, [filter]);

  const update = useCallback(
    (change: Partial<Filter>) => {
      const next = { ...latest.current, ...change };
      latest.current = next;
      setFilter(next);
      router.replace(`${pathname}${filterToString(next)}`, { scroll: false });
    },
    [router, pathname],
  );

  return (
    <FilterStateContext.Provider value={{ filter, update }}>
      {children}
    </FilterStateContext.Provider>
  );
}

export function useProblemListFilter(): FilterState {
  const state = useContext(FilterStateContext);
  if (state === null) {
    throw new Error(
      "useProblemListFilter must be used inside ProblemListFilterState",
    );
  }
  return state;
}
