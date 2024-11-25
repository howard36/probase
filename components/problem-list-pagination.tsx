"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { usePathname } from "next/navigation";
import { Filter, filterToString } from "@/lib/filter";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

interface PaginationProps {
  totalPages: number;
  filter: Filter;
}

export function ProblemListPagination({ totalPages, filter }: PaginationProps) {
  const pathname = usePathname();

  const getPageHref = (page: number) => {
    const newParams = filterToString({ ...filter, page });
    return `${pathname}${newParams}`;
  };

  const currentPage = filter.page;

  const halfInterval = 2;
  let minPage = currentPage - halfInterval;
  let maxPage = currentPage + halfInterval;
  if (minPage <= 0) {
    minPage = 1;
    maxPage = 1 + 2 * halfInterval;
  } else if (maxPage > totalPages) {
    minPage = totalPages - 2 * halfInterval;
    maxPage = totalPages;
  }
  // Clamp to [1, totalPages]
  minPage = Math.max(minPage, 1);
  maxPage = Math.min(maxPage, totalPages);

  return (
    <Pagination className="mt-12 text-slate-900">
      <PaginationContent>
        {currentPage > 1 ? (
          <PaginationItem>
            <PaginationPrevious
              href={getPageHref(currentPage - 1)}
              className="hover:bg-slate-200/70"
            />
          </PaginationItem>
        ) : null}

        {Array.from({ length: maxPage - minPage + 1 }, (_, idx) => {
          const pageNum = idx + minPage;
          const isActive = pageNum === currentPage;
          return (
            <PaginationItem key={pageNum}>
              {isActive ? (
                <span
                  className={cn(
                    buttonVariants({
                      variant: "secondary",
                      size: "icon",
                    }),
                    "pointer-events-none bg-violet-200 text-violet-950 shadow-violet-200/50 hover:bg-violet-200",
                  )}
                  aria-current="page"
                >
                  {pageNum}
                </span>
              ) : (
                <PaginationLink
                  href={getPageHref(pageNum)}
                  prefetch={true}
                  className="hover:bg-slate-200/70"
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          );
        })}

        {currentPage < totalPages ? (
          <PaginationItem>
            <PaginationNext
              href={getPageHref(currentPage + 1)}
              className="hover:bg-slate-200/70"
            />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}
