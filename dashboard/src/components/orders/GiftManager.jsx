import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Save,
  Trash2,
  Star,
  Heart,
  Award,
  Crown,
  Trophy,
  Medal,
  Ribbon,
  Present,
  Sparkles,
  Zap,
  Target,
  Info,
  AlertCircle,
  CheckCircle,
  Settings,
  Calculator,
  Percent,
  Package,
  Box,
  ShoppingCart,
  Tag,
  Users,
  User,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
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
  Building,
  Store,
  Globe,
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
  DollarSign,
  Euro,
  Banknote,
  PiggyBank,
  Vault,
  Safe,
  Landmark,
  LineChart,
  PieChart,
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

const GiftManager = ({
  orderItems = [],
  onGiftUpdate,
  currency = "EUR",
  storeId = null,
  orderTotal = 0,
  className = "",
}) => {
  const [gifts, setGifts] = useState([]);
  const [giftRules, setGiftRules] = useState([]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customGift, setCustomGift] = useState({
    itemId: null,
    quantity: 1,
    reason: "",
    type: "loyalty", // loyalty, promotion, special, custom
    appliedRule: null,
  });
  const [autoGiftsEnabled, setAutoGiftsEnabled] = useState(true);

  // Gift rule types
  const giftRuleTypes = {
    quantity: { name: "Quantity Based", icon: Package, color: "blue" },
    amount: { name: "Amount Based", icon: DollarSign, color: "green" },
    loyalty: { name: "Loyalty Customer", icon: Heart, color: "red" },
    promotion: { name: "Promotional", icon: Star, color: "yellow" },
    special: { name: "Special Occasion", icon: Gift, color: "purple" },
    new_customer: { name: "New Customer", icon: User, color: "cyan" },
    bulk_order: { name: "Bulk Order", icon: Box, color: "orange" },
  };

  // Predefined gift rules
  const defaultGiftRules = [
    {
      id: 1,
      name: "Loyalty Customer Gift",
      type: "loyalty",
      condition: { type: "customer_type", value: "loyalty" },
      action: { type: "percentage", value: 5 },
      description: "Give 5% of order quantity as gifts to loyalty customers",
      active: true,
      priority: 1,
    },
    {
      id: 2,
      name: "Large Order Bonus",
      type: "amount",
      condition: { type: "order_total", operator: ">", value: 1000 },
      action: { type: "fixed", value: 10 },
      description: "Give 10 pieces as gifts for orders over €1000",
      active: true,
      priority: 2,
    },
    {
      id: 3,
      name: "Bulk Purchase Reward",
      type: "quantity",
      condition: { type: "item_quantity", operator: ">", value: 50 },
      action: { type: "percentage", value: 10 },
      description: "Give 10% extra for purchases over 50 pieces",
      active: true,
      priority: 3,
    },
    {
      id: 4,
      name: "New Customer Welcome",
      type: "new_customer",
      condition: { type: "customer_type", value: "new" },
      action: { type: "fixed", value: 5 },
      description: "Welcome gift of 5 pieces for new customers",
      active: true,
      priority: 4,
    },
    {
      id: 5,
      name: "Weekend Special",
      type: "special",
      condition: { type: "day_of_week", value: ["saturday", "sunday"] },
      action: { type: "percentage", value: 3 },
      description: "Weekend special: 3% extra gifts",
      active: false,
      priority: 5,
    },
  ];

  // Initialize gift rules
  useEffect(() => {
    setGiftRules(defaultGiftRules);
  }, []);

  // Calculate automatic gifts when order items change
  useEffect(() => {
    if (autoGiftsEnabled) {
      calculateAutoGifts();
    }
  }, [orderItems, autoGiftsEnabled, giftRules]);

  // Calculate automatic gifts based on rules
  const calculateAutoGifts = () => {
    const calculatedGifts = [];

    // Sort rules by priority
    const activeRules = giftRules
      .filter((rule) => rule.active)
      .sort((a, b) => a.priority - b.priority);

    activeRules.forEach((rule) => {
      if (evaluateRuleCondition(rule.condition)) {
        const giftQuantity = calculateGiftQuantity(rule.action);
        if (giftQuantity > 0) {
          // Apply gift to highest quantity item or distribute across items
          const applicableItems = getApplicableItems(rule);

          applicableItems.forEach((item) => {
            const itemGiftQuantity = distributeGiftQuantity(
              giftQuantity,
              item,
              rule
            );
            if (itemGiftQuantity > 0) {
              calculatedGifts.push({
                id: Date.now() + Math.random(),
                itemId: item.id,
                productName: item.product_name,
                quantity: itemGiftQuantity,
                reason: rule.description,
                type: rule.type,
                appliedRule: rule.id,
                automatic: true,
              });
            }
          });
        }
      }
    });

    // Update gifts (keep manual gifts)
    setGifts((prevGifts) => {
      const manualGifts = prevGifts.filter((gift) => !gift.automatic);
      return [...manualGifts, ...calculatedGifts];
    });
  };

  // Evaluate rule condition
  const evaluateRuleCondition = (condition) => {
    switch (condition.type) {
      case "order_total":
        return evaluateNumericCondition(
          orderTotal,
          condition.operator,
          condition.value
        );
      case "item_quantity":
        return orderItems.some((item) =>
          evaluateNumericCondition(
            item.quantity,
            condition.operator,
            condition.value
          )
        );
      case "customer_type":
        // This would typically come from store/customer data
        return condition.value === "loyalty"; // Mock for now
      case "day_of_week":
        const today = new Date()
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        return condition.value.includes(today);
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

  // Calculate gift quantity based on action
  const calculateGiftQuantity = (action) => {
    switch (action.type) {
      case "fixed":
        return action.value;
      case "percentage":
        const totalQuantity = orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        return Math.floor(totalQuantity * (action.value / 100));
      default:
        return 0;
    }
  };

  // Get applicable items for a rule
  const getApplicableItems = (rule) => {
    // For now, return all items. In a real app, this could be filtered by category, etc.
    return orderItems;
  };

  // Distribute gift quantity across items
  const distributeGiftQuantity = (totalGiftQuantity, item, rule) => {
    if (rule.action.type === "percentage") {
      return Math.floor(item.quantity * (rule.action.value / 100));
    } else {
      // For fixed quantities, give to highest quantity item
      const highestQuantityItem = orderItems.reduce((max, current) =>
        current.quantity > max.quantity ? current : max
      );
      return item.id === highestQuantityItem.id ? totalGiftQuantity : 0;
    }
  };

  // Add manual gift
  const addManualGift = () => {
    if (!selectedItem || !customGift.quantity || customGift.quantity <= 0) {
      toast.error("Please select an item and enter a valid quantity");
      return;
    }

    const newGift = {
      id: Date.now(),
      itemId: selectedItem.id,
      productName: selectedItem.product_name,
      quantity: customGift.quantity,
      reason: customGift.reason || "Manual gift",
      type: customGift.type,
      appliedRule: null,
      automatic: false,
    };

    setGifts((prev) => [...prev, newGift]);
    setShowAddGiftModal(false);
    setCustomGift({
      itemId: null,
      quantity: 1,
      reason: "",
      type: "loyalty",
      appliedRule: null,
    });
    setSelectedItem(null);

    toast.success("Gift added successfully");
  };

  // Remove gift
  const removeGift = (giftId) => {
    setGifts((prev) => prev.filter((gift) => gift.id !== giftId));
    toast.success("Gift removed");
  };

  // Update gift
  const updateGift = (giftId, updates) => {
    setGifts((prev) =>
      prev.map((gift) => (gift.id === giftId ? { ...gift, ...updates } : gift))
    );
  };

  // Get total gift value
  const getTotalGiftValue = () => {
    return gifts.reduce((total, gift) => {
      const item = orderItems.find((item) => item.id === gift.itemId);
      if (item) {
        const unitPrice =
          currency === "EUR" ? item.unit_price_eur : item.unit_price_syp;
        return total + gift.quantity * unitPrice;
      }
      return total;
    }, 0);
  };

  // Get gift statistics
  const getGiftStats = () => {
    const totalGifts = gifts.reduce((sum, gift) => sum + gift.quantity, 0);
    const autoGifts = gifts
      .filter((gift) => gift.automatic)
      .reduce((sum, gift) => sum + gift.quantity, 0);
    const manualGifts = gifts
      .filter((gift) => !gift.automatic)
      .reduce((sum, gift) => sum + gift.quantity, 0);

    return { totalGifts, autoGifts, manualGifts };
  };

  // Get rule color class
  const getRuleColor = (type) => {
    const config = giftRuleTypes[type];
    const colors = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      yellow: "bg-yellow-100 text-yellow-800",
      purple: "bg-purple-100 text-purple-800",
      cyan: "bg-cyan-100 text-cyan-800",
      orange: "bg-orange-100 text-orange-800",
    };
    return colors[config?.color] || "bg-gray-100 text-gray-800";
  };

  // Gift rule modal
  const GiftRulesModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showRulesModal ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Gift Rules Management</h2>
            <Button variant="ghost" onClick={() => setShowRulesModal(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {giftRules.map((rule) => {
              const RuleIcon = giftRuleTypes[rule.type]?.icon || Gift;
              return (
                <div
                  key={rule.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-lg ${getRuleColor(rule.type)}`}
                      >
                        <RuleIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{rule.name}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getRuleColor(
                              rule.type
                            )}`}
                          >
                            {giftRuleTypes[rule.type]?.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {rule.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Priority: {rule.priority}</span>
                          <span>
                            Action: {rule.action.type} ({rule.action.value})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const updatedRules = giftRules.map((r) =>
                            r.id === rule.id ? { ...r, active: !r.active } : r
                          );
                          setGiftRules(updatedRules);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          rule.active ? "bg-green-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            rule.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Add gift modal
  const AddGiftModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showAddGiftModal ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Add Manual Gift</h2>
            <Button variant="ghost" onClick={() => setShowAddGiftModal(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              value={selectedItem?.id || ""}
              onChange={(e) => {
                const item = orderItems.find(
                  (item) => item.id === parseInt(e.target.value)
                );
                setSelectedItem(item);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a product</option>
              {orderItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.product_name} (Ordered: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gift Quantity
            </label>
            <Input
              type="number"
              value={customGift.quantity}
              onChange={(e) =>
                setCustomGift((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 0,
                }))
              }
              min="1"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gift Type
            </label>
            <select
              value={customGift.type}
              onChange={(e) =>
                setCustomGift((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="loyalty">Loyalty Customer</option>
              <option value="promotion">Promotional</option>
              <option value="special">Special Occasion</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <Input
              value={customGift.reason}
              onChange={(e) =>
                setCustomGift((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Enter reason for gift"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setShowAddGiftModal(false)}>
            Cancel
          </Button>
          <Button onClick={addManualGift}>
            <Gift className="w-4 h-4 mr-2" />
            Add Gift
          </Button>
        </div>
      </div>
    </div>
  );

  const stats = getGiftStats();
  const totalGiftValue = getTotalGiftValue();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Gift className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Gift Management</h3>
            <p className="text-sm text-gray-500">
              Manage automatic and manual gifts
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto Gifts</span>
            <button
              onClick={() => setAutoGiftsEnabled(!autoGiftsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoGiftsEnabled ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoGiftsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRulesModal(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => setShowAddGiftModal(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Gifts</p>
              <p className="text-xl font-bold text-green-800">
                {stats.totalGifts}
              </p>
            </div>
            <Gift className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Auto Gifts</p>
              <p className="text-xl font-bold text-blue-800">
                {stats.autoGifts}
              </p>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Gift Value</p>
              <p className="text-xl font-bold text-purple-800">
                {currency === "EUR" ? "€" : "ل.س"}
                {totalGiftValue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Gifts List */}
      <div className="space-y-3">
        {gifts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No gifts added yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setShowAddGiftModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Gift
            </Button>
          </div>
        ) : (
          gifts.map((gift) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getRuleColor(gift.type)}`}>
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {gift.productName}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRuleColor(
                          gift.type
                        )}`}
                      >
                        {giftRuleTypes[gift.type]?.name || "Custom"}
                      </span>
                      {gift.automatic && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Auto
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{gift.reason}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Quantity: {gift.quantity}</span>
                      <span>Type: {gift.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newQuantity = prompt(
                        "Enter new quantity:",
                        gift.quantity
                      );
                      if (newQuantity && parseInt(newQuantity) > 0) {
                        updateGift(gift.id, {
                          quantity: parseInt(newQuantity),
                        });
                      }
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGift(gift.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modals */}
      <GiftRulesModal />
      <AddGiftModal />
    </div>
  );
};

export default GiftManager;
