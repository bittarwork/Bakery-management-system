import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Euro,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Globe,
  Calculator,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
  Info,
  Edit,
  History,
  Target,
  Activity,
  Zap,
  Star,
  Award,
  Shield,
  Lock,
  Key,
  Clock,
  Calendar,
  Bell,
  Mail,
  User,
  Users,
  Building,
  Store,
  Tag,
  Flag,
  Bookmark,
  Heart,
  Gift,
  Plus,
  Minus,
  X,
  Check,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Printer,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  MessageSquare,
  Phone,
  MapPin,
  Navigation,
  Compass,
  Map,
  Anchor,
  Ship,
  Plane,
  Car,
  Bike,
  Bus,
  Train,
  Truck,
  Taxi,
  Fuel,
  Battery,
  Plug,
  Wifi,
  Bluetooth,
  Signal,
  Satellite,
  Radar,
  Rss,
  Hash,
  AtSign,
  Percent,
  Currency,
  Coins,
  Wallet,
  CreditCard,
  Receipt,
  Invoice,
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
import CurrencyConverter from "../ui/CurrencyConverter";
import { toast } from "react-hot-toast";

const CurrencySettings = () => {
  // State
  const [settings, setSettings] = useState({
    defaultCurrency: "EUR",
    exchangeRate: 2500,
    autoUpdateRates: false,
    showDualPricing: true,
    priceDisplayFormat: "both", // 'primary', 'secondary', 'both'
    rateUpdateFrequency: "daily", // 'manual', 'daily', 'weekly'
    notifications: {
      rateChanges: true,
      significantChanges: true,
      dailyUpdates: false,
    },
  });

  const [rateHistory, setRateHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showRateHistory, setShowRateHistory] = useState(false);

  // Currency configuration
  const currencies = {
    EUR: {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      flag: "🇪🇺",
      color: "green",
    },
    SYP: {
      code: "SYP",
      name: "Syrian Pound",
      symbol: "ل.س",
      flag: "🇸🇾",
      color: "purple",
    },
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    loadRateHistory();
  }, []);

  // Load settings from localStorage or API
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      const savedSettings = localStorage.getItem("currencySettings");
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Error loading currency settings:", error);
      toast.error("Failed to load currency settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Load rate history
  const loadRateHistory = async () => {
    try {
      // Mock rate history data
      const history = [
        { date: "2024-03-01", rate: 2480, change: -20 },
        { date: "2024-03-02", rate: 2490, change: 10 },
        { date: "2024-03-03", rate: 2495, change: 5 },
        { date: "2024-03-04", rate: 2500, change: 5 },
        { date: "2024-03-05", rate: 2505, change: 5 },
        { date: "2024-03-06", rate: 2510, change: 5 },
        { date: "2024-03-07", rate: 2500, change: -10 },
        { date: "2024-03-08", rate: 2495, change: -5 },
        { date: "2024-03-09", rate: 2490, change: -5 },
        { date: "2024-03-10", rate: 2500, change: 10 },
      ];
      setRateHistory(history);
    } catch (error) {
      console.error("Error loading rate history:", error);
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      // In a real app, this would be an API call
      localStorage.setItem("currencySettings", JSON.stringify(settings));
      toast.success("Currency settings saved successfully");
    } catch (error) {
      console.error("Error saving currency settings:", error);
      toast.error("Failed to save currency settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle setting change
  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle nested setting change
  const handleNestedSettingChange = (parent, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value,
      },
    }));
  };

  // Update exchange rate
  const updateExchangeRate = async (newRate) => {
    try {
      setIsLoading(true);

      // Add to history
      const historyEntry = {
        date: new Date().toISOString().split("T")[0],
        rate: newRate,
        change: newRate - settings.exchangeRate,
      };

      setRateHistory((prev) => [...prev, historyEntry]);
      handleSettingChange("exchangeRate", newRate);

      toast.success("Exchange rate updated successfully");
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      toast.error("Failed to update exchange rate");
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "SYP" ? 0 : 2,
      maximumFractionDigits: currency === "SYP" ? 0 : 2,
    }).format(amount);
  };

  // Get rate change color
  const getRateChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  // Get rate change icon
  const getRateChangeIcon = (change) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Activity;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Currency Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Manage exchange rates and currency preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowConverter(true)}>
            <Calculator className="w-4 h-4 mr-2" />
            Calculator
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Exchange Rate */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Current Exchange Rate</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRateHistory(!showRateHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Rate Display */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-purple-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-2xl">🇪🇺</span>
                    <Euro className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xl font-bold">1 EUR</span>
                  <span className="text-gray-500">=</span>
                  <span className="text-xl font-bold text-purple-600">
                    {settings.exchangeRate.toLocaleString()} SYP
                  </span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                    <span className="text-2xl">🇸🇾</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last updated</p>
                  <p className="text-sm font-medium">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Rate Update */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Exchange Rate
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={settings.exchangeRate}
                    onChange={(e) =>
                      handleSettingChange(
                        "exchangeRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Enter new rate"
                    min="0"
                    step="0.01"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => updateExchangeRate(settings.exchangeRate)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Frequency
                </label>
                <select
                  value={settings.rateUpdateFrequency}
                  onChange={(e) =>
                    handleSettingChange("rateUpdateFrequency", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="manual">Manual</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            {/* Rate History */}
            {showRateHistory && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Recent Rate Changes
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {rateHistory
                    .slice(-10)
                    .reverse()
                    .map((entry, index) => {
                      const ChangeIcon = getRateChangeIcon(entry.change);
                      return (
                        <div
                          key={entry.date}
                          className="flex items-center justify-between p-2 bg-white rounded border"
                        >
                          <div className="flex items-center space-x-3">
                            <ChangeIcon
                              className={`w-4 h-4 ${getRateChangeColor(
                                entry.change
                              )}`}
                            />
                            <span className="text-sm text-gray-600">
                              {entry.date}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {entry.rate.toLocaleString()} SYP
                            </span>
                            <span
                              className={`text-xs ${getRateChangeColor(
                                entry.change
                              )}`}
                            >
                              {entry.change > 0 ? "+" : ""}
                              {entry.change}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Currency Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Currency Preferences</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) =>
                  handleSettingChange("defaultCurrency", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(currencies).map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Display Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Display Format
              </label>
              <select
                value={settings.priceDisplayFormat}
                onChange={(e) =>
                  handleSettingChange("priceDisplayFormat", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="primary">Primary Currency Only</option>
                <option value="secondary">Secondary Currency Only</option>
                <option value="both">Both Currencies</option>
              </select>
            </div>

            {/* Dual Pricing */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Show Dual Pricing
                </label>
                <p className="text-xs text-gray-500">
                  Display prices in both currencies
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "showDualPricing",
                    !settings.showDualPricing
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showDualPricing ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showDualPricing ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Auto Update Rates */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Auto Update Rates
                </label>
                <p className="text-xs text-gray-500">
                  Automatically update exchange rates
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "autoUpdateRates",
                    !settings.autoUpdateRates
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoUpdateRates ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoUpdateRates ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Notifications</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Rate Changes
                </label>
                <p className="text-xs text-gray-500">
                  Notify when exchange rates change
                </p>
              </div>
              <button
                onClick={() =>
                  handleNestedSettingChange(
                    "notifications",
                    "rateChanges",
                    !settings.notifications.rateChanges
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.rateChanges
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.rateChanges
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Significant Changes
                </label>
                <p className="text-xs text-gray-500">
                  Notify on significant rate changes (&gt;5%)
                </p>
              </div>
              <button
                onClick={() =>
                  handleNestedSettingChange(
                    "notifications",
                    "significantChanges",
                    !settings.notifications.significantChanges
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.significantChanges
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.significantChanges
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Daily Updates
                </label>
                <p className="text-xs text-gray-500">
                  Daily rate update notifications
                </p>
              </div>
              <button
                onClick={() =>
                  handleNestedSettingChange(
                    "notifications",
                    "dailyUpdates",
                    !settings.notifications.dailyUpdates
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.dailyUpdates
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.dailyUpdates
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Conversion Examples */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Conversion Examples</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 10, 100, 1000].map((amount) => (
              <div
                key={amount}
                className="p-3 bg-gray-50 rounded-lg text-center"
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {amount} EUR
                </div>
                <div className="text-sm text-gray-600">
                  = {formatCurrency(amount * settings.exchangeRate, "SYP")}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Currency Converter Modal */}
      <CurrencyConverter
        isOpen={showConverter}
        onClose={() => setShowConverter(false)}
        exchangeRate={settings.exchangeRate}
        onExchangeRateUpdate={updateExchangeRate}
      />
    </div>
  );
};

export default CurrencySettings;
