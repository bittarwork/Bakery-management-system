import { useState, useEffect } from "react";
import {
  X,
  Save,
  AlertCircle,
  Package,
  DollarSign,
  FileText,
  Hash,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";
import { productService } from "../../services/productService";
import { useToastContext } from "../common";

const ProductForm = ({ product, isOpen, onClose, onSuccess }) => {
  const toast = useToastContext();
  const { createProduct, updateProduct, loading } = useProductStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "",
    price: "",
    cost: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحديث البيانات عند تغيير المنتج
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        unit: product.unit || "",
        price: product.price?.toString() || "",
        cost: product.cost?.toString() || "",
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
    } else {
      resetForm();
    }
  }, [product]);

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      unit: "",
      price: "",
      cost: "",
      is_active: true,
    });
    setErrors({});
  };

  // تحديث قيمة الحقل
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // مسح الخطأ عند التعديل
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const validation = productService.validateProduct({
      ...formData,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
    });

    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach((error) => {
        // تحديد الحقل المسؤول عن الخطأ
        if (error.includes("اسم المنتج")) {
          newErrors.name = error;
        } else if (error.includes("وحدة القياس")) {
          newErrors.unit = error;
        } else if (error.includes("السعر")) {
          newErrors.price = error;
        } else if (error.includes("التكلفة")) {
          newErrors.cost = error;
        } else {
          newErrors.general = error;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
      };

      let result;
      if (product) {
        // تحديث منتج موجود
        result = await updateProduct(product.id, submitData);
      } else {
        // إنشاء منتج جديد
        result = await createProduct(submitData);
      }

      console.log("Product form result:", result);

      if (result && result.success) {
        toast.success(result.message || "تم حفظ المنتج بنجاح");
        resetForm();
        if (onSuccess) {
          onSuccess(result.data);
        }
        onClose();
      } else {
        console.log("Product form error:", result);

        if (result && result.errors && result.errors.length > 0) {
          const newErrors = {};
          result.errors.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.msg;
            } else {
              newErrors.general = error.msg || error;
            }
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: result?.message || "حدث خطأ غير متوقع" });
        }
        toast.error(result?.message || "حدث خطأ في حفظ المنتج");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ general: "حدث خطأ غير متوقع" });
      toast.error("حدث خطأ في الإرسال");
    } finally {
      setIsSubmitting(false);
    }
  };

  // حساب الهامش أثناء الكتابة
  const margin = productService.calculateMargin(
    parseFloat(formData.price) || 0,
    parseFloat(formData.cost) || 0
  );
  const marginPercentage = productService.calculateMarginPercentage(
    parseFloat(formData.price) || 0,
    parseFloat(formData.cost) || 0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-500 ml-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* خطأ عام */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                <span className="text-red-700">{errors.general}</span>
              </div>
            </div>
          )}

          {/* اسم المنتج */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="h-4 w-4 inline ml-1" />
              اسم المنتج *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="أدخل اسم المنتج"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* وصف المنتج */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline ml-1" />
              وصف المنتج
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="أدخل وصف المنتج (اختياري)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* وحدة القياس */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 inline ml-1" />
              وحدة القياس *
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.unit ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="مثال: قطعة، كيلو، علبة"
              required
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
            )}
          </div>

          {/* السعر والتكلفة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* السعر */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline ml-1" />
                السعر *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
                required
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* التكلفة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline ml-1" />
                التكلفة
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cost ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* عرض الهامش الربحي */}
          {formData.price && formData.cost && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                الهامش الربحي
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-blue-700">المبلغ: </span>
                  <span className="font-medium text-blue-900">
                    {productService.formatPrice(margin)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-blue-700">النسبة: </span>
                  <span className="font-medium text-blue-900">
                    {marginPercentage}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* حالة المنتج */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm font-medium text-gray-700">
                منتج نشط
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              المنتجات النشطة فقط ستظهر في قوائم الطلبات
            </p>
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 ml-2" />
              {isSubmitting || loading
                ? "جاري الحفظ..."
                : product
                ? "تحديث"
                : "إضافة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
