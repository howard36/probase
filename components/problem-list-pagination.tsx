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

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  filter: Filter;
}

export function ProblemListPagination({
  currentPage,
  totalPages,
  filter,
}: PaginationProps) {
  const pathname = usePathname();

  const getPageHref = (page: number) => {
    const newParams = filterToString({ ...filter, page });
    return `${pathname}${newParams}`;
  };

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
    <Pagination className="mt-12">
      <PaginationContent>
        {currentPage > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={getPageHref(currentPage - 1)} />
          </PaginationItem>
        ) : null}

        {Array.from({ length: maxPage - minPage + 1 }, (_, idx) => {
          const pageNum = idx + minPage;
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href={getPageHref(pageNum)}
                isActive={pageNum === currentPage}
                className={cn(
                  "hover:bg-slate-200",
                  pageNum === currentPage && "bg-slate-200",
                )}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {currentPage < totalPages ? (
          <PaginationItem>
            <PaginationNext href={getPageHref(currentPage + 1)} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}
