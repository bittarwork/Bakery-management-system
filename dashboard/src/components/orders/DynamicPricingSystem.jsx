import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Euro,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Clock,
  Package,
  Users,
  Target,
  Zap,
  Settings,
  BarChart3,
  Calendar,
  Globe,
  Percent,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Plus,
  X,
  Copy,
  Download,
  Upload,
  History,
  Star,
  Heart,
  Award,
  Crown,
  Gem,
  Sparkles,
  Layers,
  Activity,
  PieChart,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { toast } from "react-hot-toast";

const DynamicPricingSystem = ({
  productId = null,
  orderId = null,
  onPriceUpdate = null,
  showAdvancedRules = true,
  className = "",
}) => {
  // State
  const [pricingData, setPricingData] = useState({
    base_price_eur: 0,
    base_price_syp: 0,
    current_exchange_rate: 2500,
    dynamic_pricing_enabled: true,
    auto_currency_conversion: true,
    pricing_rules: [],
    active_promotions: [],
    quantity_breaks: [],
    time_based_pricing: {
      enabled: false,
      peak_hours: { start: "18:00", end: "22:00", multiplier: 1.2 },
      off_peak_hours: { start: "10:00", end: "14:00", multiplier: 0.9 },
      weekend_multiplier: 1.1,
      holiday_multiplier: 1.3,
    },
    customer_tier_pricing: {
      enabled: true,
      tiers: {
        bronze: { discount: 0, min_orders: 0 },
        silver: { discount: 0.05, min_orders: 10 },
        gold: { discount: 0.1, min_orders: 25 },
        platinum: { discount: 0.15, min_orders: 50 },
        diamond: { discount: 0.2, min_orders: 100 },
      },
    },
    seasonal_pricing: {
      enabled: false,
      seasons: [
        {
          name: "Summer Peak",
          start_date: "2024-06-01",
          end_date: "2024-08-31",
          multiplier: 1.15,
          products: [],
        },
        {
          name: "Holiday Season",
          start_date: "2024-12-15",
          end_date: "2024-12-31",
          multiplier: 1.25,
          products: [],
        },
      ],
    },
  });

  // Price calculation state
  const [priceCalculation, setPriceCalculation] = useState({
    original_price: 0,
    applied_discounts: [],
    applied_surcharges: [],
    final_price_eur: 0,
    final_price_syp: 0,
    savings_amount: 0,
    savings_percentage: 0,
    breakdown: [],
  });

  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showBulkPricing, setShowBulkPricing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);

  // Rule builder state
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    type: "quantity_discount",
    condition: {
      type: "quantity",
      operator: ">=",
      value: 1,
    },
    action: {
      type: "percentage",
      value: 0,
    },
    priority: 1,
    active: true,
    start_date: "",
    end_date: "",
    applicable_products: [],
    applicable_customers: [],
  });

  // Bulk pricing state
  const [bulkUpdates, setBulkUpdates] = useState({
    type: "percentage",
    value: 0,
    target: "all",
    selected_products: [],
    apply_to_currency: "both",
  });

  // Price simulation
  const [simulation, setSimulation] = useState({
    quantity: 1,
    customer_tier: "bronze",
    order_time: new Date().toISOString(),
    special_date: false,
    estimated_price: 0,
  });

  // Initialize data
  useEffect(() => {
    loadPricingData();
    loadPriceHistory();
  }, [productId]);

  // Auto-calculate prices when rules change
  useEffect(() => {
    if (pricingData.dynamic_pricing_enabled) {
      calculateDynamicPrice();
    }
  }, [pricingData, simulation]);

  // Load pricing data
  const loadPricingData = async () => {
    try {
      if (!productId) return;

      const mockData = {
        base_price_eur: 25.99,
        base_price_syp: 64975,
        current_exchange_rate: 2500,
        dynamic_pricing_enabled: true,
        auto_currency_conversion: true,
        pricing_rules: [
          {
            id: 1,
            name: "Bulk Order Discount",
            description: "10% off orders of 10 or more items",
            type: "quantity_discount",
            condition: { type: "quantity", operator: ">=", value: 10 },
            action: { type: "percentage", value: 10 },
            priority: 1,
            active: true,
          },
          {
            id: 2,
            name: "Happy Hour",
            description: "15% off during happy hour",
            type: "time_based",
            condition: { type: "time", start: "14:00", end: "16:00" },
            action: { type: "percentage", value: 15 },
            priority: 2,
            active: true,
          },
        ],
        active_promotions: [
          {
            id: 1,
            name: "Spring Sale",
            discount: 20,
            end_date: "2024-04-30",
            applicable_products: ["all"],
          },
        ],
        quantity_breaks: [
          { min: 1, max: 4, discount: 0 },
          { min: 5, max: 9, discount: 5 },
          { min: 10, max: 19, discount: 10 },
          { min: 20, max: 49, discount: 15 },
          { min: 50, max: null, discount: 20 },
        ],
      };

      setPricingData((prev) => ({ ...prev, ...mockData }));
    } catch (error) {
      console.error("Error loading pricing data:", error);
      toast.error("Failed to load pricing data");
    }
  };

  // Load price history
  const loadPriceHistory = async () => {
    try {
      const mockHistory = [
        {
          date: "2024-03-01",
          price_eur: 24.99,
          price_syp: 62475,
          exchange_rate: 2500,
          reason: "Base price adjustment",
        },
        {
          date: "2024-03-05",
          price_eur: 25.99,
          price_syp: 64975,
          exchange_rate: 2500,
          reason: "Seasonal adjustment",
        },
        {
          date: "2024-03-10",
          price_eur: 25.99,
          price_syp: 67470,
          exchange_rate: 2597,
          reason: "Exchange rate update",
        },
      ];

      setPriceHistory(mockHistory);
    } catch (error) {
      console.error("Error loading price history:", error);
    }
  };

  // Calculate dynamic price
  const calculateDynamicPrice = async () => {
    if (!pricingData.dynamic_pricing_enabled) return;

    setIsCalculating(true);

    try {
      let currentPrice = pricingData.base_price_eur;
      const breakdown = [];
      const appliedDiscounts = [];
      const appliedSurcharges = [];

      // Base price
      breakdown.push({
        type: "base",
        description: "Base Price",
        amount: currentPrice,
        currency: "EUR",
      });

      // Apply quantity discounts
      const quantityBreak = pricingData.quantity_breaks.find(
        (qb) =>
          simulation.quantity >= qb.min &&
          (qb.max === null || simulation.quantity <= qb.max)
      );

      if (quantityBreak && quantityBreak.discount > 0) {
        const discountAmount = (currentPrice * quantityBreak.discount) / 100;
        currentPrice -= discountAmount;
        appliedDiscounts.push({
          name: `Quantity Discount (${quantityBreak.discount}%)`,
          amount: discountAmount,
          percentage: quantityBreak.discount,
        });
        breakdown.push({
          type: "discount",
          description: `Quantity Discount (${simulation.quantity} items)`,
          amount: -discountAmount,
          currency: "EUR",
        });
      }

      // Apply customer tier pricing
      if (pricingData.customer_tier_pricing.enabled) {
        const tierData =
          pricingData.customer_tier_pricing.tiers[simulation.customer_tier];
        if (tierData && tierData.discount > 0) {
          const discountAmount = currentPrice * tierData.discount;
          currentPrice -= discountAmount;
          appliedDiscounts.push({
            name: `${simulation.customer_tier.toUpperCase()} Tier Discount`,
            amount: discountAmount,
            percentage: tierData.discount * 100,
          });
          breakdown.push({
            type: "discount",
            description: `${simulation.customer_tier.toUpperCase()} Member Discount`,
            amount: -discountAmount,
            currency: "EUR",
          });
        }
      }

      // Apply time-based pricing
      if (pricingData.time_based_pricing.enabled) {
        const orderTime = new Date(simulation.order_time);
        const hour = orderTime.getHours();
        const minute = orderTime.getMinutes();
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        const peakStart = pricingData.time_based_pricing.peak_hours.start;
        const peakEnd = pricingData.time_based_pricing.peak_hours.end;
        if (timeString >= peakStart && timeString <= peakEnd) {
          const multiplier =
            pricingData.time_based_pricing.peak_hours.multiplier;
          const surchargeAmount = currentPrice * (multiplier - 1);
          currentPrice *= multiplier;
          appliedSurcharges.push({
            name: "Peak Hours Surcharge",
            amount: surchargeAmount,
            percentage: (multiplier - 1) * 100,
          });
          breakdown.push({
            type: "surcharge",
            description: "Peak Hours Surcharge",
            amount: surchargeAmount,
            currency: "EUR",
          });
        }

        const offPeakStart =
          pricingData.time_based_pricing.off_peak_hours.start;
        const offPeakEnd = pricingData.time_based_pricing.off_peak_hours.end;
        if (timeString >= offPeakStart && timeString <= offPeakEnd) {
          const multiplier =
            pricingData.time_based_pricing.off_peak_hours.multiplier;
          const discountAmount = currentPrice * (1 - multiplier);
          currentPrice *= multiplier;
          appliedDiscounts.push({
            name: "Off-Peak Discount",
            amount: discountAmount,
            percentage: (1 - multiplier) * 100,
          });
          breakdown.push({
            type: "discount",
            description: "Off-Peak Hours Discount",
            amount: -discountAmount,
            currency: "EUR",
          });
        }
      }

      // Calculate final prices
      const finalPriceEUR = currentPrice;
      const finalPriceSYP = finalPriceEUR * pricingData.current_exchange_rate;
      const savingsAmount = pricingData.base_price_eur - finalPriceEUR;
      const savingsPercentage =
        (savingsAmount / pricingData.base_price_eur) * 100;

      // Update calculation state
      setPriceCalculation({
        original_price: pricingData.base_price_eur,
        applied_discounts: appliedDiscounts,
        applied_surcharges: appliedSurcharges,
        final_price_eur: finalPriceEUR,
        final_price_syp: finalPriceSYP,
        savings_amount: savingsAmount,
        savings_percentage: savingsPercentage,
        breakdown: breakdown,
      });

      // Update simulation
      setSimulation((prev) => ({
        ...prev,
        estimated_price: finalPriceEUR,
      }));

      if (onPriceUpdate) {
        onPriceUpdate({
          price_eur: finalPriceEUR,
          price_syp: finalPriceSYP,
          breakdown: breakdown,
        });
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      toast.error("Failed to calculate price");
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle exchange rate update
  const updateExchangeRate = async (newRate) => {
    try {
      setPricingData((prev) => ({
        ...prev,
        current_exchange_rate: newRate,
      }));

      if (pricingData.auto_currency_conversion) {
        calculateDynamicPrice();
      }

      toast.success("Exchange rate updated successfully");
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      toast.error("Failed to update exchange rate");
    }
  };

  // Add pricing rule
  const addPricingRule = () => {
    if (!newRule.name || !newRule.description) {
      toast.error("Please fill in rule name and description");
      return;
    }

    const rule = {
      id: Date.now(),
      ...newRule,
      created_at: new Date().toISOString(),
    };

    setPricingData((prev) => ({
      ...prev,
      pricing_rules: [...prev.pricing_rules, rule],
    }));

    setNewRule({
      name: "",
      description: "",
      type: "quantity_discount",
      condition: { type: "quantity", operator: ">=", value: 1 },
      action: { type: "percentage", value: 0 },
      priority: 1,
      active: true,
      start_date: "",
      end_date: "",
      applicable_products: [],
      applicable_customers: [],
    });

    setShowRuleBuilder(false);
    toast.success("Pricing rule added successfully");
    calculateDynamicPrice();
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

  // Get tier color
  const getTierColor = (tier) => {
    const colors = {
      bronze: "bg-orange-100 text-orange-800",
      silver: "bg-gray-100 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-blue-100 text-blue-800",
      diamond: "bg-purple-100 text-purple-800",
    };
    return colors[tier] || colors.bronze;
  };

  // Price Simulation Component
  const PriceSimulation = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Price Simulation</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <Input
              type="number"
              value={simulation.quantity}
              onChange={(e) =>
                setSimulation((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 1,
                }))
              }
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Tier
            </label>
            <select
              value={simulation.customer_tier}
              onChange={(e) =>
                setSimulation((prev) => ({
                  ...prev,
                  customer_tier: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(pricingData.customer_tier_pricing.tiers).map(
                (tier) => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Time
          </label>
          <input
            type="datetime-local"
            value={simulation.order_time.slice(0, -1)}
            onChange={(e) =>
              setSimulation((prev) => ({
                ...prev,
                order_time: e.target.value + "Z",
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Price Breakdown</h4>
          <div className="space-y-2">
            {priceCalculation.breakdown.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span
                  className={
                    item.type === "discount"
                      ? "text-green-600"
                      : item.type === "surcharge"
                      ? "text-red-600"
                      : "text-gray-700"
                  }
                >
                  {item.description}
                </span>
                <span
                  className={`font-medium ${
                    item.type === "discount"
                      ? "text-green-600"
                      : item.type === "surcharge"
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {formatCurrency(Math.abs(item.amount), item.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-2 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Final Price (EUR)</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(priceCalculation.final_price_eur, "EUR")}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-600">Final Price (SYP)</span>
              <span className="text-lg font-semibold text-purple-600">
                {formatCurrency(priceCalculation.final_price_syp, "SYP")}
              </span>
            </div>
            {priceCalculation.savings_amount > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-green-600">You Save</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(priceCalculation.savings_amount, "EUR")} (
                  {priceCalculation.savings_percentage.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={calculateDynamicPrice}
          disabled={isCalculating}
          className="w-full"
        >
          {isCalculating ? (
            <Calculator className="w-4 h-4 animate-pulse mr-2" />
          ) : (
            <Calculator className="w-4 h-4 mr-2" />
          )}
          Recalculate Price
        </Button>
      </CardBody>
    </Card>
  );

  // Rule Builder Modal
  const RuleBuilderModal = () => (
    <AnimatePresence>
      {showRuleBuilder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRuleBuilder(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Create Pricing Rule</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowRuleBuilder(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name
                  </label>
                  <Input
                    value={newRule.name}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter rule name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Type
                  </label>
                  <select
                    value={newRule.type}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quantity_discount">Quantity Discount</option>
                    <option value="time_based">Time-Based Pricing</option>
                    <option value="customer_tier">Customer Tier</option>
                    <option value="seasonal">Seasonal Pricing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newRule.description}
                  onChange={(e) =>
                    setNewRule((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this rule does..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition Type
                  </label>
                  <select
                    value={newRule.condition.type}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        condition: {
                          ...prev.condition,
                          type: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quantity">Quantity</option>
                    <option value="amount">Order Amount</option>
                    <option value="time">Time of Day</option>
                    <option value="date">Date Range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operator
                  </label>
                  <select
                    value={newRule.condition.operator}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        condition: {
                          ...prev.condition,
                          operator: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value=">=">&gt;=</option>
                    <option value=">">&gt;</option>
                    <option value="=">=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <Input
                    type="number"
                    value={newRule.condition.value}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        condition: {
                          ...prev.condition,
                          value: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Type
                  </label>
                  <select
                    value={newRule.action.type}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        action: {
                          ...prev.action,
                          type: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed">Fixed Amount Discount</option>
                    <option value="multiplier">Price Multiplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <Input
                    type="number"
                    value={newRule.action.value}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        action: {
                          ...prev.action,
                          value: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    step="0.1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRule.active}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active Rule
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowRuleBuilder(false)}
              >
                Cancel
              </Button>
              <Button onClick={addPricingRule}>
                <Save className="w-4 h-4 mr-2" />
                Save Rule
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Dynamic Pricing System
            </h2>
            <p className="text-gray-600">
              Smart pricing with multi-currency support and automated rules
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowRuleBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
          <Button onClick={calculateDynamicPrice} disabled={isCalculating}>
            {isCalculating ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Calculator className="w-4 h-4 mr-2" />
            )}
            Calculate
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "rules", label: "Pricing Rules", icon: Settings },
            { id: "simulation", label: "Price Simulation", icon: Calculator },
            { id: "history", label: "Price History", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Current Pricing */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Current Pricing</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">
                            Euro Price
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(pricingData.base_price_eur, "EUR")}
                          </p>
                        </div>
                        <Euro className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">
                            Syrian Pound Price
                          </p>
                          <p className="text-2xl font-bold text-purple-700">
                            {formatCurrency(pricingData.base_price_syp, "SYP")}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Current Exchange Rate
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          1 EUR = {pricingData.current_exchange_rate} SYP
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newRate = prompt(
                              "Enter new exchange rate:",
                              pricingData.current_exchange_rate
                            );
                            if (newRate) {
                              updateExchangeRate(parseFloat(newRate));
                            }
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Active Promotions */}
              {pricingData.active_promotions.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Active Promotions</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {pricingData.active_promotions.map((promotion) => (
                        <div
                          key={promotion.id}
                          className="p-3 border border-orange-200 bg-orange-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-orange-800">
                                {promotion.name}
                              </h4>
                              <p className="text-sm text-orange-600">
                                {promotion.discount}% off • Ends{" "}
                                {promotion.end_date}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                              {promotion.discount}% OFF
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {/* Pricing Rules Tab */}
          {activeTab === "rules" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pricing Rules</h3>
                  <Button onClick={() => setShowRuleBuilder(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {pricingData.pricing_rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {rule.name}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                rule.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {rule.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {rule.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Type: {rule.type.replace("_", " ")}</span>
                            <span>Priority: {rule.priority}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Price Simulation Tab */}
          {activeTab === "simulation" && <PriceSimulation />}

          {/* Price History Tab */}
          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Price History</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {priceHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">
                              {formatCurrency(entry.price_eur, "EUR")}
                            </span>
                            <span className="text-gray-500">
                              {formatCurrency(entry.price_syp, "SYP")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {entry.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{entry.date}</p>
                          <p className="text-xs text-gray-500">
                            Rate: {entry.exchange_rate}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column - Quick Stats and Tools */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Stats</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Rules</span>
                <span className="font-medium">
                  {pricingData.pricing_rules.filter((r) => r.active).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Promotions</span>
                <span className="font-medium">
                  {pricingData.active_promotions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Exchange Rate</span>
                <span className="font-medium">
                  {pricingData.current_exchange_rate}
                </span>
              </div>
              {priceCalculation.savings_amount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Savings</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(priceCalculation.savings_amount, "EUR")}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Customer Tier Pricing */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Customer Tiers</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Object.entries(pricingData.customer_tier_pricing.tiers).map(
                  ([tier, data]) => (
                    <div
                      key={tier}
                      className={`p-3 rounded-lg border ${getTierColor(tier)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium capitalize">{tier}</h4>
                          <p className="text-xs">
                            Min. {data.min_orders} orders
                          </p>
                        </div>
                        <span className="font-bold">
                          {(data.discount * 100).toFixed(0)}% OFF
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardBody>
          </Card>

          {/* Quick Tools */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Tools</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowBulkPricing(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Price Update
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={calculateDynamicPrice}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate Prices
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  const dataStr = JSON.stringify(pricingData, null, 2);
                  const dataBlob = new Blob([dataStr], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "pricing-data.json";
                  link.click();
                  URL.revokeObjectURL(url);
                  toast.success("Pricing data exported");
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Rule Builder Modal */}
      <RuleBuilderModal />
    </div>
  );
};

export default DynamicPricingSystem;
