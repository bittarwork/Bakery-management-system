import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Edit,
  Package,
  Star,
  StarOff,
  Trash2,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
  Calendar,
  Scale,
  Thermometer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Loader2,
  AlertCircle,
  Image,
  Download,
  Eye,
  RefreshCw,
  ShoppingCart,
  Package2,
  FileText,
  Heart,
  Users,
  Euro,
  Coins,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { productService } from "../../services/productService";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch product data
  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productService.getProduct(id);
      if (response.success) {
        setProduct(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.message);
      toast.error("Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product analytics
  const fetchAnalytics = async () => {
    try {
      const response = await productService.getProductAnalytics(id);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Don't show error toast for analytics as it's not critical
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchAnalytics();
    }
  }, [id]);

  // Handle product deletion
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        toast.success("Product deleted successfully");
        navigate("/products");
      } else {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      setIsUpdatingStatus(true);
      const response = await productService.toggleProductStatus(id);
      if (response.success) {
        setProduct(response.data);
        toast.success("Product status updated successfully");
      } else {
        throw new Error(response.message || "Failed to update product status");
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    } finally {
      setIsUpdatingStatus(false);
    }
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
      return {
        status: "out",
        color: "text-red-600",
        bg: "bg-red-100",
        icon: XCircle,
      };
    if (stock <= minStock)
      return {
        status: "low",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        icon: AlertTriangle,
      };
    return {
      status: "good",
      color: "text-green-600",
      bg: "bg-green-100",
      icon: CheckCircle,
    };
  };

  // Format currency
  const formatCurrency = (amount, currency = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-2">
            <Button
              onClick={fetchProduct}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
            <Link to="/products">
              <Button variant="outline">Back to Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const stockStatus = getStockStatus(
    product.stock_quantity,
    product.minimum_stock
  );
  const StatusIcon = getStatusIcon(product.status);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link to="/products" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {product.name}
              {product.is_featured && (
                <Star className="w-5 h-5 text-yellow-500 ml-2" />
              )}
            </h1>
            <p className="text-gray-600">
              {product.category} • {product.unit}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            icon={
              isUpdatingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : product.is_featured ? (
                <StarOff className="w-4 h-4" />
              ) : (
                <Star className="w-4 h-4" />
              )
            }
          >
            {product.is_featured ? "Unfeature" : "Feature"}
          </Button>
          <Link to={`/products/${id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Product Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Product Information
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Image className="w-4 h-4" />}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            product.status
                          )}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {product.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Category
                      </label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {product.category}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Unit
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.unit}
                      </p>
                    </div>

                    {product.barcode && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Barcode
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {product.barcode}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Price (EUR)
                  </label>
                  <p className="mt-1 text-2xl font-bold text-gray-900 flex items-center">
                    <Euro className="w-5 h-5 mr-1" />
                    {formatCurrency(product.price_eur, "EUR")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Price (SYP)
                  </label>
                  <p className="mt-1 text-2xl font-bold text-gray-900 flex items-center">
                    <Coins className="w-5 h-5 mr-1" />
                    {product.price_syp
                      ? formatCurrency(product.price_syp, "SYP")
                      : "Not set"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cost (EUR)
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(product.cost_eur, "EUR")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Profit Margin
                  </label>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {product.cost_eur > 0
                      ? `${(
                          ((product.price_eur - product.cost_eur) /
                            product.price_eur) *
                          100
                        ).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Additional Details
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.weight_grams && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Weight
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {product.weight_grams}g
                    </p>
                  </div>
                )}

                {product.shelf_life_days && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Shelf Life
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {product.shelf_life_days} days
                    </p>
                  </div>
                )}

                {product.storage_conditions && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Storage Conditions
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {product.storage_conditions}
                    </p>
                  </div>
                )}

                {product.supplier_info && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Supplier Information
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {product.supplier_info}
                    </p>
                  </div>
                )}

                {product.nutritional_info && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Nutritional Information
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {product.nutritional_info}
                    </p>
                  </div>
                )}

                {product.allergen_info && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Allergen Information
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {product.allergen_info}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Package2 className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Stock Status
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Current Stock
                  </label>
                  <div className="mt-1 flex items-center">
                    <stockStatus.icon
                      className={`w-5 h-5 mr-2 ${stockStatus.color}`}
                    />
                    <span className={`text-2xl font-bold ${stockStatus.color}`}>
                      {product.stock_quantity}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Minimum Stock
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {product.minimum_stock}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Stock Value
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(
                      product.price_eur * product.stock_quantity,
                      "EUR"
                    )}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    icon={<Package className="w-4 h-4" />}
                  >
                    Update Stock
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Statistics
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Orders</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {analytics?.total_orders || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Revenue</span>
                  <span className="text-lg font-semibold text-green-600">
                    {analytics?.total_revenue
                      ? formatCurrency(analytics.total_revenue, "EUR")
                      : "€0.00"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Avg Daily Sales</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {analytics?.avg_daily_sales || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Order</span>
                  <span className="text-sm text-gray-900">
                    {analytics?.last_order_date || "Never"}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Sales Trend
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart will be integrated here</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
