import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Activity,
  Clock,
  Building,
  Archive,
  Copy,
  Upload,
  Info,
  Settings,
  Box,
  Layers,
  Target,
  Award,
  Zap,
  Shield,
  BookOpen,
  Map,
  Home,
  Globe,
  Warehouse,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  History,
  Bookmark,
  Share,
  Flag,
  Bell,
  Filter,
  Search,
  ExternalLink,
  Maximize,
  Minimize,
  Database,
  Server,
  Code,
  Cpu,
  HardDrive,
  Smartphone,
  Tablet,
  Monitor,
  Headphones,
  Camera,
  Gamepad2,
  Keyboard,
  Mouse,
  Printer,
  Wifi,
  Bluetooth,
  Usb,
  Battery,
  Power,
  Signal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Music,
  Video,
  Film,
  ImageIcon,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  MessageCircle,
  MessageSquare,
  Send,
  Inbox,
  MailOpen,
  MailCheck,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Group,
  Crown,
  Briefcase,
  GraduationCap,
  School,
  Library,
  Bookmark as BookmarkIcon,
  BookOpen as BookOpenIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileCode,
  FolderOpen,
  FolderClosed,
  Save,
  SaveAll,
  Folder,
  FolderPlus,
  FolderMinus,
  FolderX,
  FolderCheck,
  FolderEdit,
  FolderSearch,
  FolderUp,
  FolderDown,
  FolderTree,
  FolderRoot,
  FolderHeart,
  FolderClock,
  FolderKey,
  FolderGit,
  FolderSync,
  FolderArchive,
  FolderInput,
  FolderOutput,
  FolderSymlink,
  FolderKanban,
  FolderOpenDot,
  FolderDot,
  FolderCog,
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
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [variants, setVariants] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isToggleFeatured, setIsToggleFeatured] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  // Load product data
  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load product details
      const productResponse = await productService.getProduct(id);
      if (productResponse.success) {
        setProduct(productResponse.data);
      } else {
        throw new Error(productResponse.message || "فشل في تحميل المنتج");
      }

      // Advanced APIs disabled until backend implementation
      console.log(
        "Advanced product APIs disabled until backend implementation"
      );

      // Set empty data for advanced features
      setAnalytics({
        views: 0,
        sales: 0,
        revenue: 0,
        rating: 0,
        reviews: 0,
      });

      setPerformance({
        salesTrend: [],
        profitMargin: 0,
        stockTurnover: 0,
        customerSatisfaction: 0,
      });

      setSalesHistory([]);
      setInventory({ current: 0, reserved: 0, available: 0 });
      setRecommendations([]);
      setPriceHistory([]);
      setVariants([]);
    } catch (error) {
      console.error("Error loading product:", error);
      setError(error.message);
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
      console.warn("Could not load analytics:", error);
    }
  };

  const loadPerformance = async () => {
    try {
      const response = await productService.getProductPerformance(id);
      if (response.success) {
        setPerformance(response.data);
      }
    } catch (error) {
      console.warn("Could not load performance:", error);
    }
  };

  const loadSalesHistory = async () => {
    try {
      const response = await productService.getProductSalesHistory(id, {
        limit: 10,
      });
      if (response.success) {
        setSalesHistory(response.data);
      }
    } catch (error) {
      console.warn("Could not load sales history:", error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await productService.getProductInventory(id);
      if (response.success) {
        setInventory(response.data);
      }
    } catch (error) {
      console.warn("Could not load inventory:", error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await productService.getProductRecommendations(id, {
        limit: 5,
      });
      if (response.success) {
        setRecommendations(response.data);
      }
    } catch (error) {
      console.warn("Could not load recommendations:", error);
    }
  };

  const loadPriceHistory = async () => {
    try {
      const response = await productService.getProductPriceHistory(id, {
        limit: 10,
      });
      if (response.success) {
        setPriceHistory(response.data);
      }
    } catch (error) {
      console.warn("Could not load price history:", error);
    }
  };

  const loadVariants = async () => {
    try {
      const response = await productService.getProductVariants(id);
      if (response.success) {
        setVariants(response.data);
      }
    } catch (error) {
      console.warn("Could not load variants:", error);
    }
  };

  // Handle product deletion
  const handleDelete = () => {
    setDeleteModal({
      isOpen: true,
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));

      const response = await productService.deleteProduct(id);
      if (response.success) {
        setSuccess("تم حذف المنتج بنجاح");
        setTimeout(() => {
          navigate("/products");
        }, 1500);
      } else {
        setError(response.message || "فشل في حذف المنتج");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("فشل في حذف المنتج");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      setIsUpdatingStatus(true);
      const response = await productService.toggleProductStatus(id);
      if (response.success) {
        setProduct(response.data);
        setSuccess("تم تحديث حالة المنتج بنجاح");
      } else {
        setError(response.message || "فشل في تحديث حالة المنتج");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      setError("فشل في تحديث حالة المنتج");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle featured toggle
  const handleToggleFeatured = async () => {
    try {
      setIsToggleFeatured(true);
      const response = await productService.toggleProductFeatured(id);
      if (response.success) {
        setProduct(response.data);
        setSuccess("تم تحديث حالة المنتج المميز بنجاح");
      } else {
        setError(response.message || "فشل في تحديث حالة المنتج المميز");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      setError("فشل في تحديث حالة المنتج المميز");
    } finally {
      setIsToggleFeatured(false);
    }
  };

  // Handle duplicate product
  const handleDuplicate = async () => {
    try {
      const response = await productService.duplicateProduct(id);
      if (response.success) {
        setSuccess("تم نسخ المنتج بنجاح");
        navigate(`/products/${response.data.id}`);
      } else {
        setError(response.message || "فشل في نسخ المنتج");
      }
    } catch (error) {
      console.error("Error duplicating product:", error);
      setError("فشل في نسخ المنتج");
    }
  };

  // Handle archive product
  const handleArchive = async () => {
    try {
      const response = await productService.archiveProduct(id);
      if (response.success) {
        setSuccess("تم أرشفة المنتج بنجاح");
        loadProductData();
      } else {
        setError(response.message || "فشل في أرشفة المنتج");
      }
    } catch (error) {
      console.error("Error archiving product:", error);
      setError("فشل في أرشفة المنتج");
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  // Format currency
  const formatCurrency = (amount, currency = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-gray-600 mt-4">جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            خطأ في تحميل المنتج
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <EnhancedButton
              onClick={loadProductData}
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              إعادة المحاولة
            </EnhancedButton>
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            المنتج غير موجود
          </h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على المنتج المطلوب</p>
          <BackButton />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <BackButton variant="outline" size="lg" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      product.status
                    )}`}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    {product.status === "active"
                      ? "نشط"
                      : product.status === "inactive"
                      ? "غير نشط"
                      : "مأرشف"}
                  </span>
                  {product.is_featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Star className="w-4 h-4 mr-1" />
                      منتج مميز
                    </span>
                  )}
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 text-sm">
                    تم الإنشاء: {formatDate(product.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EnhancedButton
                onClick={handleToggleFeatured}
                variant={product.is_featured ? "warning" : "primary"}
                size="lg"
                disabled={isToggleFeatured}
                icon={
                  isToggleFeatured ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : product.is_featured ? (
                    <StarOff className="w-5 h-5" />
                  ) : (
                    <Star className="w-5 h-5" />
                  )
                }
              >
                {product.is_featured ? "إلغاء التمييز" : "جعل مميز"}
              </EnhancedButton>
              <EnhancedButton
                onClick={() => navigate(`/products/${id}/edit`)}
                variant="primary"
                size="lg"
                icon={<Edit className="w-5 h-5" />}
              >
                تعديل المنتج
              </EnhancedButton>
              <EnhancedButton
                onClick={handleDelete}
                variant="danger"
                size="lg"
                icon={<Trash2 className="w-5 h-5" />}
              >
                حذف المنتج
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Info & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Image and Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Image */}
                    <div className="space-y-4">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
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
                      <div className="flex justify-center gap-2">
                        <EnhancedButton
                          onClick={() => navigate(`/products/${id}/edit`)}
                          variant="outline"
                          size="sm"
                          icon={<Upload className="w-4 h-4" />}
                        >
                          تغيير الصورة
                        </EnhancedButton>
                        <EnhancedButton
                          onClick={handleDuplicate}
                          variant="outline"
                          size="sm"
                          icon={<Copy className="w-4 h-4" />}
                        >
                          نسخ المنتج
                        </EnhancedButton>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          المعلومات الأساسية
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">
                              الفئة
                            </span>
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-900 capitalize">
                                {product.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">
                              الوحدة
                            </span>
                            <div className="flex items-center gap-2">
                              <Package2 className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-900">
                                {product.unit}
                              </span>
                            </div>
                          </div>
                          {product.barcode && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">
                                الباركود
                              </span>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-900 font-mono">
                                  {product.barcode}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">
                              تاريخ الإنشاء
                            </span>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-900">
                                {formatDate(product.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          السعر والتكلفة
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">
                              السعر (يورو)
                            </span>
                            <div className="flex items-center gap-2">
                              <Euro className="w-4 h-4 text-green-600" />
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(product.price_eur, "EUR")}
                              </span>
                            </div>
                          </div>
                          {product.price_syp > 0 && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">
                                السعر (ليرة سورية)
                              </span>
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-blue-600" />
                                <span className="text-lg font-bold text-blue-600">
                                  {product.price_syp.toLocaleString()} ل.س
                                </span>
                              </div>
                            </div>
                          )}
                          {product.cost_eur > 0 && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">
                                التكلفة (يورو)
                              </span>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-900">
                                  {formatCurrency(product.cost_eur, "EUR")}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Description */}
            {product.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 ml-2 text-blue-600" />
                      وصف المنتج
                    </h2>
                  </CardHeader>
                  <CardBody className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Additional Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Info className="w-5 h-5 ml-2 text-purple-600" />
                    تفاصيل إضافية
                  </h2>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.weight_grams && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Scale className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            الوزن
                          </p>
                          <p className="text-sm text-gray-900">
                            {product.weight_grams} جرام
                          </p>
                        </div>
                      </div>
                    )}
                    {product.shelf_life_days && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            فترة الصلاحية
                          </p>
                          <p className="text-sm text-gray-900">
                            {product.shelf_life_days} يوم
                          </p>
                        </div>
                      </div>
                    )}
                    {product.storage_conditions && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Thermometer className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            شروط التخزين
                          </p>
                          <p className="text-sm text-gray-900">
                            {product.storage_conditions}
                          </p>
                        </div>
                      </div>
                    )}
                    {product.supplier_info && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Building className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            معلومات المورد
                          </p>
                          <p className="text-sm text-gray-900">
                            {product.supplier_info}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Sales History */}
            {salesHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <History className="w-5 h-5 ml-2 text-green-600" />
                      تاريخ المبيعات
                    </h2>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="space-y-4">
                      {salesHistory.map((sale, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <ShoppingCart className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {sale.quantity} وحدة
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(sale.date)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              {formatCurrency(sale.total_amount, "EUR")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {sale.store_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Stats, Stock & Actions */}
          <div className="space-y-8">
            {/* Stock Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Warehouse className="w-5 h-5 ml-2 text-purple-600" />
                    حالة المخزون
                  </h2>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="text-center space-y-4">
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}
                    >
                      <StockIcon className="w-4 h-4 mr-2" />
                      {stockStatus.text}
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {product.stock_quantity}
                    </div>
                    <p className="text-sm text-gray-600">الكمية المتوفرة</p>
                    {product.minimum_stock > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          الحد الأدنى:{" "}
                          <span className="font-semibold">
                            {product.minimum_stock}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 ml-2 text-blue-600" />
                    إجراءات سريعة
                  </h2>
                </CardHeader>
                <CardBody className="p-6 space-y-3">
                  <EnhancedButton
                    onClick={() => navigate(`/products/${id}/edit`)}
                    variant="primary"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    fullWidth
                  >
                    تعديل المنتج
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={handleToggleStatus}
                    variant={product.status === "active" ? "danger" : "success"}
                    size="sm"
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
                    fullWidth
                  >
                    {product.status === "active" ? "إلغاء التفعيل" : "تفعيل"}
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={handleDuplicate}
                    variant="secondary"
                    size="sm"
                    icon={<Copy className="w-4 h-4" />}
                    fullWidth
                  >
                    نسخ المنتج
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={handleArchive}
                    variant="warning"
                    size="sm"
                    icon={<Archive className="w-4 h-4" />}
                    fullWidth
                  >
                    أرشفة المنتج
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={() => navigate("/products")}
                    variant="outline"
                    size="sm"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    fullWidth
                  >
                    العودة للقائمة
                  </EnhancedButton>
                </CardBody>
              </Card>
            </motion.div>

            {/* Analytics */}
            {analytics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <BarChart3 className="w-5 h-5 ml-2 text-green-600" />
                      التحليلات
                    </h2>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">
                          {analytics.totalSales || 0}
                        </p>
                        <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Euro className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(analytics.totalRevenue || 0, "EUR")}
                        </p>
                        <p className="text-sm text-gray-600">
                          إجمالي الإيرادات
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">
                          {analytics.uniqueCustomers || 0}
                        </p>
                        <p className="text-sm text-gray-600">عملاء فريدون</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Related Products */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Target className="w-5 h-5 ml-2 text-orange-600" />
                      منتجات مشابهة
                    </h2>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => navigate(`/products/${rec.id}`)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {rec.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {rec.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatCurrency(rec.price_eur, "EUR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, isLoading: false })}
        onConfirm={confirmDelete}
        itemName={product?.name}
        itemType="المنتج"
        isLoading={deleteModal.isLoading}
      />

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

export default ProductDetailsPage;
