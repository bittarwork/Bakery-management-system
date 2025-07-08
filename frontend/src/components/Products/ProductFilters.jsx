import { useState, useEffect } from "react";
import { Search, Filter, X, SortAsc, SortDesc, RefreshCw } from "lucide-react";
import { useProductStore } from "../../store/productStore";

const ProductFilters = ({ onFiltersChange }) => {
  const { filters, updateFilters, fetchProducts } = useProductStore();
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // تحديث الفلاتر المحلية عندما تتغير فلاتر المتجر
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // تطبيق الفلاتر
  const applyFilters = () => {
    updateFilters(localFilters);
    fetchProducts();
    if (onFiltersChange) {
      onFiltersChange(localFilters);
    }
  };

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      is_active: null,
      sortBy: "name",
      sortOrder: "ASC",
    };
    setLocalFilters(defaultFilters);
    updateFilters(defaultFilters);
    fetchProducts();
    if (onFiltersChange) {
      onFiltersChange(defaultFilters);
    }
  };

  // تحديث فلتر معين
  const updateFilter = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // البحث السريع (عند الكتابة)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    updateFilter("search", value);

    // تطبيق البحث تلقائياً بعد توقف الكتابة
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      updateFilters({ ...localFilters, search: value });
      fetchProducts();
    }, 500);
  };

  // التحقق من وجود فلاتر نشطة
  const hasActiveFilters = () => {
    return (
      localFilters.search ||
      localFilters.is_active !== null ||
      localFilters.sortBy !== "name" ||
      localFilters.sortOrder !== "ASC"
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="h-5 w-5 ml-2" />
            البحث والتصفية
          </h3>

          <div className="flex items-center space-x-2 space-x-reverse">
            {hasActiveFilters() && (
              <button
                onClick={resetFilters}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="إعادة تعيين الفلاتر"
              >
                <RefreshCw className="h-4 w-4 ml-1" />
                إعادة تعيين
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <>
                  <X className="h-4 w-4 ml-1" />
                  إخفاء
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4 ml-1" />
                  فلاتر متقدمة
                </>
              )}
            </button>
          </div>
        </div>

        {/* البحث الأساسي */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في المنتجات..."
            value={localFilters.search}
            onChange={handleSearchChange}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {localFilters.search && (
            <button
              onClick={() => {
                updateFilter("search", "");
                updateFilters({ ...localFilters, search: "" });
                fetchProducts();
              }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* الفلاتر المتقدمة */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* فلتر الحالة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة المنتج
              </label>
              <select
                value={
                  localFilters.is_active === null
                    ? ""
                    : localFilters.is_active.toString()
                }
                onChange={(e) =>
                  updateFilter(
                    "is_active",
                    e.target.value === "" ? null : e.target.value === "true"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">جميع المنتجات</option>
                <option value="true">نشط فقط</option>
                <option value="false">غير نشط فقط</option>
              </select>
            </div>

            {/* ترتيب حسب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ترتيب حسب
              </label>
              <select
                value={localFilters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">الاسم</option>
                <option value="price">السعر</option>
                <option value="cost">التكلفة</option>
                <option value="created_at">تاريخ الإنشاء</option>
                <option value="updated_at">تاريخ التحديث</option>
              </select>
            </div>

            {/* اتجاه الترتيب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اتجاه الترتيب
              </label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateFilter("sortOrder", "ASC")}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    localFilters.sortOrder === "ASC"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <SortAsc className="h-4 w-4 mx-auto" />
                  <span className="sr-only">تصاعدي</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateFilter("sortOrder", "DESC")}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    localFilters.sortOrder === "DESC"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <SortDesc className="h-4 w-4 mx-auto" />
                  <span className="sr-only">تنازلي</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* أزرار التطبيق */}
        {isExpanded && (
          <div className="flex justify-end space-x-2 space-x-reverse mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              تطبيق الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* عداد النتائج */}
      {hasActiveFilters() && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {localFilters.search && (
              <span>البحث عن: "{localFilters.search}"</span>
            )}
            {localFilters.is_active !== null && (
              <span className="ml-2">
                • الحالة: {localFilters.is_active ? "نشط" : "غير نشط"}
              </span>
            )}
            {(localFilters.sortBy !== "name" ||
              localFilters.sortOrder !== "ASC") && (
              <span className="ml-2">
                • مرتب حسب: {getSortLabel(localFilters.sortBy)} (
                {localFilters.sortOrder === "ASC" ? "تصاعدي" : "تنازلي"})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

// دالة مساعدة لترجمة حقول الترتيب
const getSortLabel = (sortBy) => {
  const labels = {
    name: "الاسم",
    price: "السعر",
    cost: "التكلفة",
    created_at: "تاريخ الإنشاء",
    updated_at: "تاريخ التحديث",
  };
  return labels[sortBy] || sortBy;
};

export default ProductFilters;
