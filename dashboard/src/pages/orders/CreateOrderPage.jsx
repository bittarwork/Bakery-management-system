import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  ShoppingCart,
  Euro,
  Calendar,
  Package,
  Store,
  User,
  Clock,
  AlertTriangle,
  FileText,
  CreditCard,
  Truck,
  Save,
  ArrowLeft,
  Building,
  Phone,
  MapPin,
  DollarSign,
  Calculator,
} from "lucide-react";
import { toast } from "react-hot-toast";
import orderService from "../../services/orderService.js";
import storeService from "../../services/storeService";
import productService from "../../services/productService";
import userService from "../../services/userService";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const CreateOrderPage = () => {
  const navigate = useNavigate();

  // Form state with enhanced fields
  const [formData, setFormData] = useState({
    store_id: "",
    distributor_id: "",
    currency: "EUR", // Always EUR
    delivery_date: "",
    priority: "normal",
    payment_status: "pending",
    payment_method: "",
    notes: "",
    special_instructions: "",
    items: [],
  });

  // Loading and data states
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDistributors, setLoadingDistributors] = useState(true);

  // Selected store details for display
  const [selectedStore, setSelectedStore] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchStores(),
      fetchProducts(),
      fetchDistributors()
    ]);
  };

  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const response = await storeService.getStores({ status: "active" });
      const storesData = response.data || response;
      setStores(storesData.stores || storesData || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("خطأ في تحميل المتاجر");
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getProducts({ status: "active" });
      const productsData = response.data || response;
      setProducts(productsData.products || productsData || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("خطأ في تحميل المنتجات");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchDistributors = async () => {
    try {
      setLoadingDistributors(true);
      const response = await userService.getUsers({ role: "distributor", status: "active" });
      const usersData = response.data || response;
      setDistributors(usersData.users || usersData || []);
    } catch (error) {
      console.error("Error fetching distributors:", error);
      toast.error("خطأ في تحميل الموزعين");
    } finally {
      setLoadingDistributors(false);
    }
  };

  // Handle store selection
  const handleStoreChange = (storeId) => {
    const store = stores.find(s => s.id === parseInt(storeId));
    setSelectedStore(store);
    setFormData(prev => ({ ...prev, store_id: storeId }));
  };

  // Add new item to order
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      product_id: "",
      quantity: 1,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Remove item from order
  const removeItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  // Update item data
  const updateItem = (itemId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Get product by ID
  const getProduct = (productId) => {
    return products.find((product) => product.id === parseInt(productId));
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    const product = getProduct(item.product_id);
    if (!product) return { eur: 0, syp: 0 };

    const quantity = parseInt(item.quantity) || 0;
    return {
      eur: (parseFloat(product.price_eur) || 0) * quantity,
      syp: (parseFloat(product.price_syp) || 0) * quantity,
    };
  };

  // Calculate order total
  const calculateOrderTotal = () => {
    let totalEur = 0;
    let totalSyp = 0;

    formData.items.forEach((item) => {
      const itemTotal = calculateItemTotal(item);
      totalEur += itemTotal.eur;
      totalSyp += itemTotal.syp;
    });

    return { eur: totalEur, syp: totalSyp };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.store_id) {
      toast.error("يرجى اختيار المتجر");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("يرجى إضافة منتج واحد على الأقل");
      return;
    }

    // Validate all items have products and quantities
    const invalidItems = formData.items.filter(
      (item) =>
        !item.product_id || !item.quantity || parseInt(item.quantity) <= 0
    );

    if (invalidItems.length > 0) {
      toast.error("يرجى ملء جميع تفاصيل المنتجات بكميات صحيحة");
      return;
    }

    try {
      setLoading(true);

      // Prepare order data for API
      const orderData = {
        store_id: parseInt(formData.store_id),
        distributor_id: formData.distributor_id ? parseInt(formData.distributor_id) : null,
        currency: "EUR",
        delivery_date: formData.delivery_date || null,
        priority: formData.priority,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method || null,
        notes: formData.notes,
        special_instructions: formData.special_instructions,
        items: formData.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          notes: item.notes || null,
        })),
      };

      const response = await orderService.createOrder(orderData);
      
      toast.success("تم إنشاء الطلب بنجاح");
      navigate(`/orders/${response.data?.id || response.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "خطأ في إنشاء الطلب";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const orderTotal = calculateOrderTotal();

  if (loadingStores || loadingProducts || loadingDistributors) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <EnhancedButton
                onClick={() => navigate("/orders")}
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                العودة
              </EnhancedButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart className="w-7 h-7 text-blue-600" />
                  إنشاء طلب جديد
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  قم بإضافة تفاصيل الطلب وتعيين الموزع
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EnhancedButton
                type="submit"
                form="orderForm"
                loading={loading}
                variant="primary"
                size="lg"
                icon={<Save className="w-4 h-4" />}
              >
                حفظ الطلب
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="orderForm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Store Selection */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    اختيار المتجر
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المتجر <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.store_id}
                        onChange={(e) => handleStoreChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">اختر المتجر</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedStore && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">تفاصيل المتجر</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{selectedStore.phone || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{selectedStore.address || 'غير محدد'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    تفاصيل الطلب
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ التسليم
                      </label>
                      <EnhancedInput
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                        icon={<Calendar className="w-4 h-4" />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الأولوية
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">منخفضة</option>
                        <option value="normal">عادية</option>
                        <option value="high">عالية</option>
                        <option value="urgent">عاجلة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حالة الدفع
                      </label>
                      <select
                        value={formData.payment_status}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">معلق</option>
                        <option value="paid">مدفوع</option>
                        <option value="partial">دفع جزئي</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        طريقة الدفع
                      </label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">اختر طريقة الدفع</option>
                        <option value="cash">نقداً</option>
                        <option value="credit">آجل</option>
                        <option value="bank_transfer">تحويل بنكي</option>
                        <option value="check">شيك</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظات
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="أضف أي ملاحظات عامة للطلب..."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1 text-orange-500" />
                      تعليمات خاصة للتسليم
                    </label>
                    <textarea
                      value={formData.special_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="تعليمات خاصة للموزع (مواعيد محددة، متطلبات خاصة، إلخ)..."
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Distributor Assignment */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    تعيين الموزع
                  </h2>
                </CardHeader>
                <CardBody>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموزع المختص
                    </label>
                    <select
                      value={formData.distributor_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, distributor_id: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">اختر الموزع (اختياري)</option>
                      {distributors.map((distributor) => (
                        <option key={distributor.id} value={distributor.id}>
                          {distributor.name} - {distributor.phone}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      يمكن تعيين الموزع لاحقاً من خلال إدارة الطلبات
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      منتجات الطلب
                    </h2>
                    <EnhancedButton
                      type="button"
                      onClick={addItem}
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      إضافة منتج
                    </EnhancedButton>
                  </div>
                </CardHeader>
                <CardBody>
                  {formData.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>لم يتم إضافة أي منتجات بعد</p>
                      <p className="text-sm">انقر على "إضافة منتج" لبدء إنشاء الطلب</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.items.map((item, index) => {
                        const product = getProduct(item.product_id);
                        const itemTotal = calculateItemTotal(item);
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                منتج #{index + 1}
                              </h4>
                              <EnhancedButton
                                type="button"
                                onClick={() => removeItem(item.id)}
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                              >
                                حذف
                              </EnhancedButton>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  المنتج <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={item.product_id}
                                  onChange={(e) => updateItem(item.id, "product_id", e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                >
                                  <option value="">اختر المنتج</option>
                                  {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                      {product.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  الكمية <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  المجموع
                                </label>
                                <div className="p-2 bg-white border border-gray-300 rounded-md">
                                  {product && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Euro className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">
                                          €{itemTotal.eur.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-600">
                                          {itemTotal.syp.toLocaleString()} ل.س
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                ملاحظات المنتج
                              </label>
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ملاحظات خاصة بهذا المنتج..."
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-indigo-600" />
                      ملخص الطلب
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {/* Store Info */}
                      {selectedStore && (
                        <div className="pb-4 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2">المتجر المختار</h4>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="font-medium text-blue-900">{selectedStore.name}</p>
                            <p className="text-sm text-blue-700 mt-1">{selectedStore.phone}</p>
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">عدد المنتجات:</span>
                          <span className="font-medium">{formData.items.length}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">إجمالي الكمية:</span>
                          <span className="font-medium">
                            {formData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-900 font-medium">المجموع الكلي:</span>
                          </div>
                          
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Euro className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700">يورو</span>
                              </div>
                              <span className="text-lg font-bold text-green-900">
                                €{orderTotal.eur.toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-700">ليرة سورية</span>
                              </div>
                              <span className="text-sm font-medium text-blue-900">
                                {orderTotal.syp.toLocaleString()} ل.س
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Status */}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">الأولوية:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                formData.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                formData.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                formData.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {formData.priority === 'urgent' && 'عاجلة'}
                                {formData.priority === 'high' && 'عالية'}
                                {formData.priority === 'normal' && 'عادية'}
                                {formData.priority === 'low' && 'منخفضة'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">حالة الدفع:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                formData.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                formData.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {formData.payment_status === 'paid' && 'مدفوع'}
                                {formData.payment_status === 'partial' && 'جزئي'}
                                {formData.payment_status === 'pending' && 'معلق'}
                              </span>
                            </div>

                            {formData.delivery_date && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">تاريخ التسليم:</span>
                                <span className="text-sm font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(formData.delivery_date).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <EnhancedButton
                    type="submit"
                    form="orderForm"
                    loading={loading}
                    variant="primary"
                    size="lg"
                    icon={<Save className="w-4 h-4" />}
                    className="w-full"
                  >
                    حفظ الطلب
                  </EnhancedButton>
                  
                  <EnhancedButton
                    type="button"
                    onClick={() => navigate("/orders")}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    إلغاء
                  </EnhancedButton>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderPage;
