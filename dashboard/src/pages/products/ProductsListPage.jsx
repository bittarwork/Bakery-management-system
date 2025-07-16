import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Star,
  StarOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
  DollarSign,
  Package2,
  TrendingUp,
  TrendingDown,
  Image,
  Loader2,
  AlertCircle,
  FileText,
  BarChart3,
  Archive,
  Copy,
  Upload,
  Grid,
  List,
  Euro,
  Coins,
  ShoppingCart,
  Box,
  MoreVertical,
  Calculator,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  X,
  Check,
  Menu,
  Layers,
  Target,
  Award,
  BookOpen,
  Zap,
  Shield,
  Info,
  Settings,
  HelpCircle,
  ArrowUpDown,
  ChevronsUpDown,
  MinusCircle,
  PlusCircle,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import { productService } from "../../services/productService";
import { toast } from "react-hot-toast";

const ProductsListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // View mode (grid/list)
  const [viewMode, setViewMode] = useState("list");

  // Filters and search
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    is_featured: "",
    minPrice: "",
    maxPrice: "",
    lowStock: "",
    sortBy: "name",
    sortOrder: "ASC",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
    categories: 0,
    avgPrice: 0,
    topSellingProduct: null,
  });

  // Categories
  const [categories, setCategories] = useState([]);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: "",
    isLoading: false,
  });

  // Bulk actions
  const [bulkModal, setBulkModal] = useState({
    isOpen: false,
    action: "",
    title: "",
    message: "",
    isLoading: false,
  });

  // Load data
  useEffect(() => {
    loadProducts();
    loadStatistics();
    // loadCategories(); // Commented out until backend endpoint is implemented
  }, [pagination.currentPage, filters]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      const response = await productService.getProducts(params);

      if (response.success) {
        const productsData = response.data?.products || response.data || [];
        setProducts(productsData);

        if (response.data?.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: response.data.pagination.pages || 1,
            totalItems: response.data.pagination.total || productsData.length,
          }));
        }
      } else {
        setError(response.message || "خطأ في تحميل المنتجات");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("خطأ في تحميل بيانات المنتجات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await productService.getProductStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadCategories = async () => {
    try {
      // TODO: Implement categories endpoint in backend
      // const response = await productService.getCategories();
      // if (response.success) {
      //   setCategories(response.data);
      // }
      console.log("Categories endpoint not implemented in backend yet");
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Handle product selection
  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  // Handle product delete
  const handleDelete = async (productId, productName) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName,
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));

      const response = await productService.deleteProduct(
        deleteModal.productId
      );

      if (response.success) {
        setSuccess("تم حذف المنتج بنجاح");
        loadProducts();
        loadStatistics();
        setDeleteModal({
          isOpen: false,
          productId: null,
          productName: "",
          isLoading: false,
        });
      } else {
        setError(response.message || "خطأ في حذف المنتج");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("خطأ في حذف المنتج");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (productId) => {
    try {
      const response = await productService.toggleProductStatus(productId);
      if (response.success) {
        setSuccess("تم تحديث حالة المنتج بنجاح");
        loadProducts();
        loadStatistics();
      } else {
        setError(response.message || "خطأ في تحديث الحالة");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      setError("خطأ في تحديث حالة المنتج");
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (productId) => {
    try {
      const response = await productService.toggleProductFeatured(productId);
      if (response.success) {
        setSuccess("تم تحديث حالة المنتج المميز بنجاح");
        loadProducts();
        loadStatistics();
      } else {
        setError(response.message || "خطأ في تحديث الحالة");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      setError("خطأ في تحديث حالة المنتج المميز");
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      setError("يرجى اختيار منتج واحد على الأقل");
      return;
    }

    const actionConfig = {
      delete: {
        title: "حذف المنتجات المحددة",
        message: `هل أنت متأكد من حذف ${selectedProducts.length} منتج؟`,
        confirmText: "حذف",
        variant: "danger",
      },
      activate: {
        title: "تفعيل المنتجات المحددة",
        message: `هل تريد تفعيل ${selectedProducts.length} منتج؟`,
        confirmText: "تفعيل",
        variant: "success",
      },
      deactivate: {
        title: "إلغاء تفعيل المنتجات المحددة",
        message: `هل تريد إلغاء تفعيل ${selectedProducts.length} منتج؟`,
        confirmText: "إلغاء التفعيل",
        variant: "warning",
      },
      feature: {
        title: "جعل المنتجات مميزة",
        message: `هل تريد جعل ${selectedProducts.length} منتج مميز؟`,
        confirmText: "جعل مميز",
        variant: "primary",
      },
      unfeature: {
        title: "إلغاء تمييز المنتجات",
        message: `هل تريد إلغاء تمييز ${selectedProducts.length} منتج؟`,
        confirmText: "إلغاء التمييز",
        variant: "secondary",
      },
    };

    setBulkModal({
      isOpen: true,
      action,
      ...actionConfig[action],
      isLoading: false,
    });
  };

  const confirmBulkAction = async () => {
    try {
      setBulkModal((prev) => ({ ...prev, isLoading: true }));

      const response = await productService.bulkAction(
        selectedProducts,
        bulkModal.action
      );

      if (response.success) {
        setSuccess(
          `تم تنفيذ العملية على ${selectedProducts.length} منتج بنجاح`
        );
        setSelectedProducts([]);
        setShowBulkActions(false);
        loadProducts();
        loadStatistics();
        setBulkModal({
          isOpen: false,
          action: "",
          title: "",
          message: "",
          isLoading: false,
        });
      } else {
        setError(response.message || "خطأ في تنفيذ العملية");
      }
    } catch (error) {
      console.error("Error executing bulk action:", error);
      setError("خطأ في تنفيذ العملية المجمعة");
    } finally {
      setBulkModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setError("");
      setSuccess("");

      const response = await productService.exportProducts({ format, filters });
      if (response.success) {
        setSuccess(`تم تصدير المنتجات بتنسيق ${format.toUpperCase()} بنجاح`);
      } else {
        setError("خطأ في تصدير المنتجات");
      }
    } catch (error) {
      console.error("Error exporting products:", error);
      setError("خطأ في تصدير المنتجات");
    } finally {
      setIsExporting(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get stock status
  const getStockStatus = (stock, minStock) => {
    if (stock === 0) {
      return {
        text: "نفد المخزون",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: XCircle,
      };
    } else if (stock <= minStock) {
      return {
        text: "مخزون منخفض",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        icon: AlertTriangle,
      };
    } else {
      return {
        text: "متوفر",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: CheckCircle,
      };
    }
  };

  // Render product card for grid view
  const renderProductCard = (product) => {
    const stockStatus = getStockStatus(
      product.stock_quantity,
      product.minimum_stock
    );
    const StockIcon = stockStatus.icon;

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Product actions overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleProductSelection(product.id)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            {product.is_featured && (
              <div className="p-1 bg-yellow-500 rounded-full">
                <Star className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                product.status
              )}`}
            >
              {product.status === "active" ? "نشط" : "غير نشط"}
            </span>
          </div>

          {/* Stock status */}
          <div className="absolute bottom-2 left-2">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}
            >
              <StockIcon className="w-3 h-3 mr-1" />
              {stockStatus.text}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              <EnhancedButton
                onClick={() => handleToggleFeatured(product.id)}
                variant="ghost"
                size="sm"
                icon={
                  product.is_featured ? (
                    <StarOff className="w-4 h-4" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )
                }
              />
              <EnhancedButton
                onClick={() => navigate(`/products/${product.id}`)}
                variant="ghost"
                size="sm"
                icon={<Eye className="w-4 h-4" />}
              />
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-gray-500">الفئة</span>
              <p className="text-sm font-medium text-gray-900">
                {product.category}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">الوحدة</span>
              <p className="text-sm font-medium text-gray-900">
                {product.unit}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-gray-500">السعر</span>
              <p className="text-lg font-bold text-blue-600">
                €{(parseFloat(product.price_eur) || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">المخزون</span>
              <p className="text-sm font-medium text-gray-900">
                {product.stock_quantity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <EnhancedButton
              onClick={() => navigate(`/products/${product.id}`)}
              variant="primary"
              size="sm"
              icon={<Eye className="w-3 h-3" />}
              className="flex-1"
            >
              عرض
            </EnhancedButton>
            <EnhancedButton
              onClick={() => navigate(`/products/${product.id}/edit`)}
              variant="warning"
              size="sm"
              icon={<Edit className="w-3 h-3" />}
              className="flex-1"
            >
              تعديل
            </EnhancedButton>
            <EnhancedButton
              onClick={() => handleDelete(product.id, product.name)}
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3 h-3" />}
            >
              حذف
            </EnhancedButton>
          </div>
        </div>
      </motion.div>
    );
  };

  // Show loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-gray-600 mt-4">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                إدارة المنتجات
              </h1>
              <p className="text-gray-600 text-lg">
                إدارة كتالوج منتجات المخبز
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                <EnhancedButton
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "primary" : "ghost"}
                  size="sm"
                  icon={<List className="w-4 h-4" />}
                >
                  قائمة
                </EnhancedButton>
                <EnhancedButton
                  onClick={() => setViewMode("grid")}
                  variant={viewMode === "grid" ? "primary" : "ghost"}
                  size="sm"
                  icon={<Grid className="w-4 h-4" />}
                >
                  شبكة
                </EnhancedButton>
              </div>

              <EnhancedButton
                onClick={() => navigate("/products/create")}
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
              >
                إضافة منتج جديد
              </EnhancedButton>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        إجمالي المنتجات
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.totalProducts}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Package className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        المنتجات النشطة
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.activeProducts}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">
                        المنتجات المميزة
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.featuredProducts}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Star className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        مخزون منخفض
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.lowStockProducts}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Card className="mb-6 border-0 shadow-lg">
            <CardBody className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Search */}
                  <EnhancedInput
                    type="text"
                    placeholder="البحث في المنتجات..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    icon={<Search className="w-4 h-4" />}
                    size="md"
                  />

                  {/* Category filter */}
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الفئات</option>
                    <option value="bread">خبز</option>
                    <option value="pastry">معجنات</option>
                    <option value="cake">كيك</option>
                    <option value="cookies">بسكويت</option>
                    <option value="other">أخرى</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>

                  {/* Featured filter */}
                  <select
                    value={filters.is_featured}
                    onChange={(e) =>
                      handleFilterChange("is_featured", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">الكل</option>
                    <option value="true">منتجات مميزة</option>
                    <option value="false">غير مميزة</option>
                  </select>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <EnhancedButton
                      type="submit"
                      variant="primary"
                      icon={<Search className="w-4 h-4" />}
                    >
                      بحث
                    </EnhancedButton>
                    <EnhancedButton
                      type="button"
                      variant="secondary"
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={() => {
                        setFilters({
                          search: "",
                          category: "",
                          status: "",
                          is_featured: "",
                          minPrice: "",
                          maxPrice: "",
                          lowStock: "",
                          sortBy: "name",
                          sortOrder: "ASC",
                        });
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                    >
                      إعادة تعيين
                    </EnhancedButton>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="border-0 shadow-lg bg-blue-50">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          تم تحديد {selectedProducts.length} منتج
                        </p>
                        <p className="text-xs text-blue-700">
                          يمكنك تنفيذ العمليات التالية على المنتجات المحددة
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnhancedButton
                        onClick={() => handleBulkAction("activate")}
                        variant="success"
                        size="sm"
                        icon={<CheckCircle className="w-4 h-4" />}
                      >
                        تفعيل
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={() => handleBulkAction("deactivate")}
                        variant="warning"
                        size="sm"
                        icon={<XCircle className="w-4 h-4" />}
                      >
                        إلغاء تفعيل
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={() => handleBulkAction("feature")}
                        variant="primary"
                        size="sm"
                        icon={<Star className="w-4 h-4" />}
                      >
                        جعل مميز
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={() => handleBulkAction("delete")}
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        حذف
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={() => setSelectedProducts([])}
                        variant="ghost"
                        size="sm"
                        icon={<X className="w-4 h-4" />}
                      >
                        إلغاء التحديد
                      </EnhancedButton>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Content */}
        {viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product) => renderProductCard(product))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === products.length &&
                        products.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <h2 className="text-xl font-semibold text-gray-900">
                      قائمة المنتجات
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <EnhancedButton
                      onClick={() => handleExport("json")}
                      disabled={isExporting}
                      variant="success"
                      size="sm"
                      icon={
                        isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )
                      }
                    >
                      تصدير JSON
                    </EnhancedButton>
                    <EnhancedButton
                      onClick={() => handleExport("csv")}
                      disabled={isExporting}
                      variant="warning"
                      size="sm"
                      icon={
                        isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )
                      }
                    >
                      تصدير CSV
                    </EnhancedButton>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <EnhancedButton
                      onClick={loadProducts}
                      variant="primary"
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      إعادة المحاولة
                    </EnhancedButton>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">لا توجد منتجات متاحة</p>
                    <EnhancedButton
                      onClick={() => navigate("/products/create")}
                      variant="primary"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      إضافة منتج جديد
                    </EnhancedButton>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={
                                selectedProducts.length === products.length &&
                                products.length > 0
                              }
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المنتج
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الفئة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            السعر
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المخزون
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => {
                          const stockStatus = getStockStatus(
                            product.stock_quantity,
                            product.minimum_stock
                          );
                          const StockIcon = stockStatus.icon;

                          return (
                            <motion.tr
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.includes(
                                    product.id
                                  )}
                                  onChange={() =>
                                    handleProductSelection(product.id)
                                  }
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    {product.image_url ? (
                                      <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="h-12 w-12 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <Package className="w-6 h-6 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="mr-4">
                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                      {product.name}
                                      {product.is_featured && (
                                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {product.description &&
                                        product.description.substring(0, 50)}
                                      {product.description &&
                                        product.description.length > 50 &&
                                        "..."}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Tag className="w-4 h-4 text-gray-400 ml-2" />
                                  <span className="text-sm text-gray-900 capitalize">
                                    {product.category}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Euro className="w-4 h-4 text-green-500 ml-1" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {(
                                      parseFloat(product.price_eur) || 0
                                    ).toFixed(2)}
                                  </span>
                                </div>
                                {product.cost_eur > 0 && (
                                  <div className="text-xs text-gray-500">
                                    التكلفة: €
                                    {(
                                      parseFloat(product.cost_eur) || 0
                                    ).toFixed(2)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}
                                >
                                  <StockIcon className="w-3 h-3 mr-1" />
                                  {product.stock_quantity}
                                </div>
                                {product.minimum_stock > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    الحد الأدنى: {product.minimum_stock}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    product.status
                                  )}`}
                                >
                                  {product.status === "active" ? (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {product.status === "active"
                                    ? "نشط"
                                    : "غير نشط"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <EnhancedButton
                                    onClick={() =>
                                      navigate(`/products/${product.id}`)
                                    }
                                    variant="primary"
                                    size="sm"
                                    icon={<Eye className="w-3 h-3" />}
                                  >
                                    عرض
                                  </EnhancedButton>
                                  <EnhancedButton
                                    onClick={() =>
                                      navigate(`/products/${product.id}/edit`)
                                    }
                                    variant="warning"
                                    size="sm"
                                    icon={<Edit className="w-3 h-3" />}
                                  >
                                    تعديل
                                  </EnhancedButton>
                                  <EnhancedButton
                                    onClick={() =>
                                      handleToggleStatus(product.id)
                                    }
                                    variant={
                                      product.status === "active"
                                        ? "danger"
                                        : "success"
                                    }
                                    size="sm"
                                    icon={
                                      product.status === "active" ? (
                                        <XCircle className="w-3 h-3" />
                                      ) : (
                                        <CheckCircle className="w-3 h-3" />
                                      )
                                    }
                                  >
                                    {product.status === "active"
                                      ? "إلغاء تفعيل"
                                      : "تفعيل"}
                                  </EnhancedButton>
                                  <EnhancedButton
                                    onClick={() =>
                                      handleDelete(product.id, product.name)
                                    }
                                    variant="danger"
                                    size="sm"
                                    icon={<Trash2 className="w-3 h-3" />}
                                  >
                                    حذف
                                  </EnhancedButton>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <EnhancedButton
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="sm"
                icon={<ChevronDown className="w-4 h-4 rotate-90" />}
              >
                السابق
              </EnhancedButton>
              <span className="text-sm text-gray-600">
                صفحة {pagination.currentPage} من {pagination.totalPages}
              </span>
              <EnhancedButton
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                variant="outline"
                size="sm"
                icon={<ChevronUp className="w-4 h-4 rotate-90" />}
              >
                التالي
              </EnhancedButton>
            </div>
            <div className="text-sm text-gray-600">
              إجمالي {pagination.totalItems} منتج
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            productId: null,
            productName: "",
            isLoading: false,
          })
        }
        onConfirm={confirmDelete}
        itemName={deleteModal.productName}
        itemType="المنتج"
        isLoading={deleteModal.isLoading}
      />

      {/* Bulk Action Confirmation Modal */}
      <AnimatePresence>
        {bulkModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {bulkModal.title}
              </h3>
              <p className="text-gray-600 mb-6">{bulkModal.message}</p>
              <div className="flex justify-end gap-3">
                <EnhancedButton
                  onClick={() =>
                    setBulkModal({
                      isOpen: false,
                      action: "",
                      title: "",
                      message: "",
                      isLoading: false,
                    })
                  }
                  variant="outline"
                  disabled={bulkModal.isLoading}
                >
                  إلغاء
                </EnhancedButton>
                <EnhancedButton
                  onClick={confirmBulkAction}
                  variant={bulkModal.variant || "primary"}
                  disabled={bulkModal.isLoading}
                  icon={
                    bulkModal.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null
                  }
                >
                  {bulkModal.confirmText || "تأكيد"}
                </EnhancedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsListPage;
