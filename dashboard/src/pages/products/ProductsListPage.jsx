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
  Sliders,
  ChevronLeft,
  ChevronRight,
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

  // State management
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    is_featured: "",
    sortBy: "name",
    sortOrder: "ASC",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: "",
    isLoading: false,
  });

  // Categories for filtering
  const categories = [
    { value: "", label: "All Categories", icon: "📦" },
    { value: "bread", label: "Bread & Baked Goods", icon: "🍞" },
    { value: "pastry", label: "Pastries", icon: "🥐" },
    { value: "cake", label: "Cakes & Desserts", icon: "🎂" },
    { value: "drink", label: "Beverages", icon: "☕" },
    { value: "snack", label: "Snacks", icon: "🥨" },
    { value: "seasonal", label: "Seasonal Items", icon: "🎄" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  // Load products
  const loadProducts = async () => {
    try {
      // Show different loading states for initial load vs filtering
      if (products.length === 0) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError("");

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: filters.search,
        category: filters.category,
        status: filters.status,
        is_featured: filters.is_featured,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await productService.getProducts(params);

      if (response.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalProducts(response.data.total || 0);

        // Mock statistics for now - you can implement this in your API
        setStatistics({
          total: response.data.total || 0,
          active:
            response.data.products?.filter((p) => p.status === "active")
              .length || 0,
          inactive:
            response.data.products?.filter((p) => p.status === "inactive")
              .length || 0,
          featured:
            response.data.products?.filter((p) => p.is_featured).length || 0,
          lowStock:
            response.data.products?.filter(
              (p) => p.stock_quantity <= p.minimum_stock && p.stock_quantity > 0
            ).length || 0,
          outOfStock:
            response.data.products?.filter((p) => p.stock_quantity === 0)
              .length || 0,
        });
      } else {
        throw new Error(response.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError(err.message || "Failed to load products");
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        loadProducts();
      },
      filters.search ? 500 : 0
    ); // Add delay only for search

    return () => clearTimeout(timeoutId);
  }, [currentPage, filters]);

  // Handle search input with immediate state update but debounced API call
  const handleSearchChange = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      is_featured: "",
      sortBy: "name",
      sortOrder: "ASC",
    });
    setCurrentPage(1);
  };

  // Handle product selection
  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product.id,
      productName: product.name,
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
        toast.success("Product deleted successfully");
        loadProducts();
        setDeleteModal({
          isOpen: false,
          productId: null,
          productName: "",
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Toggle product status
  const handleToggleStatus = async (product) => {
    try {
      const response = await productService.toggleProductStatus(product.id);
      if (response.success) {
        toast.success("Product status updated successfully");
        loadProducts();
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update product status");
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (product) => {
    try {
      const response = await productService.toggleProductFeatured(product.id);
      if (response.success) {
        toast.success("Featured status updated successfully");
        loadProducts();
      } else {
        throw new Error(response.message || "Failed to update featured status");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Failed to update featured status");
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
        text: "Out of Stock",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: XCircle,
      };
    } else if (stock <= minStock) {
      return {
        text: "Low Stock",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        icon: AlertTriangle,
      };
    } else {
      return {
        text: "In Stock",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: CheckCircle,
      };
    }
  };

  // Render product card
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
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
      >
        {/* Product Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Selection checkbox and badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleProductSelection(product.id)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            {product.is_featured && (
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                product.status
              )}`}
            >
              {product.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description || "No description available"}
            </p>
          </div>

          {/* Price and Stock */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-bold text-gray-900">
                €{parseFloat(product.price_eur || 0).toFixed(2)}
              </p>
              {product.price_syp && (
                <p className="text-sm text-gray-600">
                  {parseFloat(product.price_syp).toFixed(0)} SYP
                </p>
              )}
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color} flex items-center gap-1`}
            >
              <StockIcon className="w-3 h-3" />
              <span>{stockStatus.text}</span>
            </div>
          </div>

          {/* Stock Info */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Stock</span>
              <span>{product.stock_quantity || 0} units</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  product.stock_quantity === 0
                    ? "bg-red-500"
                    : product.stock_quantity <= product.minimum_stock
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (product.stock_quantity /
                      Math.max(product.minimum_stock * 2, 1)) *
                      100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <EnhancedButton
              onClick={() => navigate(`/products/${product.id}`)}
              variant="primary"
              size="sm"
              icon={<Eye className="w-3 h-3" />}
            >
              View
            </EnhancedButton>
            <EnhancedButton
              onClick={() => navigate(`/products/${product.id}/edit`)}
              variant="warning"
              size="sm"
              icon={<Edit className="w-3 h-3" />}
            >
              Edit
            </EnhancedButton>
            <div className="relative ml-auto">
              <ProductQuickActions
                product={product}
                onView={() => navigate(`/products/${product.id}`)}
                onEdit={() => navigate(`/products/${product.id}/edit`)}
                onToggleStatus={() => handleToggleStatus(product)}
                onToggleFeatured={() => handleToggleFeatured(product)}
                onDelete={() => handleDeleteProduct(product)}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                Product Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your bakery products and inventory
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <EnhancedButton
                  onClick={() => setShowFilters(!showFilters)}
                  variant={filters.search || filters.category || filters.status || filters.is_featured ? "primary" : "outline"}
                  size="sm"
                  icon={<Sliders className="w-4 h-4" />}
                >
                  {showFilters ? "Hide Filters" : "Filters"}
                </EnhancedButton>
                {(filters.search || filters.category || filters.status || filters.is_featured) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>

              <EnhancedButton
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "table" : "grid")
                }
                variant="outline"
                size="sm"
                icon={
                  viewMode === "grid" ? (
                    <List className="w-4 h-4" />
                  ) : (
                    <Grid className="w-4 h-4" />
                  )
                }
              >
                {viewMode === "grid" ? "Table" : "Grid"}
              </EnhancedButton>

              <EnhancedButton
                onClick={loadProducts}
                variant="outline"
                size="sm"
                icon={
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                }
              >
                Refresh
              </EnhancedButton>

              <EnhancedButton
                onClick={() => navigate("/products/create")}
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                Add Product
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                    Total
                  </p>
                  <p className="text-2xl font-bold mt-1">{statistics.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium uppercase tracking-wide">
                    Active
                  </p>
                  <p className="text-2xl font-bold mt-1">{statistics.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs font-medium uppercase tracking-wide">
                    Featured
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.featured}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium uppercase tracking-wide">
                    Inactive
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.inactive}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-purple-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium uppercase tracking-wide">
                    Low Stock
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.lowStock}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium uppercase tracking-wide">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.outOfStock}
                  </p>
                </div>
                <Package2 className="w-8 h-8 text-red-200" />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardBody>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <EnhancedInput
                    placeholder="Search products by name, description, or barcode..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    icon={isFiltering && filters.search ? 
                      <Loader2 className="w-4 h-4 animate-spin" /> : 
                      <Search className="w-4 h-4" />
                    }
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        filters.category ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {filters.category && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        filters.status ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {filters.status && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={filters.is_featured}
                      onChange={(e) =>
                        handleFilterChange("is_featured", e.target.value)
                      }
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        filters.is_featured ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">All Products</option>
                      <option value="true">Featured Only</option>
                      <option value="false">Non-Featured</option>
                    </select>
                    {filters.is_featured && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>

                  {(filters.search ||
                    filters.category ||
                    filters.status ||
                    filters.is_featured) && (
                    <EnhancedButton
                      onClick={clearAllFilters}
                      variant="outline"
                      size="sm"
                      icon={<X className="w-4 h-4" />}
                    >
                      Clear
                    </EnhancedButton>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Filter Results Info */}
        {!isLoading && !error && (filters.search || filters.category || filters.status || filters.is_featured) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FilterIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">
                      Filters applied - Found {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                    </span>
                    {isFiltering && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    {filters.search && (
                      <span className="px-2 py-1 bg-blue-200 rounded-full">
                        Search: "{filters.search}"
                      </span>
                    )}
                    {filters.category && (
                      <span className="px-2 py-1 bg-blue-200 rounded-full">
                        Category: {categories.find(c => c.value === filters.category)?.label}
                      </span>
                    )}
                    {filters.status && (
                      <span className="px-2 py-1 bg-blue-200 rounded-full">
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.is_featured && (
                      <span className="px-2 py-1 bg-blue-200 rounded-full">
                        {filters.is_featured === 'true' ? 'Featured Only' : 'Non-Featured'}
                      </span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">
                      {selectedProducts.length} products selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EnhancedButton
                      onClick={() => setSelectedProducts([])}
                      variant="outline"
                      size="sm"
                    >
                      Clear Selection
                    </EnhancedButton>
                    <EnhancedButton
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete Selected
                    </EnhancedButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Error Loading Products
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <EnhancedButton
                    onClick={loadProducts}
                    variant="primary"
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Try Again
                  </EnhancedButton>
                </div>
              </CardBody>
            </Card>
          ) : products.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filters.search || filters.category || filters.status
                      ? "No products match your current filters."
                      : "Get started by adding your first product."}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {(filters.search || filters.category || filters.status) && (
                      <EnhancedButton
                        onClick={clearAllFilters}
                        variant="outline"
                        icon={<X className="w-4 h-4" />}
                      >
                        Clear Filters
                      </EnhancedButton>
                    )}
                    <EnhancedButton
                      onClick={() => navigate("/products/create")}
                      variant="primary"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add First Product
                    </EnhancedButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => renderProductCard(product))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="flex items-center gap-2">
                    <EnhancedButton
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Previous
                    </EnhancedButton>

                    <span className="text-sm text-gray-600 mx-4">
                      Page {currentPage} of {totalPages}
                    </span>

                    <EnhancedButton
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      icon={<ChevronRight className="w-4 h-4" />}
                    >
                      Next
                    </EnhancedButton>
                  </div>

                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalProducts)} of{" "}
                    {totalProducts} products
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

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
          itemType="product"
          isLoading={deleteModal.isLoading}
        />
      </div>
    </div>
  );
};

// Quick Actions Component
const ProductQuickActions = ({
  product,
  onView,
  onEdit,
  onToggleStatus,
  onToggleFeatured,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <EnhancedButton
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        icon={<MoreVertical className="w-4 h-4" />}
      />

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  onToggleStatus();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                {product.status === "active" ? (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Activate
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onToggleFeatured();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                {product.is_featured ? (
                  <>
                    <StarOff className="w-4 h-4 text-yellow-500" />
                    Unfeature
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 text-yellow-500" />
                    Feature
                  </>
                )}
              </button>

              <hr className="my-1" />

              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsListPage;
