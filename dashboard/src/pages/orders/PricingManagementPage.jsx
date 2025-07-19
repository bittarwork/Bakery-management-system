import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calculator,
  TrendingUp,
  TrendingDown,
  Euro,
  Coins,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Zap,
  Shield,
  Info,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Share,
  Bell,
  Mail,
  Calendar,
  Globe,
  Archive,
  Star,
  Heart,
  Bookmark,
  Tag,
  MapPin,
  Building,
  Receipt,
  FileText,
  Printer,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Layers,
  Grid,
  List,
  Maximize,
  Minimize,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import taxService from "../../services/taxService";
import priceHistoryService from "../../services/priceHistoryService";
import productService from "../../services/productService";
import { toast } from "react-hot-toast";

const PricingManagementPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "tax", "pricing", "history"
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // "tax", "price", "history"

  // Tax management state
  const [taxConfig, setTaxConfig] = useState({
    defaultTaxRate: 0.0,
    taxRates: {
      EUR: 0.0,
      SYP: 0.0,
    },
    taxExemptions: [],
    taxRegions: [],
  });

  // Price history state
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceAnalytics, setPriceAnalytics] = useState({
    averagePrice: 0,
    priceChanges: 0,
    volatility: 0,
    trend: "stable",
  });

  // Filters state
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    currency: "",
    category: "",
    priceChange: "",
    search: "",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    priceChangesThisMonth: 0,
    averagePriceIncrease: 0,
    taxCollected: 0,
    topPriceChanges: [],
    currencyDistribution: {
      EUR: 0,
      SYP: 0,
    },
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Format currency helper
  const formatCurrency = (amount, currency = "EUR") => {
    if (currency === "SYP") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "SYP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadProducts(),
        loadTaxConfig(),
        loadPriceAnalytics(),
        loadStatistics(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load pricing data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 });
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadTaxConfig = async () => {
    try {
      const response = await taxService.getTaxConfig();
      if (response.success) {
        setTaxConfig(response.data || {});
      }
    } catch (error) {
      console.error("Error loading tax config:", error);
    }
  };

  const loadPriceAnalytics = async () => {
    try {
      const response = await priceHistoryService.getPriceAnalytics(filters);
      if (response.success) {
        setPriceAnalytics(response.data || {});
      }
    } catch (error) {
      console.error("Error loading price analytics:", error);
    }
  };

  const loadStatistics = async () => {
    try {
      // Mock statistics for demo
      setStatistics({
        totalProducts: products.length,
        priceChangesThisMonth: 23,
        averagePriceIncrease: 2.5,
        taxCollected: 1250.75,
        topPriceChanges: [
          { product: "Bread", change: 5.2, type: "increase" },
          { product: "Croissant", change: -2.1, type: "decrease" },
          { product: "Cake", change: 8.7, type: "increase" },
        ],
        currencyDistribution: {
          EUR: 65,
          SYP: 35,
        },
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadPriceHistory = async (productId) => {
    try {
      const response = await priceHistoryService.getProductPriceHistory(
        productId,
        filters
      );
      if (response.success) {
        setPriceHistory(response.data || []);
      }
    } catch (error) {
      console.error("Error loading price history:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle tax calculation
  const handleTaxCalculation = async (orderData) => {
    try {
      const response = await taxService.calculateTax(orderData);
      if (response.success) {
        toast.success("Tax calculated successfully");
        return response.data;
      }
    } catch (error) {
      console.error("Error calculating tax:", error);
      toast.error("Failed to calculate tax");
    }
  };

  // Handle price update
  const handlePriceUpdate = async (productId, newPriceData) => {
    try {
      const response = await priceHistoryService.recordPriceChange(
        productId,
        newPriceData
      );
      if (response.success) {
        toast.success("Price updated successfully");
        await loadProducts();
        await loadPriceAnalytics();
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Failed to update price");
    }
  };

  // Handle bulk price update
  const handleBulkPriceUpdate = async (priceUpdates) => {
    try {
      const response = await priceHistoryService.bulkUpdatePrices(priceUpdates);
      if (response.success) {
        toast.success("Bulk price update completed");
        await loadProducts();
        await loadPriceAnalytics();
      }
    } catch (error) {
      console.error("Error bulk updating prices:", error);
      toast.error("Failed to update prices");
    }
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
    >
      {/* Total Products */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.totalProducts}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Price Changes */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-500 rounded-xl shadow-md">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Price Changes
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.priceChangesThisMonth}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">This month</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Average Price Increase */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg. Price Increase
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      +{statistics.averagePriceIncrease}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Tax Collected */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-500 rounded-xl shadow-md">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tax Collected
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(statistics.taxCollected)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Tab Navigation Component
  const TabNavigation = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {[
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "tax", label: "Tax Management", icon: Calculator },
        { id: "pricing", label: "Pricing", icon: Euro },
        { id: "history", label: "Price History", icon: LineChart },
      ].map((tab) => {
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  // Tax Management Component
  const TaxManagement = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tax Configuration</h3>
            <EnhancedButton
              variant="primary"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => {
                setModalType("tax");
                setShowModal(true);
              }}
            >
              Configure Tax
            </EnhancedButton>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Current Tax Rates</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span>EUR Tax Rate:</span>
                  <span className="font-medium">
                    {taxConfig.taxRates?.EUR || 0}%
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>SYP Tax Rate:</span>
                  <span className="font-medium">
                    {taxConfig.taxRates?.SYP || 0}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Tax Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span>Total Tax Collected:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(statistics.taxCollected)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Tax Exemptions:</span>
                  <span className="font-medium">
                    {taxConfig.taxExemptions?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Price History Component
  const PriceHistoryComponent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Price History & Analytics</h3>
            <div className="flex space-x-2">
              <EnhancedButton
                variant="outline"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={() => {
                  // Handle export
                }}
              >
                Export
              </EnhancedButton>
              <EnhancedButton
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setModalType("price");
                  setShowModal(true);
                }}
              >
                Update Price
              </EnhancedButton>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h4 className="font-medium mb-3">Recent Price Changes</h4>
              <div className="space-y-2">
                {statistics.topPriceChanges.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          change.type === "increase"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {change.type === "increase" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <span className="font-medium">{change.product}</span>
                    </div>
                    <span
                      className={`font-medium ${
                        change.type === "increase"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {change.type === "increase" ? "+" : ""}
                      {change.change}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Price Analytics</h4>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Price</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(priceAnalytics.averagePrice)}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Changes</span>
                    <span className="font-bold text-green-600">
                      {priceAnalytics.priceChanges}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Volatility</span>
                    <span className="font-bold text-purple-600">
                      {priceAnalytics.volatility}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-100"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pricing Management
          </h1>
          <p className="text-gray-600 flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>Manage taxes, pricing, and price history</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            icon={<RefreshCw className="w-4 h-4" />}
            className="bg-white hover:bg-gray-50"
          >
            Refresh
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            className="bg-white hover:bg-gray-50"
          >
            Export Report
          </EnhancedButton>
          <EnhancedButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            Bulk Update
          </EnhancedButton>
        </div>
      </motion.div>

      {/* Statistics */}
      <StatisticsCards />

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && <StatisticsCards />}
        {activeTab === "tax" && <TaxManagement />}
        {activeTab === "pricing" && <div>Pricing management content</div>}
        {activeTab === "history" && <PriceHistoryComponent />}
      </motion.div>
    </div>
  );
};

export default PricingManagementPage;
