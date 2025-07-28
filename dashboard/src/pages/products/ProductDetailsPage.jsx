import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  StarOff,
  Package,
  Tag,
  DollarSign,
  Calendar,
  Scale,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Share2,
  Copy,
  Heart,
  Package2,
  Euro,
  Coins,
  Calculator,
  Layers,
  Image,
  FileText,
  Award,
  Zap,
  Target,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import BackButton from "../../components/ui/BackButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import { productService } from "../../services/productService";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isToggleFeatured, setIsToggleFeatured] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  // Load product data
  useEffect(() => {
    if (id && !isNaN(id) && id !== 'new' && id !== 'create') {
      loadProductData();
    } else if (id === 'new' || id === 'create') {
      // Redirect to create page if someone tries to access /products/new or /products/create
      navigate('/products/create', { replace: true });
    } else if (id && isNaN(id)) {
      setError("Invalid product ID");
      setIsLoading(false);
    }
  }, [id, navigate]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await productService.getProduct(id);

      if (response.success) {
        setProduct(response.data);

        // Load additional data
        await Promise.all([
          loadAnalytics(),
          loadPerformance(),
          loadSalesHistory(),
          loadInventory(),
        ]);
      } else {
        throw new Error(response.message || "Failed to load product");
      }
    } catch (err) {
      console.error("Error loading product:", err);
      setError(err.message || "Failed to load product details");
      toast.error("Failed to load product details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await productService.getProductAnalytics(id);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const loadPerformance = async () => {
    try {
      const response = await productService.getProductPerformance(id);
      if (response.success) {
        setPerformance(response.data);
      }
    } catch (error) {
      console.error("Error loading performance:", error);
    }
  };

  const loadSalesHistory = async () => {
    try {
      const response = await productService.getProductSalesHistory(id);
      if (response.success) {
        setSalesHistory(response.data);
      }
    } catch (error) {
      console.error("Error loading sales history:", error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await productService.getProductInventory(id);
      if (response.success) {
        setInventory(response.data);
      }
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  };

  // Toggle product status
  const handleToggleStatus = async () => {
    try {
      setIsUpdatingStatus(true);
      const response = await productService.toggleProductStatus(id);

      if (response.success) {
        setProduct((prev) => ({
          ...prev,
          status: prev.status === "active" ? "inactive" : "active",
        }));
        toast.success("Product status updated successfully");
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update product status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async () => {
    try {
      setIsToggleFeatured(true);
      const response = await productService.toggleProductFeatured(id);

      if (response.success) {
        setProduct((prev) => ({ ...prev, is_featured: !prev.is_featured }));
        toast.success("Featured status updated successfully");
      } else {
        throw new Error(response.message || "Failed to update featured status");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Failed to update featured status");
    } finally {
      setIsToggleFeatured(false);
    }
  };

  // Delete product
  const handleDelete = () => {
    setDeleteModal({ isOpen: true, isLoading: false });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));

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
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Product Not Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {error || "The requested product could not be found."}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <EnhancedButton
                    onClick={() => navigate("/products")}
                    variant="outline"
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back to Products
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={loadProductData}
                    variant="primary"
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Try Again
                  </EnhancedButton>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(
    product.stock_quantity,
    product.minimum_stock
  );
  const StockIcon = stockStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton to="/products" />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  {product.is_featured && (
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      product.status
                    )}`}
                  >
                    {product.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-gray-600">
                  Product Details • Category: {product.category} • Updated{" "}
                  {new Date(product.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <EnhancedButton
                onClick={handleToggleStatus}
                variant={product.status === "active" ? "warning" : "success"}
                disabled={isUpdatingStatus}
                icon={
                  isUpdatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : product.status === "active" ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )
                }
              >
                {product.status === "active" ? "Deactivate" : "Activate"}
              </EnhancedButton>

              <EnhancedButton
                onClick={handleToggleFeatured}
                variant={product.is_featured ? "warning" : "primary"}
                disabled={isToggleFeatured}
                icon={
                  isToggleFeatured ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : product.is_featured ? (
                    <StarOff className="w-4 h-4" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )
                }
              >
                {product.is_featured ? "Unfeature" : "Feature"}
              </EnhancedButton>

              <EnhancedButton
                onClick={() => navigate(`/products/${id}/edit`)}
                variant="primary"
                icon={<Edit className="w-4 h-4" />}
              >
                Edit Product
              </EnhancedButton>

              <EnhancedButton
                onClick={handleDelete}
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Product Overview
                      </h2>
                      <p className="text-sm text-gray-600">
                        Essential product information
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Image */}
                    <div>
                      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
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
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Description
                        </h3>
                        <p className="text-gray-900">
                          {product.description || "No description available"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Category
                          </h4>
                          <p className="text-gray-900 capitalize">
                            {product.category}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Unit
                          </h4>
                          <p className="text-gray-900">{product.unit}</p>
                        </div>
                      </div>

                      {product.barcode && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Barcode
                          </h4>
                          <p className="text-gray-900 font-mono">
                            {product.barcode}
                          </p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Created by
                          </span>
                          <span className="text-sm text-gray-900">
                            {product.created_by_name || "System"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-600">
                            Created on
                          </span>
                          <span className="text-sm text-gray-900">
                            {new Date(product.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Pricing & Financial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Pricing & Financial
                      </h2>
                      <p className="text-sm text-gray-600">
                        Pricing details and profit margins
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* EUR Pricing */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Euro className="w-4 h-4 text-green-600" />
                        EUR Pricing
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Selling Price</span>
                          <span className="text-lg font-bold text-green-600">
                            €{parseFloat(product.price_eur || 0).toFixed(2)}
                          </span>
                        </div>
                        {product.cost_eur > 0 && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Cost Price</span>
                              <span className="text-gray-900">
                                €{parseFloat(product.cost_eur).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                Profit Margin
                              </span>
                              <span className="text-blue-600 font-medium">
                                €
                                {(
                                  parseFloat(product.price_eur) -
                                  parseFloat(product.cost_eur)
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Margin %</span>
                              <span className="text-purple-600 font-medium">
                                {(
                                  ((parseFloat(product.price_eur) -
                                    parseFloat(product.cost_eur)) /
                                    parseFloat(product.cost_eur)) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* SYP Pricing */}
                    {product.price_syp && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          <Coins className="w-4 h-4 text-orange-600" />
                          SYP Pricing
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Selling Price</span>
                            <span className="text-lg font-bold text-orange-600">
                              {parseFloat(product.price_syp).toLocaleString()}{" "}
                              SYP
                            </span>
                          </div>
                          {product.cost_syp > 0 && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  Cost Price
                                </span>
                                <span className="text-gray-900">
                                  {parseFloat(
                                    product.cost_syp
                                  ).toLocaleString()}{" "}
                                  SYP
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  Profit Margin
                                </span>
                                <span className="text-blue-600 font-medium">
                                  {(
                                    parseFloat(product.price_syp) -
                                    parseFloat(product.cost_syp)
                                  ).toLocaleString()}{" "}
                                  SYP
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Revenue Information */}
                  {(product.total_revenue_eur > 0 ||
                    product.total_revenue_syp > 0) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Total Revenue
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            €
                            {parseFloat(product.total_revenue_eur || 0).toFixed(
                              2
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total Revenue (EUR)
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {parseFloat(
                              product.total_revenue_syp || 0
                            ).toLocaleString()}{" "}
                            SYP
                          </p>
                          <p className="text-sm text-gray-600">
                            Total Revenue (SYP)
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {product.total_sold || 0}
                          </p>
                          <p className="text-sm text-gray-600">Units Sold</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Advanced Details */}
            {(product.weight_grams ||
              product.shelf_life_days ||
              product.storage_conditions ||
              product.nutritional_info ||
              product.allergen_info ||
              product.supplier_info) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Advanced Details
                        </h2>
                        <p className="text-sm text-gray-600">
                          Additional product specifications
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Physical Properties */}
                      {(product.weight_grams || product.shelf_life_days) && (
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">
                            Physical Properties
                          </h3>
                          {product.weight_grams && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center gap-2">
                                <Scale className="w-4 h-4" />
                                Weight
                              </span>
                              <span className="text-gray-900">
                                {product.weight_grams}g
                              </span>
                            </div>
                          )}
                          {product.shelf_life_days && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Shelf Life
                              </span>
                              <span className="text-gray-900">
                                {product.shelf_life_days} days
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dates */}
                      {(product.production_date || product.expiry_date) && (
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">
                            Important Dates
                          </h3>
                          {product.production_date && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Production Date
                              </span>
                              <span className="text-gray-900">
                                {new Date(
                                  product.production_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {product.expiry_date && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Expiry Date
                              </span>
                              <span className="text-gray-900">
                                {new Date(
                                  product.expiry_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Text Fields */}
                    <div className="mt-6 space-y-4">
                      {product.storage_conditions && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            Storage Conditions
                          </h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {product.storage_conditions}
                          </p>
                        </div>
                      )}

                      {product.supplier_info && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Supplier Information
                          </h4>
                          <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {typeof product.supplier_info === "string" ? (
                              <p>{product.supplier_info}</p>
                            ) : (
                              <div className="space-y-2">
                                {product.supplier_info.name && (
                                  <p>
                                    <strong>Name:</strong>{" "}
                                    {product.supplier_info.name}
                                  </p>
                                )}
                                {product.supplier_info.contact && (
                                  <p>
                                    <strong>Contact:</strong>{" "}
                                    {product.supplier_info.contact}
                                  </p>
                                )}
                                {product.supplier_info.notes && (
                                  <p>
                                    <strong>Notes:</strong>{" "}
                                    {product.supplier_info.notes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {product.nutritional_info && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Nutritional Information
                          </h4>
                          <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {typeof product.nutritional_info === "string" ? (
                              <p>{product.nutritional_info}</p>
                            ) : (
                              <div className="space-y-2">
                                {product.nutritional_info.description && (
                                  <p>{product.nutritional_info.description}</p>
                                )}
                                {product.nutritional_info.calories && (
                                  <p>
                                    <strong>Calories:</strong>{" "}
                                    {product.nutritional_info.calories}
                                  </p>
                                )}
                                {product.nutritional_info.protein && (
                                  <p>
                                    <strong>Protein:</strong>{" "}
                                    {product.nutritional_info.protein}g
                                  </p>
                                )}
                                {product.nutritional_info.carbs && (
                                  <p>
                                    <strong>Carbs:</strong>{" "}
                                    {product.nutritional_info.carbs}g
                                  </p>
                                )}
                                {product.nutritional_info.fat && (
                                  <p>
                                    <strong>Fat:</strong>{" "}
                                    {product.nutritional_info.fat}g
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {product.allergen_info && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Allergen Information
                          </h4>
                          <div className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            {typeof product.allergen_info === "string" ? (
                              <p>{product.allergen_info}</p>
                            ) : (
                              <div className="space-y-2">
                                {product.allergen_info.description && (
                                  <p>{product.allergen_info.description}</p>
                                )}
                                {product.allergen_info.contains &&
                                  product.allergen_info.contains.length > 0 && (
                                    <p>
                                      <strong>Contains:</strong>{" "}
                                      {product.allergen_info.contains.join(
                                        ", "
                                      )}
                                    </p>
                                  )}
                                {product.allergen_info.may_contain &&
                                  product.allergen_info.may_contain.length >
                                    0 && (
                                    <p>
                                      <strong>May contain:</strong>{" "}
                                      {product.allergen_info.may_contain.join(
                                        ", "
                                      )}
                                    </p>
                                  )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stock Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Package2 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Inventory Status
                      </h2>
                      <p className="text-sm text-gray-600">
                        Current stock information
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {/* Stock Status Badge */}
                    <div
                      className={`p-4 rounded-lg ${stockStatus.bg} border border-opacity-20`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          Stock Status
                        </span>
                        <StockIcon className={`w-5 h-5 ${stockStatus.color}`} />
                      </div>
                      <p className={`text-sm font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </p>
                    </div>

                    {/* Stock Numbers */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Stock</span>
                        <span className="text-xl font-bold text-gray-900">
                          {product.stock_quantity || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Minimum Stock</span>
                        <span className="text-gray-900">
                          {product.minimum_stock || 0}
                        </span>
                      </div>
                    </div>

                    {/* Stock Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Stock Level</span>
                        <span>
                          {Math.round(
                            (product.stock_quantity /
                              Math.max(product.minimum_stock * 2, 1)) *
                              100
                          )}
                          %
                        </span>
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
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Quick Actions
                      </h2>
                      <p className="text-sm text-gray-600">
                        Common product operations
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <EnhancedButton
                      onClick={() => navigate(`/products/${id}/edit`)}
                      variant="outline"
                      className="w-full justify-start"
                      icon={<Edit className="w-4 h-4" />}
                    >
                      Edit Product Details
                    </EnhancedButton>

                    <EnhancedButton
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Product link copied to clipboard");
                      }}
                      variant="outline"
                      className="w-full justify-start"
                      icon={<Copy className="w-4 h-4" />}
                    >
                      Copy Product Link
                    </EnhancedButton>

                    <EnhancedButton
                      onClick={() => {
                        window.open(`/products/create?duplicate=${id}`, "_blank");
                      }}
                      variant="outline"
                      className="w-full justify-start"
                      icon={<Copy className="w-4 h-4" />}
                    >
                      Duplicate Product
                    </EnhancedButton>

                    <EnhancedButton
                      variant="outline"
                      className="w-full justify-start"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Export Data
                    </EnhancedButton>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Performance Metrics */}
            {(analytics || performance) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Performance
                        </h2>
                        <p className="text-sm text-gray-600">
                          Sales and analytics data
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {product.total_sold || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Units Sold
                        </p>
                      </div>

                      {product.total_revenue_eur > 0 && (
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">
                            €{parseFloat(product.total_revenue_eur).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                        </div>
                      )}

                      {analytics && (
                        <div className="pt-4 border-t border-gray-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Avg. Sale Price
                            </span>
                            <span className="text-gray-900">
                              €{analytics.averagePrice?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Sales This Month
                            </span>
                            <span className="text-gray-900">
                              {analytics.monthlyUnits || 0}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, isLoading: false })}
          onConfirm={confirmDelete}
          itemName={product.name}
          itemType="product"
          isLoading={deleteModal.isLoading}
        />
      </div>
    </div>
  );
};

export default ProductDetailsPage;
