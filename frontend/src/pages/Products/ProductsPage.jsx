import { useState, useEffect } from "react";
import { Package, Plus, Grid, List, AlertCircle, Loader } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { Button } from "../../components/common";
import { useProductStore } from "../../store/productStore";
import ProductStatistics from "../../components/Products/ProductStatistics";
import ProductFilters from "../../components/Products/ProductFilters";
import ProductCard from "../../components/Products/ProductCard";
import ProductForm from "../../components/Products/ProductForm";
import ProductPagination from "../../components/Products/ProductPagination";
import { useToastContext } from "../../components/common";
import "../../services/testProducts.js"; // أداة اختبار المنتجات
import { getLocalizedText } from "../../utils/formatters";

const ProductsPage = () => {
  const toast = useToastContext();
  const {
    products,
    statistics,
    loading,
    error,
    pagination,
    fetchProducts,
    clearError,
  } = useProductStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // مسح الأخطاء عند إغلاق الرسالة
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // فتح نموذج إضافة منتج جديد
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  // فتح نموذج تعديل منتج
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  // إغلاق النموذج
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  // عند نجاح العملية
  const handleFormSuccess = (data) => {
    toast.success("تم حفظ المنتج بنجاح");
    fetchProducts(); // إعادة جلب البيانات
  };

  // عرض منتج
  const handleViewProduct = (product) => {
    // يمكن إضافة modal لعرض تفاصيل المنتج
    console.log("View product:", product);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Unified Page Header */}
      <PageHeader
        className="mb-6"
        icon={Package}
        title={getLocalizedText(
          "products_management",
          "إدارة المنتجات",
          "Products Management"
        )}
        subtitle={getLocalizedText(
          "view_manage_products",
          "عرض وإدارة جميع المنتجات والأسعار",
          "View and manage all products and prices"
        )}
      >
        {/* تبديل وضع العرض */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "primary" : "outline"}
            size="sm"
            icon={Grid}
            onClick={() => setViewMode("grid")}
            title="عرض شبكي"
          />
          <Button
            variant={viewMode === "list" ? "primary" : "outline"}
            size="sm"
            icon={List}
            onClick={() => setViewMode("list")}
            title="عرض قائمة"
          />
        </div>

        {/* زر اختبار API */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.testProducts && window.testProducts()}
        >
          اختبار API
        </Button>

        {/* زر إضافة منتج */}
        <Button
          variant="primary"
          icon={Plus}
          size="md"
          onClick={handleAddProduct}
        >
          إضافة منتج
        </Button>
      </PageHeader>

      {/* الإحصائيات */}
      <ProductStatistics statistics={statistics} loading={loading} />

      {/* البحث والتصفية */}
      <ProductFilters />

      {/* رسالة خطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">حدث خطأ</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* قائمة المنتجات */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
            <span className="mr-3 text-gray-600">جاري تحميل المنتجات...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد منتجات
            </h3>
            <p className="text-gray-500 mb-4">
              لم يتم العثور على أي منتجات. ابدأ بإضافة المنتج الأول
            </p>
            <button
              onClick={handleAddProduct}
              className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة منتج جديد
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* عداد النتائج */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-700">
                عرض {products.length} منتج من أصل {pagination.total}
              </p>

              <div className="text-sm text-gray-500">
                الصفحة {pagination.page} من {pagination.pages}
              </div>
            </div>

            {/* عرض المنتجات */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onView={handleViewProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg"
                  >
                    <ProductCard
                      product={product}
                      onEdit={handleEditProduct}
                      onView={handleViewProduct}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && <ProductPagination />}
      </div>

      {/* نموذج إضافة/تعديل المنتج */}
      <ProductForm
        product={selectedProduct}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default ProductsPage;
