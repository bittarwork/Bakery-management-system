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
  Settings,
  Info,
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
  customerId = null,
  className = "",
}) => {
  const [discounts, setDiscounts] = useState([]);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [autoDiscountsEnabled, setAutoDiscountsEnabled] = useState(true);
  const [calculatorData, setCalculatorData] = useState({
    type: "percentage",
    value: 0,
    target: "order",
  });
  const [manualDiscountData, setManualDiscountData] = useState({
    name: "",
    type: "percentage",
    value: 0,
    target: "order",
    targetItemId: "",
    description: "",
    isStackable: true,
  });

  // Calculate total discount
  const totalDiscount = discounts.reduce((sum, discount) => {
    if (discount.target === "order") {
      return (
        sum +
        (discount.type === "percentage"
          ? (orderTotal * discount.value) / 100
          : discount.value)
      );
    }
    // For item-specific discounts
    const targetItem = orderItems.find(
      (item) => item.id === discount.targetItemId
    );
    if (targetItem) {
      const itemTotal = targetItem.price * targetItem.quantity;
      return (
        sum +
        (discount.type === "percentage"
          ? (itemTotal * discount.value) / 100
          : discount.value)
      );
    }
    return sum;
  }, 0);

  const finalTotal = orderTotal - totalDiscount;

  // Auto-calculate discounts based on rules
  useEffect(() => {
    if (autoDiscountsEnabled) {
      const autoDiscounts = [];

      // Volume discount
      if (orderTotal > 100) {
        autoDiscounts.push({
          id: "volume-discount",
          name: "Volume Discount",
          type: "percentage",
          value: 10,
          target: "order",
          description: "Orders over €100",
          auto: true,
        });
      }

      setDiscounts((prev) => [
        ...prev.filter((d) => !d.auto),
        ...autoDiscounts,
      ]);
    }
  }, [orderTotal, autoDiscountsEnabled]);

  // Update parent when discounts change
  useEffect(() => {
    onDiscountUpdate?.({
      discounts,
      totalDiscount,
      finalTotal,
    });
  }, [discounts, totalDiscount, finalTotal, onDiscountUpdate]);

  const addManualDiscount = () => {
    if (!manualDiscountData.name || !manualDiscountData.value) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newDiscount = {
      id: Date.now().toString(),
      ...manualDiscountData,
      auto: false,
    };

    setDiscounts((prev) => [...prev, newDiscount]);
    setManualDiscountData({
      name: "",
      type: "percentage",
      value: 0,
      target: "order",
      targetItemId: "",
      description: "",
      isStackable: true,
    });
    setShowAddDiscountModal(false);
    toast.success("Discount added successfully");
  };

  const removeDiscount = (discountId) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== discountId));
  };

  const calculatePreview = () => {
    const { type, value, target } = calculatorData;
    let discount = 0;

    if (target === "order") {
      discount = type === "percentage" ? (orderTotal * value) / 100 : value;
    }

    return {
      discount,
      finalAmount: orderTotal - discount,
    };
  };

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
              Apply discounts and special offers
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto Discounts</span>
            <button
              onClick={() => setAutoDiscountsEnabled(!autoDiscountsEnabled)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                autoDiscountsEnabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoDiscountsEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalculatorModal(true)}
          >
            <Calculator className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalculatorModal(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => setShowAddDiscountModal(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Total Discount</p>
              <p className="text-xl font-bold text-red-800">
                -{currency === "EUR" ? "€" : "SYP"}
                {totalDiscount.toFixed(2)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Final Total</p>
              <p className="text-xl font-bold text-green-800">
                {currency === "EUR" ? "€" : "SYP"}
                {finalTotal.toFixed(2)}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Active Discounts</p>
              <p className="text-xl font-bold text-blue-800">
                {discounts.length}
              </p>
            </div>
            <Tag className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Savings %</p>
              <p className="text-xl font-bold text-purple-800">
                {orderTotal > 0
                  ? ((totalDiscount / orderTotal) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <Percent className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Active Discounts List */}
      {discounts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Active Discounts</h4>
          {discounts.map((discount) => (
            <div
              key={discount.id}
              className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Tag className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{discount.name}</p>
                  <p className="text-sm text-gray-500">
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : `${currency === "EUR" ? "€" : "SYP"}${
                          discount.value
                        }`}{" "}
                    off
                    {discount.target === "item" &&
                      ` (${
                        orderItems.find(
                          (item) => item.id === discount.targetItemId
                        )?.name || "Unknown Item"
                      })`}
                  </p>
                </div>
              </div>
              {!discount.auto && (
                <button
                  onClick={() => removeDiscount(discount.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculatorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Discount Calculator</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCalculatorModal(false)}
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
                      value={calculatorData.type}
                      onChange={(e) =>
                        setCalculatorData((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value
                    </label>
                    <Input
                      type="number"
                      value={calculatorData.value}
                      onChange={(e) =>
                        setCalculatorData((prev) => ({
                          ...prev,
                          value: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder={
                        calculatorData.type === "percentage" ? "10" : "50"
                      }
                      min="0"
                      step={calculatorData.type === "percentage" ? "1" : "0.01"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Order Total
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">
                      {currency === "EUR" ? "€" : "SYP"}
                      {orderTotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Amount
                  </label>
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-lg font-bold text-red-600">
                      -{currency === "EUR" ? "€" : "SYP"}
                      {calculatePreview().discount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Final Amount
                  </label>
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {currency === "EUR" ? "€" : "SYP"}
                      {calculatePreview().finalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Manual Discount Modal */}
      <AnimatePresence>
        {showAddDiscountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Add Manual Discount</h2>
                  <Button
                    variant="ghost"
                    size="sm"
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
                    type="text"
                    value={manualDiscountData.name}
                    onChange={(e) =>
                      setManualDiscountData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Customer Loyalty Discount"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={manualDiscountData.type}
                      onChange={(e) =>
                        setManualDiscountData((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      value={manualDiscountData.value}
                      onChange={(e) =>
                        setManualDiscountData((prev) => ({
                          ...prev,
                          value: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder={
                        manualDiscountData.type === "percentage" ? "10" : "50"
                      }
                      min="0"
                      step={
                        manualDiscountData.type === "percentage" ? "1" : "0.01"
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply To
                  </label>
                  <select
                    value={manualDiscountData.target}
                    onChange={(e) =>
                      setManualDiscountData((prev) => ({
                        ...prev,
                        target: e.target.value,
                        targetItemId:
                          e.target.value === "order" ? "" : prev.targetItemId,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="order">Entire Order</option>
                    <option value="item">Specific Item</option>
                  </select>
                </div>

                {manualDiscountData.target === "item" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Item
                    </label>
                    <select
                      value={manualDiscountData.targetItemId}
                      onChange={(e) =>
                        setManualDiscountData((prev) => ({
                          ...prev,
                          targetItemId: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose an item</option>
                      {orderItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {currency === "EUR" ? "€" : "SYP"}
                          {item.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <Input
                    type="text"
                    value={manualDiscountData.description}
                    onChange={(e) =>
                      setManualDiscountData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Additional notes about this discount"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Stackable with other discounts
                    </label>
                    <p className="text-xs text-gray-500">
                      Allow combining with other discount offers
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setManualDiscountData((prev) => ({
                        ...prev,
                        isStackable: !prev.isStackable,
                      }))
                    }
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                      manualDiscountData.isStackable
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        manualDiscountData.isStackable
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {manualDiscountData.name && manualDiscountData.value && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Discount Preview:</strong> -
                      {manualDiscountData.type === "percentage"
                        ? `${manualDiscountData.value}%`
                        : `${currency === "EUR" ? "€" : "SYP"}${
                            manualDiscountData.value
                          }`}
                    </div>
                  </div>
                )}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscountManager;
