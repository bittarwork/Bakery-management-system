import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Percent,
  MapPin,
  Building,
  Package,
  Users,
  Globe,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  Euro,
  DollarSign,
  Plus,
  X,
  Edit,
  Save,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Copy,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Flag,
  Shield,
  Award,
  Target,
  Zap,
  Bell,
  Mail,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { toast } from "react-hot-toast";

const AdvancedTaxCalculator = ({
  orderId = null,
  products = [],
  customerData = {},
  onTaxUpdate = null,
  showAdvanced = true,
  className = "",
}) => {
  // State
  const [taxSettings, setTaxSettings] = useState({
    default_region: "EU",
    tax_inclusive_pricing: false,
    round_tax_amounts: true,
    tax_exemptions_enabled: true,
    multi_jurisdiction_support: true,
    tax_calculation_method: "line_item", // line_item, subtotal
    tax_compound_enabled: false,
    reverse_charge_enabled: false,
    digital_services_tax: false,
  });

  // Tax regions and rates
  const [taxRegions, setTaxRegions] = useState([
    {
      id: "EU",
      name: "European Union",
      country_code: "EU",
      default_rate: 20,
      reduced_rates: [
        {
          name: "Food & Beverages",
          rate: 10,
          categories: ["food", "beverages"],
        },
        { name: "Essential Goods", rate: 5, categories: ["bread", "milk"] },
        { name: "Zero Rate", rate: 0, categories: ["export", "charity"] },
      ],
      reverse_charge_threshold: 10000,
      digital_services_rate: 3,
      currency: "EUR",
      active: true,
    },
    {
      id: "SY",
      name: "Syria",
      country_code: "SY",
      default_rate: 12,
      reduced_rates: [
        {
          name: "Basic Foods",
          rate: 0,
          categories: ["bread", "rice", "sugar"],
        },
        { name: "Medicines", rate: 0, categories: ["medicine", "medical"] },
        {
          name: "Books & Education",
          rate: 5,
          categories: ["books", "education"],
        },
      ],
      reverse_charge_threshold: 25000000, // SYP
      digital_services_rate: 5,
      currency: "SYP",
      active: true,
    },
    {
      id: "US",
      name: "United States",
      country_code: "US",
      default_rate: 8.5,
      reduced_rates: [
        { name: "Food", rate: 0, categories: ["food"] },
        { name: "Clothing", rate: 4, categories: ["clothing"] },
      ],
      reverse_charge_threshold: 100000, // USD
      digital_services_rate: 2,
      currency: "USD",
      active: false,
    },
  ]);

  // Product categories for tax classification
  const [productCategories, setProductCategories] = useState([
    {
      id: "food",
      name: "Food & Beverages",
      default_tax_rate: 10,
      tax_exempt: false,
    },
    {
      id: "bread",
      name: "Bread & Bakery",
      default_tax_rate: 5,
      tax_exempt: false,
    },
    {
      id: "beverages",
      name: "Beverages",
      default_tax_rate: 20,
      tax_exempt: false,
    },
    {
      id: "sweets",
      name: "Sweets & Desserts",
      default_tax_rate: 20,
      tax_exempt: false,
    },
    {
      id: "catering",
      name: "Catering Services",
      default_tax_rate: 20,
      tax_exempt: false,
    },
    {
      id: "equipment",
      name: "Equipment",
      default_tax_rate: 20,
      tax_exempt: false,
    },
    {
      id: "digital",
      name: "Digital Services",
      default_tax_rate: 20,
      tax_exempt: false,
    },
  ]);

  // Customer tax exemptions
  const [customerExemptions, setCustomerExemptions] = useState([
    {
      id: 1,
      customer_id: "company_123",
      exemption_type: "vat_number",
      exemption_value: "EU123456789",
      valid_until: "2024-12-31",
      regions: ["EU"],
      active: true,
    },
    {
      id: 2,
      customer_id: "charity_456",
      exemption_type: "charity",
      exemption_value: "CHARITY001",
      valid_until: null,
      regions: ["EU", "SY"],
      active: true,
    },
  ]);

  // Current calculation
  const [taxCalculation, setTaxCalculation] = useState({
    subtotal: 0,
    tax_breakdown: [],
    total_tax_amount: 0,
    total_amount: 0,
    effective_tax_rate: 0,
    applicable_exemptions: [],
    warnings: [],
    currency: "EUR",
  });

  // UI State
  const [activeTab, setActiveTab] = useState("calculator");
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("EU");
  const [showExemptionModal, setShowExemptionModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // New exemption state
  const [newExemption, setNewExemption] = useState({
    customer_id: "",
    exemption_type: "vat_number",
    exemption_value: "",
    valid_until: "",
    regions: [],
    active: true,
  });

  // Initialize data
  useEffect(() => {
    if (products.length > 0) {
      calculateTax();
    }
  }, [products, selectedRegion, taxSettings]);

  // Calculate tax for products
  const calculateTax = async () => {
    setIsCalculating(true);

    try {
      const region = taxRegions.find((r) => r.id === selectedRegion);
      if (!region) {
        throw new Error("Invalid tax region");
      }

      let subtotal = 0;
      const taxBreakdown = [];
      const warnings = [];
      const applicableExemptions = [];

      // Calculate subtotal
      subtotal = products.reduce((sum, product) => {
        const price = product.price_eur || product.price || 0;
        const quantity = product.quantity || 1;
        return sum + price * quantity;
      }, 0);

      // Check for customer exemptions
      const customerExemption = customerExemptions.find(
        (exemption) =>
          exemption.customer_id === customerData.id &&
          exemption.regions.includes(selectedRegion) &&
          exemption.active &&
          (!exemption.valid_until ||
            new Date(exemption.valid_until) > new Date())
      );

      if (customerExemption) {
        applicableExemptions.push(customerExemption);
      }

      // Calculate tax by product category
      const taxByCategory = {};

      for (const product of products) {
        const category = product.category || "food";
        const price = product.price_eur || product.price || 0;
        const quantity = product.quantity || 1;
        const lineTotal = price * quantity;

        // Determine tax rate
        let taxRate = region.default_rate;

        // Check for reduced rates
        const reducedRate = region.reduced_rates.find((rate) =>
          rate.categories.includes(category)
        );

        if (reducedRate) {
          taxRate = reducedRate.rate;
        }

        // Apply exemptions
        if (
          customerExemption &&
          customerExemption.exemption_type === "vat_number"
        ) {
          if (subtotal >= region.reverse_charge_threshold) {
            taxRate = 0; // Reverse charge applies
            warnings.push(
              `Reverse charge applies for VAT-registered customer (${customerExemption.exemption_value})`
            );
          }
        } else if (
          customerExemption &&
          customerExemption.exemption_type === "charity"
        ) {
          taxRate = 0;
          warnings.push("Tax exemption applied for registered charity");
        }

        // Calculate tax amount
        let taxAmount = 0;
        if (taxSettings.tax_inclusive_pricing) {
          // Tax is included in the price
          taxAmount = (lineTotal * taxRate) / (100 + taxRate);
        } else {
          // Tax is added to the price
          taxAmount = (lineTotal * taxRate) / 100;
        }

        // Round tax amount if enabled
        if (taxSettings.round_tax_amounts) {
          taxAmount = Math.round(taxAmount * 100) / 100;
        }

        // Group by tax rate for breakdown
        const rateKey = `${taxRate}%`;
        if (!taxByCategory[rateKey]) {
          taxByCategory[rateKey] = {
            rate: taxRate,
            taxable_amount: 0,
            tax_amount: 0,
            products: [],
          };
        }

        taxByCategory[rateKey].taxable_amount += lineTotal;
        taxByCategory[rateKey].tax_amount += taxAmount;
        taxByCategory[rateKey].products.push({
          name: product.name,
          category: category,
          price: price,
          quantity: quantity,
          line_total: lineTotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
        });
      }

      // Convert to breakdown array
      Object.entries(taxByCategory).forEach(([rateKey, data]) => {
        if (data.tax_amount > 0) {
          taxBreakdown.push({
            rate: data.rate,
            rate_label: rateKey,
            taxable_amount: data.taxable_amount,
            tax_amount: data.tax_amount,
            products: data.products,
          });
        }
      });

      // Calculate totals
      const totalTaxAmount = taxBreakdown.reduce(
        (sum, item) => sum + item.tax_amount,
        0
      );

      let totalAmount;
      if (taxSettings.tax_inclusive_pricing) {
        totalAmount = subtotal;
      } else {
        totalAmount = subtotal + totalTaxAmount;
      }

      const effectiveTaxRate =
        subtotal > 0 ? (totalTaxAmount / subtotal) * 100 : 0;

      // Digital services tax (if applicable)
      if (
        taxSettings.digital_services_tax &&
        region.digital_services_rate > 0
      ) {
        const digitalProducts = products.filter(
          (p) => p.category === "digital" || p.is_digital
        );

        if (digitalProducts.length > 0) {
          const digitalSubtotal = digitalProducts.reduce((sum, product) => {
            const price = product.price_eur || product.price || 0;
            const quantity = product.quantity || 1;
            return sum + price * quantity;
          }, 0);

          const digitalTax =
            (digitalSubtotal * region.digital_services_rate) / 100;

          taxBreakdown.push({
            rate: region.digital_services_rate,
            rate_label: `Digital Services Tax (${region.digital_services_rate}%)`,
            taxable_amount: digitalSubtotal,
            tax_amount: digitalTax,
            products: digitalProducts.map((p) => ({
              name: p.name,
              category: p.category,
              price: p.price_eur || p.price,
              quantity: p.quantity || 1,
            })),
          });

          warnings.push("Digital Services Tax applied to digital products");
        }
      }

      // Update calculation state
      setTaxCalculation({
        subtotal: subtotal,
        tax_breakdown: taxBreakdown,
        total_tax_amount: totalTaxAmount,
        total_amount: totalAmount,
        effective_tax_rate: effectiveTaxRate,
        applicable_exemptions: applicableExemptions,
        warnings: warnings,
        currency: region.currency,
      });

      // Notify parent component
      if (onTaxUpdate) {
        onTaxUpdate({
          subtotal,
          tax_amount: totalTaxAmount,
          total_amount: totalAmount,
          breakdown: taxBreakdown,
          region: selectedRegion,
          currency: region.currency,
        });
      }
    } catch (error) {
      console.error("Error calculating tax:", error);
      toast.error("Failed to calculate tax");
    } finally {
      setIsCalculating(false);
    }
  };

  // Add new exemption
  const addExemption = () => {
    if (!newExemption.customer_id || !newExemption.exemption_value) {
      toast.error("Please fill in required fields");
      return;
    }

    const exemption = {
      id: Date.now(),
      ...newExemption,
      created_at: new Date().toISOString(),
    };

    setCustomerExemptions((prev) => [...prev, exemption]);
    setNewExemption({
      customer_id: "",
      exemption_type: "vat_number",
      exemption_value: "",
      valid_until: "",
      regions: [],
      active: true,
    });
    setShowExemptionModal(false);
    toast.success("Tax exemption added successfully");
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get exemption type label
  const getExemptionTypeLabel = (type) => {
    const labels = {
      vat_number: "VAT Number",
      charity: "Charity Registration",
      government: "Government Entity",
      export: "Export License",
      diplomatic: "Diplomatic Exemption",
    };
    return labels[type] || type;
  };

  // Tax Breakdown Component
  const TaxBreakdownComponent = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tax Breakdown</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
          >
            {showTaxBreakdown ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {showTaxBreakdown && (
        <CardBody>
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      taxCalculation.subtotal,
                      taxCalculation.currency
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tax</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(
                      taxCalculation.total_tax_amount,
                      taxCalculation.currency
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Effective Rate</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {taxCalculation.effective_tax_rate.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(
                      taxCalculation.total_amount,
                      taxCalculation.currency
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown by Rate */}
            {taxCalculation.tax_breakdown.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tax by Rate</h4>
                <div className="space-y-2">
                  {taxCalculation.tax_breakdown.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {item.rate_label}
                          </span>
                          <span className="text-sm text-gray-600">
                            on{" "}
                            {formatCurrency(
                              item.taxable_amount,
                              taxCalculation.currency
                            )}
                          </span>
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(
                            item.tax_amount,
                            taxCalculation.currency
                          )}
                        </span>
                      </div>

                      {/* Products in this tax rate */}
                      {item.products && item.products.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-gray-200">
                          {item.products.map((product, pIndex) => (
                            <div
                              key={pIndex}
                              className="flex items-center justify-between text-xs text-gray-600 py-1"
                            >
                              <span>
                                {product.name} × {product.quantity}
                              </span>
                              <span>
                                {formatCurrency(
                                  product.tax_amount,
                                  taxCalculation.currency
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exemptions Applied */}
            {taxCalculation.applicable_exemptions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Applied Exemptions
                </h4>
                <div className="space-y-2">
                  {taxCalculation.applicable_exemptions.map(
                    (exemption, index) => (
                      <div
                        key={index}
                        className="p-3 border border-green-200 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            {getExemptionTypeLabel(exemption.exemption_type)}
                          </span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          {exemption.exemption_value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Warnings */}
            {taxCalculation.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notices</h4>
                <div className="space-y-2">
                  {taxCalculation.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg"
                    >
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm text-yellow-800">
                          {warning}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      )}
    </Card>
  );

  // Exemption Modal
  const ExemptionModal = () => (
    <AnimatePresence>
      {showExemptionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowExemptionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Add Tax Exemption</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowExemptionModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID
                  </label>
                  <Input
                    value={newExemption.customer_id}
                    onChange={(e) =>
                      setNewExemption((prev) => ({
                        ...prev,
                        customer_id: e.target.value,
                      }))
                    }
                    placeholder="Enter customer ID..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exemption Type
                  </label>
                  <select
                    value={newExemption.exemption_type}
                    onChange={(e) =>
                      setNewExemption((prev) => ({
                        ...prev,
                        exemption_type: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vat_number">VAT Number</option>
                    <option value="charity">Charity Registration</option>
                    <option value="government">Government Entity</option>
                    <option value="export">Export License</option>
                    <option value="diplomatic">Diplomatic Exemption</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exemption Value/Number
                </label>
                <Input
                  value={newExemption.exemption_value}
                  onChange={(e) =>
                    setNewExemption((prev) => ({
                      ...prev,
                      exemption_value: e.target.value,
                    }))
                  }
                  placeholder="Enter exemption number or value..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until (Optional)
                </label>
                <Input
                  type="date"
                  value={newExemption.valid_until}
                  onChange={(e) =>
                    setNewExemption((prev) => ({
                      ...prev,
                      valid_until: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applicable Regions
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {taxRegions.map((region) => (
                    <label key={region.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newExemption.regions.includes(region.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewExemption((prev) => ({
                              ...prev,
                              regions: [...prev.regions, region.id],
                            }));
                          } else {
                            setNewExemption((prev) => ({
                              ...prev,
                              regions: prev.regions.filter(
                                (r) => r !== region.id
                              ),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">{region.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newExemption.active}
                  onChange={(e) =>
                    setNewExemption((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Active Exemption
                </span>
              </label>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowExemptionModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={addExemption}>
                <Save className="w-4 h-4 mr-2" />
                Add Exemption
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
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calculator className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Advanced Tax Calculator
            </h2>
            <p className="text-gray-600">
              Multi-region tax calculation with exemptions and advanced rules
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {taxRegions
              .filter((region) => region.active)
              .map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} ({region.default_rate}%)
                </option>
              ))}
          </select>
          <Button onClick={calculateTax} disabled={isCalculating}>
            {isCalculating ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Calculator className="w-4 h-4 mr-2" />
            )}
            Calculate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tax Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <TaxBreakdownComponent />

          {/* Product Tax Details */}
          {products.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Product Tax Details</h3>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Tax Rate
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Tax Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product, index) => {
                        const price = product.price_eur || product.price || 0;
                        const quantity = product.quantity || 1;
                        const category = product.category || "food";

                        // Find applicable tax rate
                        const region = taxRegions.find(
                          (r) => r.id === selectedRegion
                        );
                        let taxRate = region.default_rate;

                        const reducedRate = region.reduced_rates.find((rate) =>
                          rate.categories.includes(category)
                        );

                        if (reducedRate) {
                          taxRate = reducedRate.rate;
                        }

                        const lineTotal = price * quantity;
                        const taxAmount = taxSettings.tax_inclusive_pricing
                          ? (lineTotal * taxRate) / (100 + taxRate)
                          : (lineTotal * taxRate) / 100;

                        return (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {category}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {formatCurrency(price, taxCalculation.currency)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {taxRate}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium">
                              {formatCurrency(
                                taxAmount,
                                taxCalculation.currency
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column - Settings and Tools */}
        <div className="space-y-6">
          {/* Quick Settings */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Tax Settings</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={taxSettings.tax_inclusive_pricing}
                  onChange={(e) =>
                    setTaxSettings((prev) => ({
                      ...prev,
                      tax_inclusive_pricing: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Tax Inclusive Pricing
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={taxSettings.round_tax_amounts}
                  onChange={(e) =>
                    setTaxSettings((prev) => ({
                      ...prev,
                      round_tax_amounts: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Round Tax Amounts
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={taxSettings.tax_exemptions_enabled}
                  onChange={(e) =>
                    setTaxSettings((prev) => ({
                      ...prev,
                      tax_exemptions_enabled: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Enable Tax Exemptions
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={taxSettings.reverse_charge_enabled}
                  onChange={(e) =>
                    setTaxSettings((prev) => ({
                      ...prev,
                      reverse_charge_enabled: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Reverse Charge Mechanism
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={taxSettings.digital_services_tax}
                  onChange={(e) =>
                    setTaxSettings((prev) => ({
                      ...prev,
                      digital_services_tax: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Digital Services Tax
                </span>
              </label>
            </CardBody>
          </Card>

          {/* Current Region Info */}
          {selectedRegion && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Current Region</h3>
              </CardHeader>
              <CardBody>
                {(() => {
                  const region = taxRegions.find(
                    (r) => r.id === selectedRegion
                  );
                  return region ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Region</span>
                        <span className="font-medium">{region.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Default Rate
                        </span>
                        <span className="font-medium">
                          {region.default_rate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Currency</span>
                        <span className="font-medium">{region.currency}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Reduced Rates
                        </span>
                        <span className="font-medium">
                          {region.reduced_rates.length}
                        </span>
                      </div>
                      {region.reverse_charge_threshold && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Reverse Charge Threshold
                          </span>
                          <span className="font-medium">
                            {formatCurrency(
                              region.reverse_charge_threshold,
                              region.currency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </CardBody>
            </Card>
          )}

          {/* Tax Exemptions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tax Exemptions</h3>
                <Button size="sm" onClick={() => setShowExemptionModal(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {customerExemptions.map((exemption) => (
                  <div
                    key={exemption.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {getExemptionTypeLabel(exemption.exemption_type)}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {exemption.exemption_value}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {exemption.regions.map((regionId) => (
                            <span
                              key={regionId}
                              className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {regionId}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          exemption.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {exemption.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}

                {customerExemptions.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tax exemptions configured</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Exemption Modal */}
      <ExemptionModal />
    </div>
  );
};

export default AdvancedTaxCalculator;
