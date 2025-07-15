import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Input from "./Input";
import Button from "./Button";
import { Card, CardHeader, CardBody } from "./Card";

const DataTable = ({
  data = [],
  columns = [],
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  itemsPerPage = 10,
  className = "",
  title = "Data Table",
  language = "ar", // ar or en
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  // Filter data based on search term
  const filteredData = useMemo(() => {
    let filtered = data || [];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((item) => item[key] === value);
      }
    });

    return filtered;
  }, [data, searchTerm, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData || [];

    return [...(filteredData || [])].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData || [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return (sortedData || []).slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get unique values for filter options
  const getFilterOptions = (key) => {
    const values = [...new Set((data || []).map((item) => item[key]))];
    return values.filter(Boolean);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Show first 3 pages + ellipsis + last page
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 3 pages
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Text translations
  const texts = {
    ar: {
      showing: "عرض",
      of: "من",
      results: "نتيجة",
      search: "البحث...",
      all: "الكل",
      previous: "السابق",
      next: "التالي",
      first: "الأول",
      last: "الأخير",
      page: "صفحة",
      noData: "لا توجد بيانات",
      actions: "الإجراءات",
    },
    en: {
      showing: "Showing",
      of: "of",
      results: "results",
      search: "Search...",
      all: "All",
      previous: "Previous",
      next: "Next",
      first: "First",
      last: "Last",
      page: "Page",
      noData: "No data available",
      actions: "Actions",
    },
  };

  const t = texts[language];

  return (
    <Card className={className}>
      {/* Table Header with Search and Filters */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">
              {t.showing} {paginatedData.length} {t.of} {filteredData.length}{" "}
              {t.results}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {searchable && (
              <div className="relative">
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                  className="w-full sm:w-64"
                />
              </div>
            )}

            {filterable && (
              <div className="flex space-x-2">
                {columns
                  .filter((col) => col.filterable !== false)
                  .map((col) => (
                    <select
                      key={col.key}
                      value={filters[col.key] || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [col.key]: e.target.value || null,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">
                        {t.all} {col.title}
                      </option>
                      {getFilterOptions(col.key).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Table */}
      <CardBody>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns
                  .filter((col) => col.key !== "actions")
                  .map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        sortable && column.sortable !== false
                          ? "cursor-pointer hover:bg-gray-100 transition-colors"
                          : ""
                      }`}
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>{column.title}</span>
                        {sortable && column.sortable !== false && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={`w-3 h-3 ${
                                sortConfig.key === column.key &&
                                sortConfig.direction === "asc"
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <ChevronDown
                              className={`w-3 h-3 -mt-1 ${
                                sortConfig.key === column.key &&
                                sortConfig.direction === "desc"
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <motion.tr
                    key={row.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns
                      .filter((col) => col.key !== "actions")
                      .map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-right"
                        >
                          {column.render ? (
                            column.render(row[column.key], row)
                          ) : (
                            <div className="text-sm text-gray-900">
                              {row[column.key]}
                            </div>
                          )}
                        </td>
                      ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {columns
                        .find((col) => col.key === "actions")
                        ?.render?.(null, row) || (
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">{t.noData}</p>
                      {searchTerm && (
                        <p className="text-xs text-gray-400">
                          لا توجد نتائج للبحث: "{searchTerm}"
                        </p>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {pagination && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 bg-gray-50 p-4 rounded-xl"
          >
            <div className="text-sm text-gray-700">
              {t.showing} {(currentPage - 1) * itemsPerPage + 1} {t.of}{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} {t.of}{" "}
              {filteredData.length} {t.results}
            </div>

            <div className="flex items-center space-x-2">
              {/* First Page Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                className="px-2 py-1"
                title={t.first}
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1"
              >
                <ChevronLeft className="w-4 h-4 ml-1" />
                {t.previous}
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="px-3 py-1 min-w-[40px]"
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1"
              >
                {t.next}
                <ChevronRight className="w-4 h-4 mr-1" />
              </Button>

              {/* Last Page Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                className="px-2 py-1"
                title={t.last}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Page Info */}
            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
              {t.page} {currentPage} {t.of} {totalPages}
            </div>
          </motion.div>
        )}
      </CardBody>
    </Card>
  );
};

export default DataTable;
