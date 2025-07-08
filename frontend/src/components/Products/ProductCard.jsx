import { useState } from "react";
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";
import { productService } from "../../services/productService";
import { useToastContext } from "../common";

const ProductCard = ({ product, onEdit, onView }) => {
  const toast = useToastContext();
  const { toggleProductStatus, deleteProduct } = useProductStore();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // حساب الهامش الربحي
  const margin = productService.calculateMargin(
    product.price,
    product.cost || 0
  );
  const marginPercentage = productService.calculateMarginPercentage(
    product.price,
    product.cost || 0
  );

  // تغيير حالة المنتج
  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const result = await toggleProductStatus(product.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("حدث خطأ في تغيير حالة المنتج");
    } finally {
      setIsToggling(false);
    }
  };

  // حذف المنتج
  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف منتج "${product.name}"؟`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteProduct(product.id);
      if (result.success) {
        toast.success("تم حذف المنتج بنجاح");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("حدث خطأ في حذف المنتج");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-r-4 transition-all duration-200 hover:shadow-lg ${
        product.is_active
          ? "border-green-500 hover:border-green-600"
          : "border-gray-400 opacity-75"
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Package
              className={`h-8 w-8 ml-3 ${
                product.is_active ? "text-green-500" : "text-gray-400"
              }`}
            />
            <div>
              <h3
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => onView && onView(product)}
              >
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">{product.unit}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {product.is_active ? "نشط" : "غير نشط"}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <DollarSign className="h-4 w-4 text-blue-500 ml-1" />
              <span className="text-xs text-blue-600 font-medium">السعر</span>
            </div>
            <p className="text-lg font-bold text-blue-700">
              {productService.formatPrice(product.price)}
            </p>
          </div>

          {product.cost > 0 && (
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <TrendingUp className="h-4 w-4 text-orange-500 ml-1" />
                <span className="text-xs text-orange-600 font-medium">
                  الهامش
                </span>
              </div>
              <p className="text-lg font-bold text-orange-700">
                {productService.formatPrice(margin)}
              </p>
              <p className="text-xs text-orange-600">({marginPercentage}%)</p>
            </div>
          )}
        </div>

        {/* Cost (if available) */}
        {product.cost > 0 && (
          <div className="mb-4">
            <span className="text-xs text-gray-500">التكلفة: </span>
            <span className="text-sm font-medium text-gray-700">
              {productService.formatPrice(product.cost)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={() => onEdit && onEdit(product)}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="تعديل المنتج"
            >
              <Edit className="h-4 w-4 ml-1" />
              تعديل
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="حذف المنتج"
            >
              <Trash2 className="h-4 w-4 ml-1" />
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </button>
          </div>

          {/* Toggle Status */}
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
              product.is_active
                ? "text-orange-600 hover:bg-orange-50"
                : "text-green-600 hover:bg-green-50"
            }`}
            title={product.is_active ? "إلغاء تفعيل المنتج" : "تفعيل المنتج"}
          >
            {product.is_active ? (
              <ToggleRight className="h-4 w-4 ml-1" />
            ) : (
              <ToggleLeft className="h-4 w-4 ml-1" />
            )}
            {isToggling
              ? "جاري التحديث..."
              : product.is_active
              ? "إلغاء تفعيل"
              : "تفعيل"}
          </button>
        </div>

        {/* Timestamps */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-400">
            <span>
              تم الإنشاء:{" "}
              {new Date(product.created_at).toLocaleDateString("en-GB")}
            </span>
            <span>
              آخر تحديث:{" "}
              {new Date(product.updated_at).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
