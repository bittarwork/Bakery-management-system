import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  MoreHorizontal,
  Trash2,
  Edit,
  Download,
  Upload,
  Send,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Package,
  DollarSign,
  Euro,
  CreditCard,
  Receipt,
  FileText,
  Star,
  Heart,
  Award,
  Gift,
  Tag,
  Target,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Shield,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Building,
  Store,
  Globe,
  Flag,
  Bookmark,
  Calendar,
  History,
  Info,
  AlertCircle,
  Check,
  X,
  Plus,
  Minus,
  Copy,
  ExternalLink,
  Share,
  Print,
  Save,
  Undo,
  Redo,
  RotateCcw,
  RotateCw,
  Move,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Repeat,
  Repeat1,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Play,
  Pause,
  Stop,
  Record,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Radio,
  Podcast,
  Music,
  Musical,
  Note,
  Video,
  Camera,
  Photo,
  Image,
  Picture,
  Frame,
  Gallery,
  Album,
  Film,
  Movie,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  Database,
  Cloud,
  CloudSnow,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Sun,
  Moon,
  Stars,
  Sunrise,
  Sunset,
  Wind,
  Snowflake,
  Droplets,
  Umbrella,
  Rainbow,
  Bolt,
  Flash,
  Flame,
  Fire,
  Sparkles,
  Sparkle,
  Wand,
  Crystal,
  Gem,
  Diamond,
  Crown,
  Trophy,
  Medal,
  Ribbon,
  Present,
  Cake,
  Party,
  Confetti,
  Balloon,
  Fireworks,
  Celebration,
  Festival,
  Carnival,
  Circus,
  Theater,
  Flower,
  Rose,
  Tulip,
  Daisy,
  Sunflower,
  Lily,
  Orchid,
  Cherry,
  Blossom,
  Sakura,
  Maple,
  Oak,
  Pine,
  Palm,
  Bamboo,
  Cactus,
  Succulent,
  Fern,
  Moss,
  Grass,
  Wheat,
  Rice,
  Corn,
  Potato,
  Tomato,
  Carrot,
  Onion,
  Garlic,
  Pepper,
  Chili,
  Mushroom,
  Eggplant,
  Avocado,
  Broccoli,
  Cabbage,
  Lettuce,
  Spinach,
  Kale,
  Celery,
  Cucumber,
  Zucchini,
  Squash,
  Pumpkin,
  Gourd,
  Melon,
  Watermelon,
  Cantaloupe,
  Honeydew,
  Mango,
  Papaya,
  Pineapple,
  Coconut,
  Banana,
  Apple,
  Orange,
  Lemon,
  Lime,
  Grapefruit,
  Peach,
  Pear,
  Plum,
  Grape,
  Berry,
  Strawberry,
  Blueberry,
  Raspberry,
  Blackberry,
  Cranberry,
  Currant,
  Gooseberry,
  Elderberry,
  Mulberry,
  Fig,
  Date,
  Prune,
  Raisin,
  Nut,
  Almond,
  Walnut,
  Pecan,
  Hazelnut,
  Cashew,
  Pistachio,
  Peanut,
  Chestnut,
  Acorn,
  Seed,
  Kernel,
  Pit,
  Stone,
  Shell,
  Husk,
  Pod,
  Bean,
  Pea,
  Lentil,
  Chickpea,
  Soybean,
  Tofu,
  Tempeh,
  Seitan,
  Quinoa,
  Amaranth,
  Buckwheat,
  Millet,
  Barley,
  Oats,
  Rye,
  Spelt,
  Kamut,
  Farro,
  Bulgur,
  Couscous,
  Pasta,
  Noodle,
  Spaghetti,
  Macaroni,
  Lasagna,
  Ravioli,
  Tortellini,
  Gnocchi,
  Dumpling,
  Wonton,
  Gyoza,
  Sushi,
  Sashimi,
  Tempura,
  Teriyaki,
  Yakitori,
  Ramen,
  Udon,
  Soba,
  Miso,
  Dashi,
  Shoyu,
  Mirin,
  Sake,
  Wasabi,
  Ginger,
  Soy,
  Sesame,
  Nori,
  Wakame,
  Kombu,
  Shiitake,
  Enoki,
  Maitake,
  Oyster,
  Portobello,
  Cremini,
  Button,
  Porcini,
  Chanterelle,
  Morel,
  Truffle,
  Matsutake,
  Reishi,
  Cordyceps,
  Chaga,
  Lions,
  Mane,
  Turkey,
  Tail,
  King,
  Queen,
  Prince,
  Princess,
  Duke,
  Duchess,
  Earl,
  Countess,
  Baron,
  Baroness,
  Knight,
  Lady,
  Lord,
  Master,
  Mistress,
  Sir,
  Madam,
  Miss,
  Mrs,
  Mr,
  Dr,
  Prof,
  Rev,
  Fr,
  Sr,
  Jr,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Epsilon,
  Zeta,
  Eta,
  Theta,
  Iota,
  Kappa,
  Lambda,
  Mu,
  Nu,
  Xi,
  Omicron,
  Pi,
  Rho,
  Sigma,
  Tau,
  Upsilon,
  Phi,
  Chi,
  Psi,
  Omega,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const BulkOperations = ({
  selectedOrders = [],
  onSelectionChange,
  onOperationComplete,
  availableOrders = [],
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [operationProgress, setOperationProgress] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    current: "",
    errors: [],
  });

  // Available bulk operations
  const bulkOperations = [
    {
      id: "update_status",
      name: "Update Status",
      icon: Edit,
      color: "blue",
      description: "Update order status for selected orders",
      requiresInput: true,
      inputType: "select",
      inputOptions: orderService.getStatusOptions(),
      confirmMessage:
        "Are you sure you want to update the status of {count} orders?",
    },
    {
      id: "update_payment_status",
      name: "Update Payment Status",
      icon: CreditCard,
      color: "green",
      description: "Update payment status for selected orders",
      requiresInput: true,
      inputType: "select",
      inputOptions: orderService.getPaymentStatusOptions(),
      confirmMessage:
        "Are you sure you want to update the payment status of {count} orders?",
    },
    {
      id: "mark_delivered",
      name: "Mark as Delivered",
      icon: CheckCircle,
      color: "green",
      description: "Mark selected orders as delivered",
      requiresInput: false,
      confirmMessage:
        "Are you sure you want to mark {count} orders as delivered?",
    },
    {
      id: "mark_cancelled",
      name: "Cancel Orders",
      icon: XCircle,
      color: "red",
      description: "Cancel selected orders",
      requiresInput: false,
      confirmMessage:
        "Are you sure you want to cancel {count} orders? This action cannot be undone.",
    },
    {
      id: "export_orders",
      name: "Export Orders",
      icon: Download,
      color: "purple",
      description: "Export selected orders to CSV",
      requiresInput: false,
      confirmMessage: "Export {count} orders to CSV file?",
    },
    {
      id: "send_notifications",
      name: "Send Notifications",
      icon: Bell,
      color: "yellow",
      description: "Send notifications for selected orders",
      requiresInput: true,
      inputType: "select",
      inputOptions: [
        { value: "order_confirmation", label: "Order Confirmation" },
        { value: "ready_for_pickup", label: "Ready for Pickup" },
        { value: "delivered", label: "Delivered" },
        { value: "payment_reminder", label: "Payment Reminder" },
      ],
      confirmMessage: "Send notifications for {count} orders?",
    },
    {
      id: "archive_orders",
      name: "Archive Orders",
      icon: Archive,
      color: "gray",
      description: "Archive selected orders",
      requiresInput: false,
      confirmMessage: "Are you sure you want to archive {count} orders?",
    },
    {
      id: "delete_orders",
      name: "Delete Orders",
      icon: Trash2,
      color: "red",
      description: "Permanently delete selected orders",
      requiresInput: false,
      dangerous: true,
      confirmMessage:
        "Are you sure you want to permanently delete {count} orders? This action cannot be undone.",
    },
  ];

  const [selectedOperation, setSelectedOperation] = useState(null);
  const [operationInput, setOperationInput] = useState("");

  // Handle bulk operation
  const handleBulkOperation = async (operation) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    setSelectedOperation(operation);
    setCurrentOperation(operation);

    if (operation.requiresInput) {
      setOperationInput("");
    }

    setShowConfirmModal(true);
  };

  // Confirm and execute operation
  const confirmOperation = async () => {
    if (!currentOperation) return;

    if (currentOperation.requiresInput && !operationInput) {
      toast.error("Please provide required input");
      return;
    }

    setShowConfirmModal(false);
    setShowProgressModal(true);
    setIsLoading(true);

    // Initialize progress
    setOperationProgress({
      total: selectedOrders.length,
      completed: 0,
      failed: 0,
      current: "",
      errors: [],
    });

    try {
      await executeBulkOperation(currentOperation, operationInput);

      // Complete
      setOperationProgress((prev) => ({
        ...prev,
        current: "Operation completed successfully",
      }));

      toast.success(`${currentOperation.name} completed successfully`);

      // Clear selection and notify parent
      onSelectionChange([]);
      if (onOperationComplete) {
        onOperationComplete(currentOperation.id);
      }
    } catch (error) {
      console.error("Bulk operation failed:", error);
      toast.error("Bulk operation failed");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setShowProgressModal(false);
        setCurrentOperation(null);
        setSelectedOperation(null);
        setOperationInput("");
      }, 2000);
    }
  };

  // Execute bulk operation
  const executeBulkOperation = async (operation, input) => {
    const errors = [];

    for (let i = 0; i < selectedOrders.length; i++) {
      const orderId = selectedOrders[i];

      // Update progress
      setOperationProgress((prev) => ({
        ...prev,
        current: `Processing order ${i + 1} of ${selectedOrders.length}...`,
      }));

      try {
        await executeOrderOperation(orderId, operation.id, input);

        // Update progress
        setOperationProgress((prev) => ({
          ...prev,
          completed: prev.completed + 1,
        }));
      } catch (error) {
        console.error(`Failed to process order ${orderId}:`, error);
        errors.push({ orderId, error: error.message });

        // Update progress
        setOperationProgress((prev) => ({
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, { orderId, error: error.message }],
        }));
      }

      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (errors.length > 0) {
      throw new Error(`${errors.length} operations failed`);
    }
  };

  // Execute single order operation
  const executeOrderOperation = async (orderId, operationType, input) => {
    switch (operationType) {
      case "update_status":
        return await orderService.updateOrderStatus(orderId, input);
      case "update_payment_status":
        return await orderService.updatePaymentStatus(orderId, input);
      case "mark_delivered":
        return await orderService.updateOrderStatus(orderId, "delivered");
      case "mark_cancelled":
        return await orderService.updateOrderStatus(orderId, "cancelled");
      case "export_orders":
        // This would be handled differently - export data rather than update individual orders
        return Promise.resolve();
      case "send_notifications":
        // This would call a notification service
        return Promise.resolve();
      case "archive_orders":
        // This would call an archive service
        return Promise.resolve();
      case "delete_orders":
        return await orderService.deleteOrder(orderId);
      default:
        throw new Error(`Unknown operation: ${operationType}`);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrders.length === availableOrders.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(availableOrders.map((order) => order.id));
    }
  };

  // Handle individual selection
  const handleIndividualSelection = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      onSelectionChange(selectedOrders.filter((id) => id !== orderId));
    } else {
      onSelectionChange([...selectedOrders, orderId]);
    }
  };

  // Get operation color class
  const getOperationColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      green: "bg-green-100 text-green-800 hover:bg-green-200",
      red: "bg-red-100 text-red-800 hover:bg-red-200",
      yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };
    return colors[color] || colors.gray;
  };

  // Get selected orders info
  const getSelectedOrdersInfo = () => {
    const selectedOrdersData = availableOrders.filter((order) =>
      selectedOrders.includes(order.id)
    );
    const totalAmount = selectedOrdersData.reduce(
      (sum, order) => sum + (order.final_amount_eur || 0),
      0
    );
    const statusCounts = selectedOrdersData.reduce((counts, order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
      return counts;
    }, {});

    return { totalAmount, statusCounts };
  };

  // Confirmation modal
  const ConfirmationModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showConfirmModal ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${getOperationColor(
                currentOperation?.color
              )}`}
            >
              {currentOperation?.icon && (
                <currentOperation.icon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentOperation?.name}</h2>
              <p className="text-sm text-gray-600">
                {currentOperation?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              {currentOperation?.confirmMessage.replace(
                "{count}",
                selectedOrders.length
              )}
            </p>
          </div>

          {currentOperation?.requiresInput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentOperation.inputType === "select"
                  ? "Select Option"
                  : "Input Value"}
              </label>
              {currentOperation.inputType === "select" ? (
                <select
                  value={operationInput}
                  onChange={(e) => setOperationInput(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose an option</option>
                  {currentOperation.inputOptions?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={operationInput}
                  onChange={(e) => setOperationInput(e.target.value)}
                  placeholder="Enter value"
                />
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Selected Orders Summary
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Total Orders: {selectedOrders.length}</p>
              <p>
                Total Amount: €{getSelectedOrdersInfo().totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {currentOperation?.dangerous && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  This action is permanent and cannot be undone
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowConfirmModal(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmOperation}
            disabled={
              isLoading || (currentOperation?.requiresInput && !operationInput)
            }
            className={
              currentOperation?.dangerous ? "bg-red-600 hover:bg-red-700" : ""
            }
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // Progress modal
  const ProgressModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showProgressModal ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${getOperationColor(
                currentOperation?.color
              )}`}
            >
              {currentOperation?.icon && (
                <currentOperation.icon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Processing Orders</h2>
              <p className="text-sm text-gray-600">{currentOperation?.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm text-gray-500">
                {operationProgress.completed + operationProgress.failed} /{" "}
                {operationProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((operationProgress.completed + operationProgress.failed) /
                      operationProgress.total) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-medium text-green-600">
                {operationProgress.completed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="text-sm font-medium text-red-600">
                {operationProgress.failed}
              </span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{operationProgress.current}</p>
          </div>

          {operationProgress.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-red-800 mb-2">Errors</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {operationProgress.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    Order {error.orderId}: {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowProgressModal(false)}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Close"}
          </Button>
        </div>
      </div>
    </div>
  );

  if (selectedOrders.length === 0) {
    return (
      <div
        className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}
      >
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <CheckSquare className="w-5 h-5" />
          <span className="text-sm">
            Select orders to enable bulk operations
          </span>
        </div>
      </div>
    );
  }

  const selectedInfo = getSelectedOrdersInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Info */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {selectedOrders.length === availableOrders.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>Select All</span>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {selectedOrders.length} of {availableOrders.length} orders
                selected
              </div>
              <div className="text-sm font-medium text-blue-600">
                Total: €{selectedInfo.totalAmount.toFixed(2)}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              Clear Selection
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Bulk Operations</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bulkOperations.map((operation) => {
              const Icon = operation.icon;
              return (
                <button
                  key={operation.id}
                  onClick={() => handleBulkOperation(operation)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 border-transparent text-left transition-all ${getOperationColor(
                    operation.color
                  )} ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{operation.name}</h4>
                      <p className="text-xs opacity-80">
                        {operation.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <ConfirmationModal />
      <ProgressModal />
    </div>
  );
};

export default BulkOperations;
