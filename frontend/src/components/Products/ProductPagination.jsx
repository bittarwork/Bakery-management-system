import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";

const ProductPagination = ({ onPageChange }) => {
  const { pagination, updatePagination, fetchProducts } = useProductStore();

  const { page, pages, total, limit } = pagination;

  // الانتقال لصفحة محددة
  const goToPage = async (newPage) => {
    if (newPage >= 1 && newPage <= pages && newPage !== page) {
      updatePagination({ page: newPage });
      await fetchProducts();
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  // تغيير عدد العناصر لكل صفحة
  const changeLimit = async (newLimit) => {
    const newPage = Math.ceil(((page - 1) * limit + 1) / newLimit);
    updatePagination({
      limit: parseInt(newLimit),
      page: newPage,
    });
    await fetchProducts();
  };

  // حساب نطاق الصفحات المعروضة
  const getPageRange = () => {
    const delta = 2; // عدد الصفحات على كل جانب من الصفحة الحالية
    const range = [];
    const rangeWithDots = [];

    // حساب البداية والنهاية
    const start = Math.max(1, page - delta);
    const end = Math.min(pages, page + delta);

    // إضافة الصفحات في النطاق
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // إضافة النقاط والصفحة الأولى إذا لزم الأمر
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push("...");
      }
    }

    // إضافة النطاق الرئيسي
    rangeWithDots.push(...range);

    // إضافة النقاط والصفحة الأخيرة إذا لزم الأمر
    if (end < pages) {
      if (end < pages - 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(pages);
    }

    return rangeWithDots;
  };

  // حساب نطاق العناصر المعروضة
  const getItemRange = () => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return { start, end };
  };

  if (pages <= 1) {
    return null; // لا نعرض pagination إذا كان هناك صفحة واحدة فقط
  }

  const { start, end } = getItemRange();
  const pageRange = getPageRange();

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        {/* معلومات العناصر */}
        <div className="flex items-center text-sm text-gray-700">
          <span>
            عرض {start.toLocaleString("ar-SA")} إلى{" "}
            {end.toLocaleString("ar-SA")} من {total.toLocaleString("ar-SA")}{" "}
            منتج
          </span>
        </div>

        {/* عدد العناصر لكل صفحة */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <label className="text-sm text-gray-700">عرض:</label>
          <select
            value={limit}
            onChange={(e) => changeLimit(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700">لكل صفحة</span>
        </div>
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between mt-4">
        {/* الأزرار الجانبية */}
        <div className="flex items-center space-x-1 space-x-reverse">
          {/* الذهاب للصفحة الأولى */}
          <button
            onClick={() => goToPage(1)}
            disabled={page === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="الصفحة الأولى"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>

          {/* الصفحة السابقة */}
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="الصفحة السابقة"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* أرقام الصفحات */}
        <div className="flex items-center space-x-1 space-x-reverse">
          {pageRange.map((pageNum, index) =>
            pageNum === "..." ? (
              <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pageNum === page
                    ? "bg-blue-500 text-white border border-blue-500"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum.toLocaleString("ar-SA")}
              </button>
            )
          )}
        </div>

        {/* الأزرار الجانبية */}
        <div className="flex items-center space-x-1 space-x-reverse">
          {/* الصفحة التالية */}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === pages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="الصفحة التالية"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* الذهاب للصفحة الأخيرة */}
          <button
            onClick={() => goToPage(pages)}
            disabled={page === pages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="الصفحة الأخيرة"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* شريط التقدم للصفحة الحالية */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(page / pages) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>الصفحة {page.toLocaleString("ar-SA")}</span>
          <span>من {pages.toLocaleString("ar-SA")}</span>
        </div>
      </div>

      {/* إدخال سريع لرقم الصفحة */}
      <div className="mt-3 flex items-center justify-center">
        <div className="flex items-center space-x-2 space-x-reverse text-sm">
          <span className="text-gray-700">الذهاب إلى الصفحة:</span>
          <input
            type="number"
            min="1"
            max={pages}
            placeholder={page.toString()}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const newPage = parseInt(e.target.value);
                if (newPage >= 1 && newPage <= pages) {
                  goToPage(newPage);
                  e.target.value = "";
                }
              }
            }}
            className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
          />
          <span className="text-gray-700">
            من {pages.toLocaleString("ar-SA")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductPagination;
