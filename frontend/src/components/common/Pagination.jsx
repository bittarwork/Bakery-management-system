import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
      {/* Info */}
      {showInfo && (
        <div className="flex items-center text-sm text-gray-700">
          <span>
            عرض {startItem} إلى {endItem} من أصل {totalItems} نتيجة
          </span>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => handlePageChange(1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="الصفحة الأولى"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}

        {/* Previous Page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="الصفحة السابقة"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {/* Show ellipsis if there are pages before visible range */}
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Show ellipsis if there are pages after visible range */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="الصفحة التالية"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Last Page */}
        {showFirstLast && currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(totalPages)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="الصفحة الأخيرة"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;
