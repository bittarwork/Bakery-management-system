import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Store,
  Eye,
  Edit,
  Download,
  RefreshCw,
  Euro,
  ShoppingCart,
  CreditCard,
  FileText,
  Users,
  Truck,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Target,
  Zap,
  Shield,
  Info,
  Settings,
  MoreVertical,
  Calculator,
  Coins,
  DollarSign,
  Globe,
  Loader2,
  Grid,
  List,
  Archive,
  Star,
  Heart,
  Bookmark,
  Tag,
  MapPin,
  Building,
  Receipt,
  Copy,
  ExternalLink,
  Share,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Map,
  Layers,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  Trash2,
  Archive as ArchiveIcon,
  Send,
  Printer,
  FileText as FileTextIcon,
  Download as DownloadIcon,
  Share2,
  Save,
  Upload,
  Import,
  Export,
  Refresh,
  Sync,
  Power,
  Pause,
  Play,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Database,
  Server,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Headphones,
  Speaker,
  Microphone,
  Camera,
  Video,
  Image,
  Music,
  Film,
  Gamepad2,
  Joystick,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Spade,
  Club,
  Heart as HeartCard,
  Diamond,
  Crown,
  Gem,
  Key,
  Lock,
  Unlock,
  Shield as ShieldIcon,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Eye as EyeIcon,
  EyeOff,
  Glasses,
  Sun,
  Moon,
  Star as StarIcon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Sunrise,
  Sunset,
  Thermometer,
  Droplets,
  Wind,
  Tornado,
  Umbrella,
  Snowflake,
  Zap as ZapIcon,
  Flame,
  Waves,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Seedling,
  Sprout,
  Cactus,
  PalmTree,
  Evergreen,
  Deciduous,
  Mushroom,
  Clover,
  Cherry,
  Apple,
  Banana,
  Orange,
  Grape,
  Strawberry,
  Lemon,
  Lime,
  Coconut,
  Carrot,
  Corn,
  Wheat,
  Rice,
  Bread,
  Croissant,
  Pretzel,
  Bagel,
  Donut,
  Cookie,
  Cake,
  Cupcake,
  Pie,
  Pizza,
  Burger,
  Sandwich,
  Taco,
  Salad,
  Soup,
  Stew,
  Meat,
  Poultry,
  Fish,
  Egg,
  Cheese,
  Milk,
  Butter,
  Yogurt,
  IceCream,
  Candy,
  Chocolate,
  Honey,
  Coffee,
  Tea,
  Wine,
  Beer,
  Cocktail,
  Juice,
  Soda,
  Water,
  Droplet,
  Snowflake as SnowflakeIcon,
  Thermometer as ThermometerIcon,
  Gauge,
  Speedometer,
  Compass,
  Navigation,
  Route,
  Directions,
  Map as MapIcon,
  Globe as GlobeIcon,
  Earth,
  Satellite,
  Rocket,
  Plane,
  Car,
  Taxi,
  Bus,
  Train,
  Subway,
  Tram,
  Bike,
  Scooter,
  Motorcycle,
  Truck as TruckIcon,
  Van,
  Ambulance,
  FireTruck,
  PoliceCar,
  Helicopter,
  Boat,
  Ship,
  Anchor,
  Waves as WavesIcon,
  Lighthouse,
  Ferry,
  Sailboat,
  Canoe,
  Kayak,
  Surfboard,
  SwimmingPool,
  Tent,
  Campfire,
  Lantern,
  Flashlight,
  Candle,
  Lightbulb,
  Lamp,
  Torch,
  Sparkles,
  Sparkle,
  Glitter,
  Rainbow,
  Prism,
  Crystal,
  Diamond as DiamondIcon,
  Ring,
  Necklace,
  Watch as WatchIcon,
  Bracelet,
  Earrings,
  Tiara,
  Crown as CrownIcon,
  Medal,
  Trophy,
  Award as AwardIcon,
  Certificate,
  Ribbon,
  Flag,
  Pennant,
  Banner,
  Sign,
  Signpost,
  Milestone,
  Waypoint,
  Checkpoint,
  Target as TargetIcon,
  Bullseye,
  Crosshair,
  Focus,
  Zoom,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  Resize,
  Move,
  Grab,
  Hand,
  Pointer,
  Click,
  Tap,
  Swipe,
  Drag,
  Drop,
  Select,
  Deselect,
  SelectAll,
  DeselectAll,
  Copy as CopyIcon,
  Paste,
  Cut,
  Scissors,
  Paperclip,
  Unlink,
  Chain,
  Anchor as AnchorIcon,
  Pin,
  Pushpin,
  Paperclip as PaperclipIcon,
  Stapler,
  Eraser,
  Highlighter,
  Marker,
  Pencil,
  Pen,
  PenTool,
  Paintbrush,
  Palette,
  Pipette,
  Swatch,
  Layers as LayersIcon,
  Group,
  Ungroup,
  Align,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignTop,
  AlignMiddle,
  AlignBottom,
  Distribute,
  Order,
  BringToFront,
  SendToBack,
  Flip,
  Rotate,
  Transform,
  Crop,
  Trim,
  Adjust,
  Brightness,
  Contrast,
  Saturation,
  Hue,
  Exposure,
  Shadows,
  Highlights,
  Clarity,
  Vibrance,
  Warmth,
  Tint,
  Grain,
  Vignette,
  Blur,
  Sharpen,
  Noise,
  Pixelate,
  Mosaic,
  Posterize,
  Invert,
  Sepia,
  Grayscale,
  Duotone,
  Vintage,
  Retro,
  Film as FilmIcon,
  Polaroid,
  Slide,
  Negative,
  Darkroom,
  Enlarger,
  Tripod,
  Lens,
  Aperture,
  Shutter,
  Flash,
  Timer,
  Remote,
  Selfie,
  Portrait,
  Landscape,
  Panorama,
  Macro,
  Telephoto,
  Wideangle,
  Fisheye,
  Zoom as ZoomIcon,
  Focus as FocusIcon,
  Exposure as ExposureIcon,
  Iso,
  WhiteBalance,
  Metering,
  Histogram,
  Grid as GridIcon,
  Rule,
  Measure,
  Scale,
  Ruler,
  Protractor,
  Triangle,
  Square,
  Circle,
  Pentagon,
  Hexagon,
  Octagon,
  Polygon,
  Star as StarPolygon,
  Heart as HeartShape,
  Diamond as DiamondShape,
  Oval,
  Rectangle,
  RoundedRectangle,
  Trapezoid,
  Parallelogram,
  Rhombus,
  Kite,
  Arrow,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowBigUp,
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUpDash,
  ArrowBigDownDash,
  ArrowBigLeftDash,
  ArrowBigRightDash,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftCircle,
  ArrowRightCircle,
  ArrowUpSquare,
  ArrowDownSquare,
  ArrowLeftSquare,
  ArrowRightSquare,
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpDown as ArrowUpDownIcon,
  ArrowLeftRight,
  ArrowUpDownLeft,
  ArrowUpDownRight,
  ArrowLeftRightUp,
  ArrowLeftRightDown,
  ArrowsExpand,
  ArrowsContract,
  ArrowsShuffle,
  ArrowsSort,
  ArrowsResize,
  ArrowsMerge,
  ArrowsSplit,
  ArrowsJoin,
  ArrowsSeparate,
  ArrowsAlignCenter,
  ArrowsAlignLeft,
  ArrowsAlignRight,
  ArrowsAlignTop,
  ArrowsAlignBottom,
  ArrowsDistribute,
  ArrowsBalance,
  ArrowsEqualize,
  ArrowsSymmetry,
  ArrowsParallel,
  ArrowsPerpendicular,
  ArrowsIntersect,
  ArrowsOverlap,
  ArrowsApart,
  ArrowsTogether,
  ArrowsAway,
  ArrowsToward,
  ArrowsOut,
  ArrowsIn,
  ArrowsUp,
  ArrowsDown,
  ArrowsLeft,
  ArrowsRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import orderService from "../../services/orderService";
import storeService from "../../services/storeService";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

const OrdersListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    isLoading: false,
  });

  // Enhanced filters state
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
    store_id: "",
    distributor_id: "",
    priority: "",
    date_from: "",
    date_to: "",
    delivery_date_from: "",
    delivery_date_to: "",
    amount_min: "",
    amount_max: "",
    currency: "",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "DESC",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    total_orders: 0,
    total_amount_eur: 0,
    total_amount_syp: 0,
    orders_by_status: {},
    orders_by_payment_status: {},
    orders_by_priority: {},
    orders_by_currency: {},
    average_order_value: 0,
    pending_orders: 0,
    completed_orders: 0,
    urgent_orders: 0,
    overdue_orders: 0,
    monthly_growth: 0,
    revenue_growth: 0,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // View mode state
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

  // Fetch orders with current filters
  const fetchOrders = async (resetPage = false) => {
    try {
      setIsLoading(true);

      const queryParams = {
        ...filters,
        page: resetPage ? 1 : filters.page,
      };

      const response = await orderService.getOrders(queryParams);

      if (response.success) {
        console.log("Orders API Response:", response);
        console.log("Raw orders data:", response.data);

        // Filter out any null/undefined orders
        const validOrders = (response.data.orders || []).filter(
          (order) => order && order.id !== undefined && order.id !== null
        );

        console.log("Valid orders after filtering:", validOrders);

        setOrders(validOrders);
        setStatistics(response.data.statistics || {});
        setPagination({
          currentPage: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalItems: response.data.pagination?.total || 0,
          itemsPerPage: response.data.pagination?.limit || 10,
        });

        // Update pagination if needed
        if (resetPage) {
          setFilters((prev) => ({ ...prev, page: 1 }));
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stores for filter dropdown
  const fetchStores = async () => {
    try {
      const response = await storeService.getStores({ limit: 1000 });
      if (response.success) {
        setStores(response.data.stores || []);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  // Fetch distributors for filter dropdown
  const fetchDistributors = async () => {
    try {
      const response = await userService.getUsers({
        role: "distributor",
        limit: 1000,
      });
      if (response.success) {
        setDistributors(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching distributors:", error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchOrders();
    fetchStores();
    fetchDistributors();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    filters.status,
    filters.payment_status,
    filters.store_id,
    filters.distributor_id,
    filters.priority,
    filters.date_from,
    filters.date_to,
    filters.delivery_date_from,
    filters.delivery_date_to,
    filters.amount_min,
    filters.amount_max,
    filters.search,
  ]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filters change
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      payment_status: "",
      store_id: "",
      distributor_id: "",
      priority: "",
      date_from: "",
      date_to: "",
      delivery_date_from: "",
      delivery_date_to: "",
      amount_min: "",
      amount_max: "",
      search: "",
      page: 1,
      limit: 10,
    });
  };

  // Apply quick filters
  const applyQuickFilter = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
      page: 1,
    }));
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      await orderService.updatePaymentStatus(orderId, newPaymentStatus);
      toast.success("Payment status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderService.deleteOrder(orderId);
        toast.success("Order deleted successfully");
        fetchOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
      }
    }
  };

  // Handle bulk operations
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    try {
      await Promise.all(
        selectedOrders.map((orderId) =>
          orderService.updateOrderStatus(orderId, newStatus)
        )
      );
      toast.success(`${selectedOrders.length} orders updated successfully`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error updating orders:", error);
      toast.error("Failed to update selected orders");
    }
  };

  // Handle bulk assignment to distributor
  const handleBulkAssignDistributor = async (distributorId) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    try {
      await Promise.all(
        selectedOrders.map((orderId) =>
          orderService.assignDistributor(orderId, distributorId)
        )
      );
      toast.success(`${selectedOrders.length} orders assigned successfully`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error assigning orders:", error);
      toast.error("Failed to assign selected orders");
    }
  };

  // Handle bulk priority update
  const handleBulkPriorityUpdate = async (priority) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    try {
      await Promise.all(
        selectedOrders.map((orderId) =>
          orderService.updateOrderPriority(orderId, priority)
        )
      );
      toast.success(
        `${selectedOrders.length} orders priority updated successfully`
      );
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority for selected orders");
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await orderService.exportOrders(filters);
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Orders exported successfully");
      }
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    fetchOrders();
  };

  // Status badge component
  const StatusBadge = ({ status, type = "order" }) => {
    const statusConfig =
      type === "order"
        ? orderService.getStatusOptions()
        : orderService.getPaymentStatusOptions();

    const config = statusConfig.find((s) => s.value === status);

    if (!config) return null;

    const colorClasses = {
      gray: "bg-gray-100 text-gray-800",
      blue: "bg-blue-100 text-blue-800",
      yellow: "bg-yellow-100 text-yellow-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colorClasses[config.color]
        }`}
      >
        {config.label}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      low: {
        label: "Low",
        color: "bg-gray-100 text-gray-800",
        icon: AlertTriangle,
      },
      medium: {
        label: "Medium",
        color: "bg-blue-100 text-blue-800",
        icon: AlertTriangle,
      },
      high: {
        label: "High",
        color: "bg-orange-100 text-orange-800",
        icon: AlertTriangle,
      },
      urgent: {
        label: "Urgent",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
      },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.total_orders?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    +{statistics.monthly_growth || 0}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Total Revenue EUR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Euro className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Revenue (EUR)
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      €{formatCurrency(statistics.total_amount_eur || 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    +{statistics.revenue_growth || 0}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Total Revenue SYP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Coins className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Revenue (SYP)
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(statistics.total_amount_syp || 0, "SYP")}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-1">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">
                    Multi-Currency
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Pending Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.pending_orders || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">
                    {statistics.urgent_orders || 0} urgent
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );

  // Enhanced Filters component
  const FiltersPanel = () => (
    <Card className={`mb-6 ${showFilters ? "block" : "hidden"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Advanced Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {orderService.getStatusOptions().map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={filters.payment_status}
              onChange={(e) =>
                handleFilterChange("payment_status", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Payment Statuses</option>
              {orderService.getPaymentStatusOptions().map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Store filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store
            </label>
            <select
              value={filters.store_id}
              onChange={(e) => handleFilterChange("store_id", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Distributor filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distributor
            </label>
            <select
              value={filters.distributor_id}
              onChange={(e) =>
                handleFilterChange("distributor_id", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Distributors</option>
              {distributors.map((distributor) => (
                <option key={distributor.id} value={distributor.id}>
                  {distributor.full_name || distributor.username}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Date From
            </label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Date To
            </label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
            />
          </div>

          {/* Delivery Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Date From
            </label>
            <Input
              type="date"
              value={filters.delivery_date_from}
              onChange={(e) =>
                handleFilterChange("delivery_date_from", e.target.value)
              }
            />
          </div>

          {/* Delivery Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Date To
            </label>
            <Input
              type="date"
              value={filters.delivery_date_to}
              onChange={(e) =>
                handleFilterChange("delivery_date_to", e.target.value)
              }
            />
          </div>

          {/* Amount Min */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount (EUR)
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={filters.amount_min}
              onChange={(e) => handleFilterChange("amount_min", e.target.value)}
            />
          </div>

          {/* Amount Max */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount (EUR)
            </label>
            <Input
              type="number"
              placeholder="1000.00"
              value={filters.amount_max}
              onChange={(e) => handleFilterChange("amount_max", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter("status", "pending")}
            >
              <Clock className="w-4 h-4 mr-1" />
              Pending
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter("status", "confirmed")}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Confirmed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter("priority", "urgent")}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Urgent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter("payment_status", "pending")}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Payment Pending
            </Button>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Table columns
  const columns = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={selectedOrders.length === orders.length && orders.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              const validOrderIds = orders
                .filter((order) => order && order.id)
                .map((order) => order.id);
              setSelectedOrders(validOrderIds);
            } else {
              setSelectedOrders([]);
            }
          }}
        />
      ),
      render: (order) => (
        <input
          type="checkbox"
          checked={
            order && order.id ? selectedOrders.includes(order.id) : false
          }
          onChange={(e) => {
            if (order && order.id) {
              if (e.target.checked) {
                setSelectedOrders((prev) => [...prev, order.id]);
              } else {
                setSelectedOrders((prev) =>
                  prev.filter((id) => id !== order.id)
                );
              }
            }
          }}
        />
      ),
    },
    {
      key: "order_number",
      header: "Order #",
      sortable: true,
      render: (order) => (
        <div className="font-medium text-blue-600">
          {order && order.id ? (
            <Link to={`/orders/${order.id}`} className="hover:underline">
              {order.order_number || "N/A"}
            </Link>
          ) : (
            <span>N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "store_name",
      header: "Store",
      sortable: true,
      render: (order) => (
        <div className="flex items-center space-x-2">
          <Store className="w-4 h-4 text-gray-400" />
          <span>{order && order.store_name ? order.store_name : "N/A"}</span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (order) => (
        <PriorityBadge
          priority={order && order.priority ? order.priority : "medium"}
        />
      ),
    },
    {
      key: "order_date",
      header: "Date",
      sortable: true,
      render: (order) => (
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span>
            {order && order.order_date
              ? new Date(order.order_date).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "delivery_date",
      header: "Delivery",
      sortable: true,
      render: (order) => (
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-gray-400" />
          <span>
            {order && order.delivery_date
              ? new Date(order.delivery_date).toLocaleDateString()
              : "Not scheduled"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <StatusBadge
          status={order && order.status ? order.status : "unknown"}
          type="order"
        />
      ),
    },
    {
      key: "payment_status",
      header: "Payment",
      render: (order) => (
        <StatusBadge
          status={
            order && order.payment_status ? order.payment_status : "unknown"
          }
          type="payment"
        />
      ),
    },
    {
      key: "final_amount_eur",
      header: "Amount (EUR)",
      render: (order) => (
        <div className="font-medium text-green-600">
          {order && order.final_amount_eur !== undefined
            ? formatCurrency(order.final_amount_eur, "EUR")
            : "N/A"}
        </div>
      ),
    },
    {
      key: "distributor",
      header: "Distributor",
      render: (order) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span>
            {order && order.distributor_name
              ? order.distributor_name
              : "Unassigned"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (order) => (
        <div className="flex items-center space-x-2">
          {order && order.id ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = `/orders/${order.id}`)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled>
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {order && order.id ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                (window.location.href = `/orders/${order.id}/edit`)
              }
            >
              <Edit className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {order && order.id ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteOrder(order.id)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Orders Management
          </h1>
          <p className="text-gray-600 flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Manage and track all bakery orders</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
            className="bg-white hover:bg-gray-50"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={handleExport}
            icon={<Download className="w-4 h-4" />}
            loading={isExporting}
            className="bg-white hover:bg-gray-50"
          >
            Export
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            icon={<RefreshCw className="w-4 h-4" />}
            className="bg-white hover:bg-gray-50"
          >
            Refresh
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "table" ? "cards" : "table")
            }
            icon={
              viewMode === "table" ? (
                <Grid className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )
            }
            className="bg-white hover:bg-gray-50"
          >
            {viewMode === "table" ? "Card View" : "Table View"}
          </EnhancedButton>
          <Link to="/orders/create">
            <EnhancedButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              New Order
            </EnhancedButton>
          </Link>
        </div>
      </motion.div>

      {/* Statistics */}
      <StatisticsCards />

      {/* Enhanced Search and Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <EnhancedInput
                  placeholder="Search orders by number, store, or customer..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                  className="w-full"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 min-w-32"
                >
                  <option value="">All Statuses</option>
                  {orderService.getStatusOptions().map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.store_id}
                  onChange={(e) =>
                    handleFilterChange("store_id", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 min-w-32"
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 min-w-32"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={filters.currency}
                  onChange={(e) =>
                    handleFilterChange("currency", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 min-w-32"
                >
                  <option value="">All Currencies</option>
                  <option value="EUR">EUR</option>
                  <option value="SYP">SYP</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Enhanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FilterIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Advanced Filters
                    </h3>
                  </div>
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    icon={<X className="w-4 h-4" />}
                  />
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Status filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Statuses</option>
                      {orderService.getStatusOptions().map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Status filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={filters.payment_status}
                      onChange={(e) =>
                        handleFilterChange("payment_status", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Payment Statuses</option>
                      {orderService.getPaymentStatusOptions().map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        handleFilterChange("priority", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Store filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store
                    </label>
                    <select
                      value={filters.store_id}
                      onChange={(e) =>
                        handleFilterChange("store_id", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Stores</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Distributor filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distributor
                    </label>
                    <select
                      value={filters.distributor_id}
                      onChange={(e) =>
                        handleFilterChange("distributor_id", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Distributors</option>
                      {distributors.map((distributor) => (
                        <option key={distributor.id} value={distributor.id}>
                          {distributor.full_name || distributor.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Currency filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={filters.currency}
                      onChange={(e) =>
                        handleFilterChange("currency", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Currencies</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="SYP">SYP - Syrian Pound</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Date From
                    </label>
                    <EnhancedInput
                      type="date"
                      value={filters.date_from}
                      onChange={(e) =>
                        handleFilterChange("date_from", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Date To
                    </label>
                    <EnhancedInput
                      type="date"
                      value={filters.date_to}
                      onChange={(e) =>
                        handleFilterChange("date_to", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Amount Min */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Amount (EUR)
                    </label>
                    <EnhancedInput
                      type="number"
                      placeholder="0.00"
                      value={filters.amount_min}
                      onChange={(e) =>
                        handleFilterChange("amount_min", e.target.value)
                      }
                      icon={<Euro className="w-4 h-4" />}
                      className="w-full"
                    />
                  </div>

                  {/* Amount Max */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Amount (EUR)
                    </label>
                    <EnhancedInput
                      type="number"
                      placeholder="1000.00"
                      value={filters.amount_max}
                      onChange={(e) =>
                        handleFilterChange("amount_max", e.target.value)
                      }
                      icon={<Euro className="w-4 h-4" />}
                      className="w-full"
                    />
                  </div>

                  {/* Delivery Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date From
                    </label>
                    <EnhancedInput
                      type="date"
                      value={filters.delivery_date_from}
                      onChange={(e) =>
                        handleFilterChange("delivery_date_from", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Delivery Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date To
                    </label>
                    <EnhancedInput
                      type="date"
                      value={filters.delivery_date_to}
                      onChange={(e) =>
                        handleFilterChange("delivery_date_to", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickFilter("status", "pending")}
                      icon={<Clock className="w-4 h-4" />}
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300"
                    >
                      Pending Orders
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickFilter("status", "confirmed")}
                      icon={<CheckCircle className="w-4 h-4" />}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                    >
                      Confirmed Orders
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickFilter("priority", "urgent")}
                      icon={<AlertTriangle className="w-4 h-4" />}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                    >
                      Urgent Orders
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        applyQuickFilter("payment_status", "pending")
                      }
                      icon={<CreditCard className="w-4 h-4" />}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                    >
                      Payment Due
                    </EnhancedButton>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                    <EnhancedButton
                      variant="outline"
                      onClick={clearFilters}
                      icon={<X className="w-4 h-4" />}
                    >
                      Clear Filters
                    </EnhancedButton>
                    <EnhancedButton
                      variant="primary"
                      onClick={() => setShowFilters(false)}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Apply Filters
                    </EnhancedButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedOrders.length} orders selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("confirmed")}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("in_progress")}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  In Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("delivered")}
                >
                  <Package className="w-4 h-4 mr-1" />
                  Delivered
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("cancelled")}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <select
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkPriorityUpdate(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Set Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAssignDistributor(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Assign Distributor</option>
                  {distributors.map((distributor) => (
                    <option key={distributor.id} value={distributor.id}>
                      {distributor.full_name || distributor.username}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={orders}
            isLoading={isLoading}
            emptyMessage="No orders found"
            onSort={(key, direction) => {
              handleFilterChange("sortBy", key);
              handleFilterChange("sortOrder", direction);
            }}
          />
        </CardBody>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Showing {(filters.page - 1) * filters.limit + 1} to{" "}
            {Math.min(filters.page * filters.limit, orders.length)} of{" "}
            {orders.length} orders
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {filters.page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={orders.length < filters.limit}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersListPage;
