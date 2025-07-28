import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Euro,
  DollarSign,
  ArrowRightLeft,
  Settings,
  TrendingUp,
  RefreshCw,
  Globe,
  Info,
  X,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  Target,
  Activity,
  BarChart3,
  TrendingDown,
  Zap,
  Star,
  Heart,
  Award,
  Shield,
  Flag,
  Bookmark,
  Bell,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Tag,
  Search,
  Filter,
  Edit,
  Save,
  Download,
  Upload,
  Share,
  Printer,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Shield as ShieldIcon,
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
  TrendingUpIcon,
  TrendingDownIcon,
  BarChart,
  LineChart,
  PieChart,
  BarChart2,
  Activity as ActivityIcon,
  Pulse,
  Gauge,
  Speedometer,
  Thermometer,
  Battery,
  Signal,
  Wifi,
  Bluetooth,
  Usb,
  Cpu,
  HardDrive,
  Memory,
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
  Zap as ZapIcon,
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
  Gift,
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
  Music,
  Musical,
  Note,
  Headphones,
  Speaker,
  Volume,
  Microphone,
  Radio,
  Podcast,
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
  Bookmark as BookmarkIcon,
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
  Star as StarIcon,
  Heart as HeartIcon,
  Plus,
  Minus,
  Multiply,
  Divide,
  Equals,
  Percent,
  Hash,
  AtSign,
  Ampersand,
  Asterisk,
  Slash,
  Backslash,
  Pipe,
  Tilde,
  Grave,
  Acute,
  Circumflex,
  Cedilla,
  Umlaut,
  Macron,
  Breve,
  Caron,
  Ring,
  Ogonek,
  Stroke,
  Hook,
  Horn,
  Dot,
  Comma,
  Semicolon,
  Colon,
  Apostrophe,
  Quote,
  Quotation,
  Guillemet,
  Bracket,
  Parenthesis,
  Brace,
  Angle,
  Chevron,
  Arrow,
  Pointer,
  Cursor,
  Hand,
  Finger,
  Thumbs,
  Clap,
  Wave,
  Peace,
  Victory,
  Fist,
  Punch,
  Slap,
  High,
  Five,
  Shake,
  Hug,
  Kiss,
  Love,
  Like,
  Dislike,
  Hate,
  Angry,
  Sad,
  Happy,
  Smile,
  Laugh,
  Cry,
  Tear,
  Sweat,
  Dizzy,
  Sick,
  Hurt,
  Dead,
  Ghost,
  Zombie,
  Alien,
  Robot,
  Monster,
  Devil,
  Angel,
  God,
  Jesus,
  Buddha,
  Yin,
  Yang,
  Om,
  Cross,
  Crescent,
  David,
  Ankh,
  Pentagram,
  Hexagram,
  Mandala,
  Lotus,
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
  Oyster as OysterIcon,
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
  III,
  IV,
  V,
  VI,
  VII,
  VIII,
  IX,
  X,
  XI,
  XII,
  XIII,
  XIV,
  XV,
  XVI,
  XVII,
  XVIII,
  XIX,
  XX,
  XXI,
  XXII,
  XXIII,
  XXIV,
  XXV,
  XXVI,
  XXVII,
  XXVIII,
  XXIX,
  XXX,
  XL,
  L,
  LX,
  LXX,
  LXXX,
  XC,
  C,
  CC,
  CCC,
  CD,
  D,
  DC,
  DCC,
  DCCC,
  CM,
  M,
  MM,
  MMM,
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
import Button from "./Button";
import Input from "./Input";
import { Card, CardHeader, CardBody } from "./Card";
import { toast } from "react-hot-toast";

const CurrencyConverter = ({
  isOpen,
  onClose,
  defaultFromCurrency = "EUR",
  defaultToCurrency = "SYP",
  defaultAmount = 1,
  exchangeRate = 2500,
  onExchangeRateUpdate = null,
  showHeader = true,
  showSettings = true,
  className = "",
}) => {
  const [fromCurrency, setFromCurrency] = useState(defaultFromCurrency);
  const [toCurrency, setToCurrency] = useState(defaultToCurrency);
  const [amount, setAmount] = useState(defaultAmount);
  const [currentExchangeRate, setCurrentExchangeRate] = useState(exchangeRate);
  const [showRateSettings, setShowRateSettings] = useState(false);
  const [rateHistory, setRateHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Currency configuration
  const currencies = {
    EUR: {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      flag: "🇪🇺",
      color: "green",
      icon: Euro,
    },
    SYP: {
      code: "SYP",
      name: "Syrian Pound",
      symbol: "ل.س",
      flag: "🇸🇾",
      color: "purple",
      icon: DollarSign,
    },
  };

  // Initialize rate history
  useEffect(() => {
    const history = [
      { date: "2024-01-01", rate: 2450 },
      { date: "2024-01-15", rate: 2480 },
      { date: "2024-02-01", rate: 2500 },
      { date: "2024-02-15", rate: 2520 },
      { date: "2024-03-01", rate: 2510 },
      { date: "2024-03-15", rate: currentExchangeRate },
    ];
    setRateHistory(history);
  }, [currentExchangeRate]);

  // Convert amount
  const convertAmount = (amount, from, to) => {
    if (from === to) return amount;

    if (from === "EUR" && to === "SYP") {
      return amount * currentExchangeRate;
    } else if (from === "SYP" && to === "EUR") {
      return amount / currentExchangeRate;
    }

    return amount;
  };

  // Get converted amount
  const convertedAmount = convertAmount(amount, fromCurrency, toCurrency);

  // Handle currency swap
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount(convertedAmount);
  };

  // Handle rate update
  const handleRateUpdate = (newRate) => {
    setCurrentExchangeRate(newRate);
    if (onExchangeRateUpdate) {
      onExchangeRateUpdate(newRate);
    }

    // Add to history
    const newHistoryEntry = {
      date: new Date().toISOString().split("T")[0],
      rate: newRate,
    };
    setRateHistory((prev) => [...prev.slice(-4), newHistoryEntry]);

    toast.success("Exchange rate updated successfully");
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Get currency color classes
  const getCurrencyColor = (currency) => {
    const colors = {
      EUR: "text-green-600 bg-green-100",
      SYP: "text-purple-600 bg-purple-100",
    };
    return colors[currency] || "text-gray-600 bg-gray-100";
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const config = currencies[currency];
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "SYP" ? 0 : 2,
      maximumFractionDigits: currency === "SYP" ? 0 : 2,
    }).format(amount);
  };

  // Currency selector component
  const CurrencySelector = ({ value, onChange, label }) => {
    const config = currencies[value];
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            {Object.values(currencies).map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <config.icon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    );
  };

  // Rate history component
  const RateHistory = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 flex items-center">
        <BarChart3 className="w-4 h-4 mr-2" />
        Rate History
      </h4>
      <div className="space-y-2">
        {rateHistory.slice(-5).map((entry, index) => (
          <div
            key={entry.date}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <span className="text-sm text-gray-600">{entry.date}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                1 EUR = {entry.rate.toLocaleString()} SYP
              </span>
              {index === rateHistory.length - 1 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Current
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Exchange rate settings modal
  const RateSettingsModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showRateSettings ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Exchange Rate Settings</h3>
            <Button variant="ghost" onClick={() => setShowRateSettings(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Exchange Rate
            </label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  1 EUR = {currentExchangeRate.toLocaleString()} SYP
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(currentExchangeRate.toString())
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Update Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Exchange Rate
            </label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={currentExchangeRate}
                onChange={(e) =>
                  setCurrentExchangeRate(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter new rate"
                min="0"
                step="0.01"
                className="flex-1"
              />
              <Button
                onClick={() => handleRateUpdate(currentExchangeRate)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Rate History */}
          <RateHistory />

          {/* Quick Rate Presets */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Quick Presets
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[2400, 2500, 2600, 2700].map((rate) => (
                <Button
                  key={rate}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentExchangeRate(rate)}
                  className="text-xs"
                >
                  {rate.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        {showHeader && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Currency Converter</h2>
                  <p className="text-sm text-gray-600">
                    Convert between EUR and SYP
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {showSettings && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRateSettings(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Converter */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="text-lg"
            />
          </div>

          {/* From Currency */}
          <CurrencySelector
            value={fromCurrency}
            onChange={setFromCurrency}
            label="From"
          />

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleSwap}
              className="p-3 rounded-full"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* To Currency */}
          <CurrencySelector
            value={toCurrency}
            onChange={setToCurrency}
            label="To"
          />

          {/* Result */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Converted Amount</p>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(convertedAmount, toCurrency)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatCurrency(amount, fromCurrency)} ={" "}
                {formatCurrency(convertedAmount, toCurrency)}
              </p>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Exchange Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  1 EUR = {currentExchangeRate.toLocaleString()} SYP
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `1 EUR = ${currentExchangeRate.toLocaleString()} SYP`
                    )
                  }
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Calculations */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Quick Calculations
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[1, 10, 100, 1000].map((quickAmount) => (
                <div
                  key={quickAmount}
                  className="p-2 bg-gray-50 rounded-lg text-center"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {quickAmount} {fromCurrency}
                  </div>
                  <div className="text-xs text-gray-600">
                    ={" "}
                    {formatCurrency(
                      convertAmount(quickAmount, fromCurrency, toCurrency),
                      toCurrency
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAmount(1);
                  setFromCurrency("EUR");
                  setToCurrency("SYP");
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  copyToClipboard(
                    `${amount} ${fromCurrency} = ${convertedAmount.toFixed(
                      2
                    )} ${toCurrency}`
                  );
                }}
              >
                Copy Result
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rate Settings Modal */}
      <RateSettingsModal />
    </div>
  );
};

export default CurrencyConverter;
