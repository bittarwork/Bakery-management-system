import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Tag,
  TrendingDown,
  Calculator,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Save,
  Trash2,
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Star,
  Award,
  Gift,
  Crown,
  Trophy,
  Medal,
  Users,
  User,
  Calendar,
  Clock,
  DollarSign,
  Euro,
  Package,
  Box,
  ShoppingCart,
  Store,
  Building,
  Globe,
  Activity,
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Share,
  Copy,
  ExternalLink,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Flag,
  Bookmark,
  Lock,
  Unlock,
  Key,
  Shield,
  Verified,
  BadgeCheck,
  CreditCard,
  Receipt,
  Wallet,
  Coins,
  Banknote,
  PiggyBank,
  Vault,
  Safe,
  Landmark,
  BarChart,
  BarChart2,
  BarChart4,
  ChartArea,
  ChartBar,
  ChartLine,
  ChartPie,
  ChartSpline,
  Analytics,
  Pulse,
  Gauge,
  Speedometer,
  Thermometer,
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
  Play,
  Pause,
  Stop,
  Record,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Loop,
  Playlist,
  Queue,
  Library,
  Folder,
  File,
  Document,
  Text,
  Book,
  Page,
  Newspaper,
  Magazine,
  Journal,
  Diary,
  Notebook,
  Notes,
  Sticky,
  Memo,
  List,
  Todo,
  Task,
  Checklist,
  Checkbox,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Diamond,
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
  Magic,
  Crystal,
  Gem,
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
import { toast } from "react-hot-toast";

const DiscountManager = ({
  orderItems = [],
  orderTotal = 0,
  onDiscountUpdate,
  currency = "EUR",
  storeId = null,
  className = "",
}) => {
  const [discounts, setDiscounts] = useState([]);
  const [discountRules, setDiscountRules] = useState([]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [customDiscount, setCustomDiscount] = useState({
    name: "",
    type: "percentage", // percentage, fixed, bulk
    value: 0,
    target: "order", // order, item, category
    targetId: null,
    minQuantity: 1,
    minAmount: 0,
    maxDiscount: null,
    reason: "",
    code: "",
    validUntil: null,
    stackable: false,
  });
  const [autoDiscountsEnabled, setAutoDiscountsEnabled] = useState(true);
  const [showDiscountCalculator, setShowDiscountCalculator] = useState(false);

  // Discount types
  const discountTypes = {
    percentage: {
      name: "Percentage",
      icon: Percent,
      color: "blue",
      symbol: "%",
    },
    fixed: {
      name: "Fixed Amount",
      icon: DollarSign,
      color: "green",
      symbol: currency === "EUR" ? "€" : "ل.س",
    },
    bulk: {
      name: "Bulk Discount",
      icon: Package,
      color: "purple",
      symbol: "%",
    },
    loyalty: {
      name: "Loyalty Discount",
      icon: Star,
      color: "yellow",
      symbol: "%",
    },
    seasonal: {
      name: "Seasonal",
      icon: Calendar,
      color: "orange",
      symbol: "%",
    },
    clearance: { name: "Clearance", icon: Tag, color: "red", symbol: "%" },
  };

  // Predefined discount rules
  const defaultDiscountRules = [
    {
      id: 1,
      name: "Bulk Order Discount",
      type: "bulk",
      condition: { type: "quantity", operator: ">=", value: 100 },
      discount: { type: "percentage", value: 10, maxDiscount: 100 },
      target: "order",
      description: "10% discount for orders of 100+ items",
      active: true,
      priority: 1,
    },
    {
      id: 2,
      name: "Large Amount Discount",
      type: "percentage",
      condition: { type: "amount", operator: ">=", value: 1000 },
      discount: { type: "percentage", value: 5, maxDiscount: 200 },
      target: "order",
      description: "5% discount for orders over €1000",
      active: true,
      priority: 2,
    },
    {
      id: 3,
      name: "Loyalty Customer Discount",
      type: "loyalty",
      condition: { type: "customer_type", value: "loyalty" },
      discount: { type: "percentage", value: 7, maxDiscount: 150 },
      target: "order",
      description: "7% discount for loyalty customers",
      active: true,
      priority: 3,
    },
    {
      id: 4,
      name: "Weekend Special",
      type: "seasonal",
      condition: { type: "day_of_week", value: ["saturday", "sunday"] },
      discount: { type: "percentage", value: 3, maxDiscount: 50 },
      target: "order",
      description: "3% weekend discount",
      active: false,
      priority: 4,
    },
    {
      id: 5,
      name: "Early Bird Discount",
      type: "seasonal",
      condition: { type: "time", operator: "<", value: "10:00" },
      discount: { type: "fixed", value: 25 },
      target: "order",
      description: "€25 off for orders before 10 AM",
      active: false,
      priority: 5,
    },
  ];

  // Initialize discount rules
  useEffect(() => {
    setDiscountRules(defaultDiscountRules);
  }, []);

  // Calculate automatic discounts when order changes
  useEffect(() => {
    if (autoDiscountsEnabled) {
      calculateAutoDiscounts();
    }
  }, [orderItems, orderTotal, autoDiscountsEnabled, discountRules]);

  // Calculate automatic discounts
  const calculateAutoDiscounts = () => {
    const calculatedDiscounts = [];

    // Sort rules by priority
    const activeRules = discountRules
      .filter((rule) => rule.active)
      .sort((a, b) => a.priority - b.priority);

    activeRules.forEach((rule) => {
      if (evaluateRuleCondition(rule.condition)) {
        const discountAmount = calculateDiscountAmount(
          rule.discount,
          rule.target
        );
        if (discountAmount > 0) {
          calculatedDiscounts.push({
            id: Date.now() + Math.random(),
            name: rule.name,
            type: rule.type,
            amount: discountAmount,
            target: rule.target,
            targetId: rule.targetId,
            reason: rule.description,
            appliedRule: rule.id,
            automatic: true,
            stackable: rule.stackable || false,
          });
        }
      }
    });

    // Handle non-stackable discounts (keep only the best one)
    const processedDiscounts = processStackableDiscounts(calculatedDiscounts);

    // Update discounts (keep manual discounts)
    setDiscounts((prevDiscounts) => {
      const manualDiscounts = prevDiscounts.filter(
        (discount) => !discount.automatic
      );
      return [...manualDiscounts, ...processedDiscounts];
    });
  };

  // Process stackable discounts
  const processStackableDiscounts = (discounts) => {
    const stackableDiscounts = discounts.filter((d) => d.stackable);
    const nonStackableDiscounts = discounts.filter((d) => !d.stackable);

    // For non-stackable discounts, keep only the best one
    const bestNonStackable = nonStackableDiscounts.reduce(
      (best, current) =>
        !best || current.amount > best.amount ? current : best,
      null
    );

    return [
      ...stackableDiscounts,
      ...(bestNonStackable ? [bestNonStackable] : []),
    ];
  };

  // Evaluate rule condition
  const evaluateRuleCondition = (condition) => {
    switch (condition.type) {
      case "quantity":
        const totalQuantity = orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        return evaluateNumericCondition(
          totalQuantity,
          condition.operator,
          condition.value
        );
      case "amount":
        return evaluateNumericCondition(
          orderTotal,
          condition.operator,
          condition.value
        );
      case "customer_type":
        return condition.value === "loyalty"; // Mock for now
      case "day_of_week":
        const today = new Date()
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        return condition.value.includes(today);
      case "time":
        const now = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });
        return evaluateTimeCondition(now, condition.operator, condition.value);
      default:
        return false;
    }
  };

  // Evaluate numeric condition
  const evaluateNumericCondition = (value, operator, threshold) => {
    switch (operator) {
      case ">":
        return value > threshold;
      case ">=":
        return value >= threshold;
      case "<":
        return value < threshold;
      case "<=":
        return value <= threshold;
      case "=":
        return value === threshold;
      default:
        return false;
    }
  };

  // Evaluate time condition
  const evaluateTimeCondition = (time, operator, threshold) => {
    return operator === "<" ? time < threshold : time > threshold;
  };

  // Calculate discount amount
  const calculateDiscountAmount = (discount, target) => {
    let baseAmount = 0;

    if (target === "order") {
      baseAmount = orderTotal;
    } else if (target === "item") {
      // For item-specific discounts, sum the specific items
      baseAmount = orderItems.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
    }

    let discountAmount = 0;

    if (discount.type === "percentage") {
      discountAmount = baseAmount * (discount.value / 100);
    } else if (discount.type === "fixed") {
      discountAmount = discount.value;
    }

    // Apply maximum discount limit
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }

    return Math.min(discountAmount, baseAmount); // Can't discount more than the base amount
  };

  // Add manual discount
  const addManualDiscount = () => {
    if (
      !customDiscount.name ||
      !customDiscount.value ||
      customDiscount.value <= 0
    ) {
      toast.error("Please enter a valid discount name and value");
      return;
    }

    const discountAmount = calculateManualDiscountAmount();

    if (discountAmount <= 0) {
      toast.error("Invalid discount amount");
      return;
    }

    const newDiscount = {
      id: Date.now(),
      name: customDiscount.name,
      type: customDiscount.type,
      amount: discountAmount,
      target: customDiscount.target,
      targetId: customDiscount.targetId,
      reason: customDiscount.reason || "Manual discount",
      code: customDiscount.code,
      validUntil: customDiscount.validUntil,
      stackable: customDiscount.stackable,
      automatic: false,
    };

    setDiscounts((prev) => [...prev, newDiscount]);
    setShowAddDiscountModal(false);
    resetCustomDiscount();

    toast.success("Discount added successfully");
  };

  // Calculate manual discount amount
  const calculateManualDiscountAmount = () => {
    let baseAmount = orderTotal;

    if (customDiscount.target === "item" && customDiscount.targetId) {
      const item = orderItems.find(
        (item) => item.id === customDiscount.targetId
      );
      if (item) {
        baseAmount = item.quantity * item.unit_price;
      }
    }

    if (customDiscount.type === "percentage") {
      return Math.min(
        baseAmount * (customDiscount.value / 100),
        customDiscount.maxDiscount || baseAmount
      );
    } else if (customDiscount.type === "fixed") {
      return Math.min(customDiscount.value, baseAmount);
    }

    return 0;
  };

  // Reset custom discount form
  const resetCustomDiscount = () => {
    setCustomDiscount({
      name: "",
      type: "percentage",
      value: 0,
      target: "order",
      targetId: null,
      minQuantity: 1,
      minAmount: 0,
      maxDiscount: null,
      reason: "",
      code: "",
      validUntil: null,
      stackable: false,
    });
  };

  // Remove discount
  const removeDiscount = (discountId) => {
    setDiscounts((prev) =>
      prev.filter((discount) => discount.id !== discountId)
    );
    toast.success("Discount removed");
  };

  // Update discount
  const updateDiscount = (discountId, updates) => {
    setDiscounts((prev) =>
      prev.map((discount) =>
        discount.id === discountId ? { ...discount, ...updates } : discount
      )
    );
  };

  // Get total discount amount
  const getTotalDiscountAmount = () => {
    return discounts.reduce((total, discount) => total + discount.amount, 0);
  };

  // Get discount statistics
  const getDiscountStats = () => {
    const totalDiscount = getTotalDiscountAmount();
    const autoDiscounts = discounts
      .filter((d) => d.automatic)
      .reduce((sum, d) => sum + d.amount, 0);
    const manualDiscounts = discounts
      .filter((d) => !d.automatic)
      .reduce((sum, d) => sum + d.amount, 0);
    const discountPercentage =
      orderTotal > 0 ? (totalDiscount / orderTotal) * 100 : 0;

    return {
      totalDiscount,
      autoDiscounts,
      manualDiscounts,
      discountPercentage,
    };
  };

  // Get discount type color
  const getDiscountTypeColor = (type) => {
    const config = discountTypes[type];
    const colors = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      yellow: "bg-yellow-100 text-yellow-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
    };
    return colors[config?.color] || "bg-gray-100 text-gray-800";
  };

  // Format discount display
  const formatDiscountDisplay = (discount) => {
    const config = discountTypes[discount.type];
    if (discount.type === "percentage") {
      return `${((discount.amount / orderTotal) * 100).toFixed(1)}%`;
    } else {
      return `${config?.symbol || ""}${discount.amount.toFixed(2)}`;
    }
  };

  // Discount calculator component
  const DiscountCalculator = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showDiscountCalculator ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Discount Calculator</h2>
            <Button
              variant="ghost"
              onClick={() => setShowDiscountCalculator(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                value={customDiscount.type}
                onChange={(e) =>
                  setCustomDiscount((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <Input
                type="number"
                value={customDiscount.value}
                onChange={(e) =>
                  setCustomDiscount((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter value"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Total
            </label>
            <div className="p-2 bg-gray-50 rounded-lg">
              {currency === "EUR" ? "€" : "ل.س"}
              {orderTotal.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculated Discount
            </label>
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                -{currency === "EUR" ? "€" : "ل.س"}
                {calculateManualDiscountAmount().toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Final Amount
            </label>
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {currency === "EUR" ? "€" : "ل.س"}
                {(orderTotal - calculateManualDiscountAmount()).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add discount modal
  const AddDiscountModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showAddDiscountModal ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Add Manual Discount</h2>
            <Button
              variant="ghost"
              onClick={() => setShowAddDiscountModal(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Name
            </label>
            <Input
              value={customDiscount.name}
              onChange={(e) =>
                setCustomDiscount((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter discount name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={customDiscount.type}
                onChange={(e) =>
                  setCustomDiscount((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <Input
                type="number"
                value={customDiscount.value}
                onChange={(e) =>
                  setCustomDiscount((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter value"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target
            </label>
            <select
              value={customDiscount.target}
              onChange={(e) =>
                setCustomDiscount((prev) => ({
                  ...prev,
                  target: e.target.value,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="order">Entire Order</option>
              <option value="item">Specific Item</option>
            </select>
          </div>

          {customDiscount.target === "item" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Item
              </label>
              <select
                value={customDiscount.targetId || ""}
                onChange={(e) =>
                  setCustomDiscount((prev) => ({
                    ...prev,
                    targetId: parseInt(e.target.value),
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Choose an item</option>
                {orderItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product_name} (Qty: {item.quantity})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <Input
              value={customDiscount.reason}
              onChange={(e) =>
                setCustomDiscount((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder="Enter reason for discount"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Stackable
              </label>
              <p className="text-xs text-gray-500">
                Can be combined with other discounts
              </p>
            </div>
            <button
              onClick={() =>
                setCustomDiscount((prev) => ({
                  ...prev,
                  stackable: !prev.stackable,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                customDiscount.stackable ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  customDiscount.stackable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Discount Preview:</strong> -
              {currency === "EUR" ? "€" : "ل.س"}
              {calculateManualDiscountAmount().toFixed(2)}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowAddDiscountModal(false)}
          >
            Cancel
          </Button>
          <Button onClick={addManualDiscount}>
            <Tag className="w-4 h-4 mr-2" />
            Add Discount
          </Button>
        </div>
      </div>
    </div>
  );

  const stats = getDiscountStats();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Tag className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Discount Management</h3>
            <p className="text-sm text-gray-500">
              Manage automatic and manual discounts
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto Discounts</span>
            <button
              onClick={() => setAutoDiscountsEnabled(!autoDiscountsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoDiscountsEnabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoDiscountsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiscountCalculator(true)}
          >
            <Calculator className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRulesModal(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => setShowAddDiscountModal(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Total Discount</p>
              <p className="text-xl font-bold text-red-800">
                {currency === "EUR" ? "€" : "ل.س"}
                {stats.totalDiscount.toFixed(2)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Auto Discounts</p>
              <p className="text-xl font-bold text-blue-800">
                {currency === "EUR" ? "€" : "ل.س"}
                {stats.autoDiscounts.toFixed(2)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Manual Discounts</p>
              <p className="text-xl font-bold text-purple-800">
                {currency === "EUR" ? "€" : "ل.س"}
                {stats.manualDiscounts.toFixed(2)}
              </p>
            </div>
            <Edit className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Discount %</p>
              <p className="text-xl font-bold text-green-800">
                {stats.discountPercentage.toFixed(1)}%
              </p>
            </div>
            <Percent className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Discounts List */}
      <div className="space-y-3">
        {discounts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No discounts applied yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setShowAddDiscountModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Discount
            </Button>
          </div>
        ) : (
          discounts.map((discount) => {
            const DiscountIcon = discountTypes[discount.type]?.icon || Tag;
            return (
              <motion.div
                key={discount.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 border border-gray-200 rounded-lg bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${getDiscountTypeColor(
                        discount.type
                      )}`}
                    >
                      <DiscountIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          {discount.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getDiscountTypeColor(
                            discount.type
                          )}`}
                        >
                          {discountTypes[discount.type]?.name || "Custom"}
                        </span>
                        {discount.automatic && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            Auto
                          </span>
                        )}
                        {discount.stackable && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Stackable
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {discount.reason}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>
                          Amount: {currency === "EUR" ? "€" : "ل.س"}
                          {discount.amount.toFixed(2)}
                        </span>
                        <span>Display: {formatDiscountDisplay(discount)}</span>
                        <span>Target: {discount.target}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        -{currency === "EUR" ? "€" : "ل.س"}
                        {discount.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDiscountDisplay(discount)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDiscount(discount.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {discounts.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Discount Summary</h4>
              <p className="text-sm text-gray-600">
                {discounts.length} discount{discounts.length !== 1 ? "s" : ""}{" "}
                applied
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                -{currency === "EUR" ? "€" : "ل.س"}
                {stats.totalDiscount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {stats.discountPercentage.toFixed(1)}% of order total
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddDiscountModal />
      <DiscountCalculator />
    </div>
  );
};

export default DiscountManager;
