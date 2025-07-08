import React, { useState } from "react";
import LoadingSpinner from "../UI/LoadingSpinner";
import Pagination from "./Pagination";

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  pagination = null,
  onPageChange = () => {},
  onSort = () => {},
  sortBy = null,
  sortOrder = "asc",
  selectable = false,
  selectedItems = [],
  onSelectionChange = () => {},
  emptyMessage = "لا توجد بيانات",
  className = "",
  rowClassName = "",
  headerClassName = "",
  cellClassName = "",
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (columnKey) => {
    if (!columns.find((col) => col.key === columnKey)?.sortable) return;

    const newOrder =
      sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc";
    onSort(columnKey, newOrder);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(data.map((item) => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter((id) => id !== itemId));
    }
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }

    const value = item[column.key];

    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    if (typeof value === "boolean") {
      return value ? "✓" : "✗";
    }

    if (column.type === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
      }).format(value);
    }

    if (column.type === "date") {
      return new Date(value).toLocaleDateString("en-GB");
    }

    if (column.type === "datetime") {
      return new Date(value).toLocaleString("en-GB");
    }

    return value;
  };

  const getSortIcon = (columnKey) => {
    if (sortBy !== columnKey) {
      return "↕️";
    }
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 font-medium mb-2">
          خطأ في تحميل البيانات
        </div>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`bg-gray-50 ${headerClassName}`}>
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === data.length && data.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                                        px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider
                                        ${
                                          column.sortable
                                            ? "cursor-pointer hover:bg-gray-100"
                                            : ""
                                        }
                                    `}
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <span className="text-gray-400 text-sm">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2">📋</div>
                    <div>{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={`
                                        hover:bg-gray-50 transition-colors duration-150
                                        ${
                                          hoveredRow === index
                                            ? "bg-gray-50"
                                            : ""
                                        }
                                        ${rowClassName}
                                    `}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) =>
                          handleSelectItem(item.id, e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`
                                                px-6 py-4 whitespace-nowrap text-sm text-gray-900
                                                ${
                                                  column.align === "center"
                                                    ? "text-center"
                                                    : ""
                                                }
                                                ${
                                                  column.align === "left"
                                                    ? "text-left"
                                                    : ""
                                                }
                                                ${cellClassName}
                                            `}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.page || pagination.current_page || 1}
          totalPages={pagination.totalPages || pagination.total_pages || 1}
          totalItems={pagination.total || 0}
          itemsPerPage={pagination.limit || pagination.per_page || 10}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default DataTable;
