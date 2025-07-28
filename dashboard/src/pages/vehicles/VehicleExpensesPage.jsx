import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  DollarSign,
  Fuel,
  Wrench,
  Car,
  Calendar,
  Receipt,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Download,
  Save,
  BarChart3,
} from "lucide-react";
import { toast } from "react-hot-toast";
import vehicleService from "../../services/vehicleService";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuthStore } from "../../stores/authStore";

const VehicleExpensesPage = () => {
  const { user } = useAuthStore();

  // State management
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "fuel",
    amount: "",
    currency: "EUR",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });
  const [formErrors, setFormErrors] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    type: "",
    currency: "",
    date_from: "",
    date_to: "",
  });

  const expenseTypes = [
    { value: "fuel", label: "وقود", icon: "⛽", color: "text-blue-600" },
    {
      value: "maintenance",
      label: "صيانة",
      icon: "🔧",
      color: "text-yellow-600",
    },
    { value: "repair", label: "إصلاح", icon: "🛠️", color: "text-red-600" },
    { value: "washing", label: "غسيل", icon: "🧽", color: "text-green-600" },
    { value: "other", label: "أخرى", icon: "📋", color: "text-gray-600" },
  ];

  // Load expenses on component mount
  useEffect(() => {
    // For now, we'll use mock data since we don't have an expenses list endpoint
    setExpenses([]);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.type) {
      errors.type = "نوع المصروف مطلوب";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "المبلغ يجب أن يكون أكبر من صفر";
    }

    if (!formData.description.trim()) {
      errors.description = "الوصف مطلوب";
    }

    if (!formData.expense_date) {
      errors.expense_date = "تاريخ المصروف مطلوب";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    try {
      setSubmitting(true);

      const expenseData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        expense_date: formData.expense_date,
      };

      const response = await vehicleService.recordVehicleExpense(expenseData);

      if (response.success) {
        toast.success("تم تسجيل المصروف بنجاح");
        setShowAddForm(false);
        setFormData({
          type: "fuel",
          amount: "",
          currency: "EUR",
          description: "",
          expense_date: new Date().toISOString().split("T")[0],
        });
        // Refresh expenses list (when implemented)
      } else {
        toast.error(response.error || "خطأ في تسجيل المصروف");
      }
    } catch (error) {
      toast.error("خطأ في تسجيل المصروف");
      console.error("Error recording expense:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getExpenseTypeInfo = (type) => {
    return expenseTypes.find((t) => t.value === type) || expenseTypes[0];
  };

  const formatCurrency = (amount, currency) => {
    return `${parseFloat(amount).toLocaleString()} ${currency}`;
  };

  const getMonthlyTotal = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.expense_date);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Receipt className="w-8 h-8 mr-3 text-green-600" />
            مصروفات المركبة
          </h1>
          <p className="text-gray-600 mt-2">
            تسجيل وتتبع مصروفات مركبة التوزيع الخاصة بك
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setShowAddForm(true)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            إضافة مصروف
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">هذا الشهر</p>
                <p className="text-2xl font-bold text-green-900">
                  €{getMonthlyTotal().toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  إجمالي المصروفات
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {expenses.length}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">آخر مصروف</p>
                <p className="text-sm font-medium text-yellow-900">
                  {expenses.length > 0
                    ? new Date(expenses[0]?.expense_date).toLocaleDateString(
                        "ar"
                      )
                    : "لا يوجد"}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  متوسط يومي
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  €
                  {expenses.length > 0
                    ? (getMonthlyTotal() / 30).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Expense Types Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            أنواع المصروفات
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {expenseTypes.map((type) => (
              <motion.button
                key={type.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, type: type.value }));
                  setShowAddForm(true);
                }}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <p className={`text-sm font-medium ${type.color}`}>
                  {type.label}
                </p>
              </motion.button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              سجل المصروفات
            </h3>
            <Button
              onClick={() => console.log("Export expenses")}
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              تصدير
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد مصروفات مسجلة
              </h3>
              <p className="text-gray-500 mb-4">
                ابدأ بتسجيل أول مصروف لمركبتك
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                إضافة مصروف
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getExpenseTypeInfo(expense.type).icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getExpenseTypeInfo(expense.type).label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.expense_date).toLocaleDateString(
                          "ar"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    إضافة مصروف جديد
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {/* Expense Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع المصروف <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                        formErrors.type ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {expenseTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.type && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.type}
                      </p>
                    )}
                  </div>

                  {/* Amount and Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المبلغ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) =>
                          handleInputChange("amount", e.target.value)
                        }
                        placeholder="0.00"
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                          formErrors.amount
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.amount && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.amount}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        العملة
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) =>
                          handleInputChange("currency", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="EUR">EUR</option>
                        <option value="SYP">SYP</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوصف <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="وصف تفصيلي للمصروف..."
                      rows={3}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-none ${
                        formErrors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التاريخ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) =>
                        handleInputChange("expense_date", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                        formErrors.expense_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.expense_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.expense_date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex space-x-3 justify-end">
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    variant="secondary"
                    disabled={submitting}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    icon={<Save className="w-4 h-4" />}
                  >
                    حفظ
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleExpensesPage;
