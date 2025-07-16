import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Loader2,
  CreditCard,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Euro,
  Package,
  FileText,
  Edit,
  Eye,
  RefreshCw,
  Store,
  Globe,
  Calculator,
  Truck,
  Building,
  Clock,
  Check,
  X,
  Clock as ClockIcon,
  Receipt,
  Tag,
  Star,
  Heart,
  Award,
  Shield,
  Info,
  AlertTriangle,
  Settings,
  MoreVertical,
  Share,
  Copy,
  ExternalLink,
  Activity,
  History,
  Target,
  Zap,
  Bell,
  MessageSquare,
  RotateCcw,
  Archive,
  Bookmark,
  Flag,
  Star as StarIcon,
  Heart as HeartIcon,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import orderService from "../../services/orderService";
import productService from "../../services/productService";
import userService from "../../services/userService";

const EditOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Order data
  const [order, setOrder] = useState({
    order_number: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    total_amount: 0,
    currency: "EUR",
    payment_status: "pending",
    order_status: "pending",
    notes: "",
    items: [],
  });

  // Available products and customers
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  // Load order data
  useEffect(() => {
    if (orderId) {
      loadOrder();
      loadProducts();
      loadCustomers();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await orderService.getOrder(orderId);

      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || "خطأ في تحميل بيانات الطلب");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      setError("خطأ في تحميل بيانات الطلب");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 100 });
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await userService.getUsers({
        limit: 100,
        role: "customer",
      });
      if (response.success) {
        setCustomers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  // Handle form changes
  const handleInputChange = (field, value) => {
    setOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add item to order
  const handleAddItem = () => {
    if (!selectedProduct || selectedQuantity <= 0) {
      setError("يرجى اختيار منتج وكمية صحيحة");
      return;
    }

    const product = products.find((p) => p.id === parseInt(selectedProduct));
    if (!product) {
      setError("المنتج غير موجود");
      return;
    }

    const existingItemIndex = order.items.findIndex(
      (item) => item.product_id === product.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...order.items];
      updatedItems[existingItemIndex].quantity += selectedQuantity;
      updatedItems[existingItemIndex].total_price =
        updatedItems[existingItemIndex].quantity * product.price;

      setOrder((prev) => ({
        ...prev,
        items: updatedItems,
        total_amount: updatedItems.reduce(
          (sum, item) => sum + item.total_price,
          0
        ),
      }));
    } else {
      // Add new item
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: selectedQuantity,
        unit_price: product.price,
        total_price: product.price * selectedQuantity,
      };

      setOrder((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
        total_amount: prev.total_amount + newItem.total_price,
      }));
    }

    setSelectedProduct("");
    setSelectedQuantity(1);
    setError("");
  };

  // Remove item from order
  const handleRemoveItem = (index) => {
    const itemToRemove = order.items[index];
    const updatedItems = order.items.filter((_, i) => i !== index);

    setOrder((prev) => ({
      ...prev,
      items: updatedItems,
      total_amount: prev.total_amount - itemToRemove.total_price,
    }));
  };

  // Update item quantity
  const handleUpdateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    const updatedItems = [...order.items];
    const item = updatedItems[index];
    item.quantity = newQuantity;
    item.total_price = item.unit_price * newQuantity;

    setOrder((prev) => ({
      ...prev,
      items: updatedItems,
      total_amount: updatedItems.reduce(
        (sum, item) => sum + item.total_price,
        0
      ),
    }));
  };

  // Save order
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      // Validate required fields
      if (!order.customer_name || !order.customer_email) {
        setError("يرجى ملء جميع الحقول المطلوبة");
        return;
      }

      if (order.items.length === 0) {
        setError("يرجى إضافة منتج واحد على الأقل");
        return;
      }

      const response = await orderService.updateOrder(orderId, order);

      if (response.success) {
        setSuccess("تم حفظ الطلب بنجاح");
        setTimeout(() => {
          navigate("/orders");
        }, 2000);
      } else {
        setError(response.message || "خطأ في حفظ الطلب");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      setError("خطأ في حفظ الطلب");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete order
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError("");

      const response = await orderService.deleteOrder(orderId);

      if (response.success) {
        setSuccess("تم حذف الطلب بنجاح");
        setTimeout(() => {
          navigate("/orders");
        }, 2000);
      } else {
        setError(response.message || "خطأ في حذف الطلب");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      setError("خطأ في حذف الطلب");
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, isLoading: false });
    }
  };

  // Format amount
  const formatAmount = (amount, currency = "EUR") => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    });
    return formatter.format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل بيانات الطلب..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <EnhancedButton
                onClick={() => navigate("/orders")}
                variant="secondary"
                size="lg"
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                رجوع للطلبات
              </EnhancedButton>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  تحرير الطلب
                </h1>
                <p className="text-gray-600 text-lg">
                  تحرير تفاصيل الطلب #{order.order_number}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <EnhancedButton
                onClick={() =>
                  setDeleteModal({ isOpen: true, isLoading: false })
                }
                variant="danger"
                size="lg"
                icon={<Trash2 className="w-5 h-5" />}
                disabled={isDeleting}
              >
                حذف الطلب
              </EnhancedButton>
              <EnhancedButton
                onClick={handleSave}
                disabled={isSaving}
                variant="primary"
                size="lg"
                icon={
                  isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )
                }
              >
                حفظ التغييرات
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        {/* رسائل النجاح والخطأ */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span className="text-green-800 font-medium">{success}</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold">معلومات العميل</h3>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <EnhancedInput
                  label="اسم العميل"
                  value={order.customer_name}
                  onChange={(e) =>
                    handleInputChange("customer_name", e.target.value)
                  }
                  icon={<User className="w-4 h-4" />}
                  required
                />
                <EnhancedInput
                  label="البريد الإلكتروني"
                  type="email"
                  value={order.customer_email}
                  onChange={(e) =>
                    handleInputChange("customer_email", e.target.value)
                  }
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
                <EnhancedInput
                  label="رقم الهاتف"
                  value={order.customer_phone}
                  onChange={(e) =>
                    handleInputChange("customer_phone", e.target.value)
                  }
                  icon={<Phone className="w-4 h-4" />}
                />
                <EnhancedInput
                  label="عنوان التوصيل"
                  value={order.delivery_address}
                  onChange={(e) =>
                    handleInputChange("delivery_address", e.target.value)
                  }
                  icon={<MapPin className="w-4 h-4" />}
                />
              </CardBody>
            </Card>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  <h3 className="text-lg font-semibold">تفاصيل الطلب</h3>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      حالة الطلب
                    </label>
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleInputChange("order_status", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="pending">معلق</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      حالة الدفع
                    </label>
                    <select
                      value={order.payment_status}
                      onChange={(e) =>
                        handleInputChange("payment_status", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="pending">معلق</option>
                      <option value="paid">مدفوع</option>
                      <option value="failed">فاشل</option>
                      <option value="refunded">مسترد</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العملة
                    </label>
                    <select
                      value={order.currency}
                      onChange={(e) =>
                        handleInputChange("currency", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="EUR">يورو</option>
                      <option value="SYP">ليرة سورية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      إجمالي المبلغ
                    </label>
                    <div className="flex items-center px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                      <Euro className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900">
                        {formatAmount(order.total_amount, order.currency)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    value={order.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أضف ملاحظات للطلب..."
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  <h3 className="text-lg font-semibold">منتجات الطلب</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {order.items.length} منتج
                </span>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {/* Add Item Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">إضافة منتج</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">اختر المنتج</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} -{" "}
                        {formatAmount(product.price, order.currency)}
                      </option>
                    ))}
                  </select>
                  <EnhancedInput
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(parseInt(e.target.value) || 1)
                    }
                    placeholder="الكمية"
                  />
                  <EnhancedButton
                    onClick={handleAddItem}
                    variant="primary"
                    className="w-full"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    إضافة
                  </EnhancedButton>
                </div>
              </div>

              {/* Items List */}
              {order.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد منتجات في الطلب</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          السعر: {formatAmount(item.unit_price, order.currency)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <EnhancedButton
                            onClick={() =>
                              handleUpdateItemQuantity(index, item.quantity - 1)
                            }
                            variant="secondary"
                            size="sm"
                            icon={<Minus className="w-3 h-3" />}
                          />
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <EnhancedButton
                            onClick={() =>
                              handleUpdateItemQuantity(index, item.quantity + 1)
                            }
                            variant="secondary"
                            size="sm"
                            icon={<Plus className="w-3 h-3" />}
                          />
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatAmount(item.total_price, order.currency)}
                          </p>
                        </div>
                        <EnhancedButton
                          onClick={() => handleRemoveItem(index)}
                          variant="danger"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Total */}
              {order.items.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">
                      الإجمالي:
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatAmount(order.total_amount, order.currency)}
                    </span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, isLoading: false })}
          onConfirm={handleDelete}
          isLoading={deleteModal.isLoading}
          title="حذف الطلب"
          message={`هل أنت متأكد من حذف الطلب رقم #${order.order_number}؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </div>
    </div>
  );
};

export default EditOrderPage;
