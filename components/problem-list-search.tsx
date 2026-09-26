"use client";

import React, { useEffect, useRef, useState } from "react";
import { useProblemListFilter } from "./problem-list-filter-state";

/** How long typing must pause before the list is searched. */
const SEARCH_DELAY_MILLIS = 300;

export function ProblemListSearch() {
  const { filter, update } = useProblemListFilter();
  // The box keeps its own text, so typing never waits on the server.
  const [text, setText] = useState(filter.search);
  const pendingSearch = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingSearch = () => {
    if (pendingSearch.current !== null) {
      clearTimeout(pendingSearch.current);
      pendingSearch.current = null;
    }
  };

  // Show a search set from elsewhere (a page link, the back button), but
  // never overwrite what the user is in the middle of typing.
  useEffect(() => {
    if (pendingSearch.current === null) {
      setText(filter.search);
    }
  }, [filter.search]);

  useEffect(() => cancelPendingSearch, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setText(search);
    cancelPendingSearch();
    pendingSearch.current = setTimeout(() => {
      pendingSearch.current = null;
      update({ search });
    }, SEARCH_DELAY_MILLIS);
  };

  // Enter searches at once instead of reloading the page.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    cancelPendingSearch();
    update({ search: text });
  };

  return (
    <div className="w-full">
      <div className="relative text-slate-600">
        <form onSubmit={handleSubmit}>
          <input
            type="search"
            placeholder="Search"
            aria-label="Search problems"
            value={text}
            onChange={handleSearchChange}
            className="h-12 w-full rounded-xl border-2 border-slate-300 bg-white pl-4 pr-12 text-base focus:outline-none focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-200"
          />
          <div className="absolute right-0 top-0 mr-4 mt-4">
            <svg
              className="h-4 w-4 fill-current text-slate-600"
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
