import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
  DollarSign,
  Package2,
  TrendingUp,
  TrendingDown,
  Image,
  Star,
  StarOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import { productService } from "../../services/productService";

const ProductsListPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [productStats, setProductStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    search: "",
    sortBy: "name",
    sortOrder: "ASC",
  });

  // Fetch products and statistics
  const fetchProducts = async (page = 1, currentFilters = filters) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...currentFilters,
      };

      const response = await productService.getProducts(params);

      if (response.success) {
        setProducts(response.data.products);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.data.pagination.current_page,
          totalPages: response.data.pagination.total_pages,
          totalItems: response.data.pagination.total_items,
        }));

        // Set statistics if available
        if (response.data.statistics) {
          setProductStats(response.data.statistics);
        }
      } else {
        throw new Error(response.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product statistics
  const fetchProductStats = async () => {
    try {
      const response = await productService.getProductStatistics();
      if (response.success) {
        setProductStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching product statistics:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchProductStats();
  }, []);

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchProducts(newPage);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchProducts(1, newFilters);
  };

  // Handle delete product
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await productService.deleteProduct(productId);
      if (response.success) {
        toast.success("Product deleted successfully");
        fetchProducts(pagination.currentPage);
        fetchProductStats();
      } else {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Handle toggle product status
  const handleToggleStatus = async (productId) => {
    try {
      const response = await productService.toggleProductStatus(productId);
      if (response.success) {
        toast.success("Product status updated successfully");
        fetchProducts(pagination.currentPage);
        fetchProductStats();
      } else {
        throw new Error(response.message || "Failed to update product status");
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Failed to update product status");
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await productService.exportProducts(filters);
      if (response.success) {
        toast.success("Products exported successfully");
        // Handle download if needed
      } else {
        throw new Error(response.message || "Failed to export products");
      }
    } catch (error) {
      console.error("Error exporting products:", error);
      toast.error("Failed to export products");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchProducts(pagination.currentPage);
    fetchProductStats();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return CheckCircle;
      case "inactive":
        return XCircle;
      default:
        return Package;
    }
  };

  // Get stock status
  const getStockStatus = (stock, minStock) => {
    if (stock === 0)
      return { status: "out", color: "text-red-600", bg: "bg-red-100" };
    if (stock <= minStock)
      return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { status: "good", color: "text-green-600", bg: "bg-green-100" };
  };

  // Get stock icon
  const getStockIcon = (stock, minStock) => {
    const stockStatus = getStockStatus(stock, minStock);
    switch (stockStatus.status) {
      case "out":
        return XCircle;
      case "low":
        return AlertTriangle;
      case "good":
        return CheckCircle;
      default:
        return Package2;
    }
  };

  // Table columns
  const columns = [
    {
      key: "name",
      title: "Product",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
            {row.image_url ? (
              <img
                src={row.image_url}
                alt={value}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center">
              {value}
              {row.is_featured && (
                <Star className="w-4 h-4 text-yellow-500 ml-1" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              {row.category} • {row.unit}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price_eur",
      title: "Price",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">€{value.toFixed(2)}</div>
          <div className="text-sm text-gray-500">
            Cost: €{row.cost_eur.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: "stock_quantity",
      title: "Stock",
      render: (value, row) => {
        const stockStatus = getStockStatus(value, row.minimum_stock);
        const StockIcon = getStockIcon(value, row.minimum_stock);
        return (
          <div className="flex items-center">
            <StockIcon className={`w-4 h-4 mr-2 ${stockStatus.color}`} />
            <div>
              <div className={`font-medium ${stockStatus.color}`}>{value}</div>
              <div className="text-sm text-gray-500">
                Min: {row.minimum_stock}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const Icon = getStatusIcon(value);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              value
            )}`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {value === "active" ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Link to={`/products/${row.id}`}>
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
            >
              View
            </Button>
          </Link>
          <Link to={`/products/${row.id}/edit`}>
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={
              row.is_featured ? (
                <StarOff className="w-4 h-4" />
              ) : (
                <Star className="w-4 h-4" />
              )
            }
            onClick={() => handleToggleStatus(row.id)}
          >
            {row.is_featured ? "Unfeature" : "Feature"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Calculate stats from current data if not provided by API
  const stats = productStats || {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    lowStock: products.filter(
      (p) => p.stock_quantity <= p.minimum_stock && p.stock_quantity > 0
    ).length,
    outOfStock: products.filter((p) => p.stock_quantity === 0).length,
    totalValue: products.reduce(
      (sum, product) => sum + product.price_eur * product.stock_quantity,
      0
    ),
  };

  // Loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={handleRefresh}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your bakery product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={
              isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )
            }
            onClick={handleExport}
            disabled={isExporting}
          >
            Export
          </Button>
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Link to="/products/create">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Products
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.lowStock}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.outOfStock}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                €{stats.totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const resetFilters = {
                  category: "",
                  status: "",
                  search: "",
                  sortBy: "name",
                  sortOrder: "ASC",
                };
                setFilters(resetFilters);
                fetchProducts(1, resetFilters);
              }}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="bread">Bread</option>
                <option value="pastry">Pastry</option>
                <option value="cake">Cake</option>
                <option value="cookies">Cookies</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="name">Name</option>
                <option value="price_eur">Price</option>
                <option value="stock_quantity">Stock</option>
                <option value="created_at">Created Date</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                placeholder="Search by name, description..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Products List</h2>
        </CardHeader>
        <CardBody>
          <DataTable
            data={products}
            columns={columns}
            searchable={false}
            sortable={false}
            pagination={true}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
            loading={isLoading}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductsListPage;
