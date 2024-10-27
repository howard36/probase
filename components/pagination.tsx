import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const halfInterval = 3;
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
    <div className="mt-12 flex flex-row justify-center gap-0.5">
      {currentPage > 1 ? (
        <button
          className="btn btn-ghost btn-circle btn-sm sm:btn-md sm:text-base"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>
      ) : (
        <div className="min-w-8 sm:min-w-12"></div>
      )}
      {Array.from({ length: maxPage - minPage + 1 }, (_, idx) => {
        const pageNum = idx + minPage;
        return (
          <button
            key={pageNum}
            className={cn(
              "btn btn-ghost btn-circle btn-sm sm:btn-md sm:text-base",
              {
                "btn-active": pageNum === currentPage,
              },
            )}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        );
      })}
      {currentPage < totalPages ? (
        <button
          className="btn btn-ghost btn-circle btn-sm sm:btn-md sm:text-base"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </button>
      ) : (
        <div className="min-w-8 sm:min-w-12"></div>
      )}
    </div>
  );
}
