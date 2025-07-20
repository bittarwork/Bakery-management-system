import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Star,
  Plus,
  X,
  Check,
  Settings,
  Tag,
  Zap,
  Award,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { toast } from "react-hot-toast";

const GiftManager = ({
  orderItems = [],
  orderTotal = 0,
  onGiftUpdate,
  currency = "EUR",
  storeId = null,
  customerId = null,
  className = "",
}) => {
  const [gifts, setGifts] = useState([]);
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [autoGiftsEnabled, setAutoGiftsEnabled] = useState(true);
  const [giftRules, setGiftRules] = useState([
    {
      id: "free-shipping",
      name: "Free Shipping",
      condition: "orderTotal >= 50",
      description: "Orders over €50 get free shipping",
      active: true,
      type: "shipping",
      value: 0,
    },
    {
      id: "loyalty-points",
      name: "Bonus Loyalty Points",
      condition: "orderTotal >= 100",
      description: "2x loyalty points for orders over €100",
      active: true,
      type: "points",
      value: 200,
    },
    {
      id: "free-dessert",
      name: "Free Dessert",
      condition: "orderTotal >= 150",
      description: "Complimentary dessert for orders over €150",
      active: true,
      type: "product",
      value: 0,
    },
  ]);

  const [manualGiftData, setManualGiftData] = useState({
    name: "",
    type: "product",
    value: 0,
    description: "",
    isVisible: true,
  });

  // Calculate applicable gifts based on rules
  const applicableGifts = giftRules.filter((rule) => {
    if (!rule.active) return false;

    try {
      // Simple evaluation for common conditions
      if (rule.condition.includes("orderTotal >= ")) {
        const threshold = parseFloat(rule.condition.split("orderTotal >= ")[1]);
        return orderTotal >= threshold;
      }
      return false;
    } catch (error) {
      return false;
    }
  });

  // Auto-apply gifts based on rules
  useEffect(() => {
    if (autoGiftsEnabled) {
      const autoGifts = applicableGifts.map((rule) => ({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        value: rule.value,
        description: rule.description,
        auto: true,
        applied: true,
      }));

      setGifts((prev) => [...prev.filter((g) => !g.auto), ...autoGifts]);
    } else {
      setGifts((prev) => prev.filter((g) => !g.auto));
    }
  }, [orderTotal, autoGiftsEnabled, applicableGifts]);

  // Update parent when gifts change
  useEffect(() => {
    onGiftUpdate?.({
      gifts,
      totalValue: gifts.reduce((sum, gift) => sum + (gift.value || 0), 0),
      applicableCount: applicableGifts.length,
    });
  }, [gifts, applicableGifts, onGiftUpdate]);

  const addManualGift = () => {
    if (!manualGiftData.name) {
      toast.error("Please enter a gift name");
      return;
    }

    const newGift = {
      id: Date.now().toString(),
      ...manualGiftData,
      auto: false,
      applied: true,
    };

    setGifts((prev) => [...prev, newGift]);
    setManualGiftData({
      name: "",
      type: "product",
      value: 0,
      description: "",
      isVisible: true,
    });
    setShowAddGiftModal(false);
    toast.success("Gift added successfully");
  };

  const removeGift = (giftId) => {
    setGifts((prev) => prev.filter((g) => g.id !== giftId));
  };

  const toggleGiftRule = (ruleId) => {
    setGiftRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, active: !rule.active } : rule
      )
    );
  };

  const getGiftIcon = (type) => {
    switch (type) {
      case "product":
        return <Gift className="w-4 h-4" />;
      case "shipping":
        return <Zap className="w-4 h-4" />;
      case "points":
        return <Star className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getGiftTypeColor = (type) => {
    switch (type) {
      case "product":
        return "text-purple-600 bg-purple-100";
      case "shipping":
        return "text-blue-600 bg-blue-100";
      case "points":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Gift & Rewards Manager
            </h3>
            <p className="text-sm text-gray-500">
              Apply gifts and loyalty rewards
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto Gifts</span>
            <button
              onClick={() => setAutoGiftsEnabled(!autoGiftsEnabled)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                autoGiftsEnabled ? "bg-purple-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoGiftsEnabled ? "translate-x-4" : "translate-x-0"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Active Gifts</p>
              <p className="text-xl font-bold text-purple-800">
                {gifts.filter((g) => g.applied).length}
              </p>
            </div>
            <Gift className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Available Rules</p>
              <p className="text-xl font-bold text-yellow-800">
                {applicableGifts.length}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Value</p>
              <p className="text-xl font-bold text-green-800">
                {currency === "EUR" ? "€" : "SYP"}
                {gifts
                  .reduce((sum, gift) => sum + (gift.value || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Available Gifts */}
      {applicableGifts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            Available Gifts ({applicableGifts.length})
          </h4>
          {applicableGifts.map((rule) => (
            <div
              key={rule.id}
              className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded ${getGiftTypeColor(rule.type)}`}>
                    {getGiftIcon(rule.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{rule.name}</p>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Applied
                  </span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applied Gifts */}
      {gifts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Applied Gifts</h4>
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1 rounded ${getGiftTypeColor(gift.type)}`}>
                  {getGiftIcon(gift.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{gift.name}</p>
                  <p className="text-sm text-gray-500">
                    {gift.description}
                    {gift.value > 0 &&
                      ` - Value: ${currency === "EUR" ? "€" : "SYP"}${
                        gift.value
                      }`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {gift.auto && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Auto
                  </span>
                )}
                {!gift.auto && (
                  <button
                    onClick={() => removeGift(gift.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gift Rules Modal */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    Gift Rules Configuration
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowRulesModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {giftRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {rule.name}
                        </h3>
                        <button
                          onClick={() => toggleGiftRule(rule.id)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                            rule.active ? "bg-purple-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              rule.active ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {rule.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Condition: {rule.condition}</span>
                        <span>Type: {rule.type}</span>
                        {rule.value > 0 && (
                          <span>
                            Value: {currency === "EUR" ? "€" : "SYP"}
                            {rule.value}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Manual Gift Modal */}
      <AnimatePresence>
        {showAddGiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Add Manual Gift</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAddGiftModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gift Name
                  </label>
                  <Input
                    type="text"
                    value={manualGiftData.name}
                    onChange={(e) =>
                      setManualGiftData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Complimentary Coffee"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={manualGiftData.type}
                      onChange={(e) =>
                        setManualGiftData((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="product">Product</option>
                      <option value="shipping">Shipping</option>
                      <option value="points">Loyalty Points</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value ({currency === "EUR" ? "€" : "SYP"})
                    </label>
                    <Input
                      type="number"
                      value={manualGiftData.value}
                      onChange={(e) =>
                        setManualGiftData((prev) => ({
                          ...prev,
                          value: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Input
                    type="text"
                    value={manualGiftData.description}
                    onChange={(e) =>
                      setManualGiftData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description of the gift..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Visible to customer
                    </label>
                    <p className="text-xs text-gray-500">
                      Show this gift in customer communications
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setManualGiftData((prev) => ({
                        ...prev,
                        isVisible: !prev.isVisible,
                      }))
                    }
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                      manualGiftData.isVisible ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        manualGiftData.isVisible
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {manualGiftData.name && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-sm text-purple-800">
                      <strong>Gift Preview:</strong> {manualGiftData.name}
                      {manualGiftData.value > 0 &&
                        ` (${currency === "EUR" ? "€" : "SYP"}${
                          manualGiftData.value
                        } value)`}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddGiftModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addManualGift}>
                  <Gift className="w-4 h-4 mr-2" />
                  Add Gift
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftManager;
