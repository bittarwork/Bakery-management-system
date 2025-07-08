import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Package,
  DollarSign,
  Clock,
  User,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Gift,
  FileText,
  TrendingUp,
  Truck,
  CreditCard,
  AlertTriangle,
  Check,
  X,
  Loader,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatStatus,
  getLocalizedText,
} from "../../utils/formatters";
import { usePreferences } from "../../contexts/PreferencesContext";
import {
  getOrderStatusOptions,
  getPaymentStatusOptions,
} from "../../services/ordersAPI.js";

const OrderCard = ({
  order,
  onEdit,
  onView,
  onStatusUpdate,
  onPaymentStatusUpdate,
  showActions = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { preferences } = usePreferences();

  const statusOptions = getOrderStatusOptions();
  const paymentStatusOptions = getPaymentStatusOptions();

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((option) => option.value === status) || {
        label: formatStatus(status),
        color: "gray",
        icon: AlertCircle,
      }
    );
  };

  const getPaymentStatusInfo = (status) => {
    return (
      paymentStatusOptions.find((option) => option.value === status) || {
        label: formatStatus(status),
        color: "gray",
        icon: AlertCircle,
      }
    );
  };

  const handleStatusUpdate = async (newStatus) => {
    if (onStatusUpdate && newStatus !== order.status) {
      setIsLoading(true);
      try {
        await onStatusUpdate(order.id, newStatus);
      } catch (error) {
        console.error("Error updating status:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus) => {
    if (onPaymentStatusUpdate && newPaymentStatus !== order.payment_status) {
      setIsLoading(true);
      try {
        await onPaymentStatusUpdate(order.id, newPaymentStatus);
      } catch (error) {
        console.error("Error updating payment status:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusColor = (color) => {
    const colors = {
      gray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
      blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
      yellow:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
      green:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
      red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
      purple:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
      orange:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
    };
    return colors[color] || colors.gray;
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: AlertCircle,
      confirmed: CheckCircle,
      in_progress: Clock,
      delivered: Truck,
      cancelled: XCircle,
    };
    return icons[status] || AlertCircle;
  };

  const getPaymentIcon = (status) => {
    const icons = {
      pending: Clock,
      paid: CheckCircle,
      partial: AlertTriangle,
      failed: XCircle,
    };
    return icons[status] || Clock;
  };

  const statusInfo = getStatusInfo(order.status);
  const paymentStatusInfo = getPaymentStatusInfo(order.payment_status);
  const StatusIcon = getStatusIcon(order.status);
  const PaymentIcon = getPaymentIcon(order.payment_status);

  const isOverdue =
    order.delivery_date &&
    new Date(order.delivery_date) < new Date() &&
    order.status !== "delivered";
  const hasGifts = order.items?.some((item) => item.gift_quantity > 0);
  const totalQuantity =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const getNextStatusAction = () => {
    const language = preferences?.general?.language || "ar";

    const actions = {
      ar: {
        draft: {
          status: "confirmed",
          label: "تأكيد الطلب",
          color: "blue",
          icon: CheckCircle,
        },
        confirmed: {
          status: "in_progress",
          label: "بدء التنفيذ",
          color: "yellow",
          icon: Clock,
        },
        in_progress: {
          status: "delivered",
          label: "تم التسليم",
          color: "green",
          icon: Truck,
        },
      },
      en: {
        draft: {
          status: "confirmed",
          label: "Confirm Order",
          color: "blue",
          icon: CheckCircle,
        },
        confirmed: {
          status: "in_progress",
          label: "Start Processing",
          color: "yellow",
          icon: Clock,
        },
        in_progress: {
          status: "delivered",
          label: "Mark Delivered",
          color: "green",
          icon: Truck,
        },
      },
    };

    return actions[language]?.[order.status] || null;
  };

  const nextAction = getNextStatusAction();

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${
        isOverdue ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getLocalizedText("order")} #{order.order_number}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.store?.name || getLocalizedText("store_name")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                statusInfo.color
              )}`}
            >
              <StatusIcon className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
              {statusInfo.label}
            </span>

            {/* Payment Status Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                paymentStatusInfo.color
              )}`}
            >
              <PaymentIcon className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
              {paymentStatusInfo.label}
            </span>

            {/* Overdue Indicator */}
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <AlertTriangle className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                {getLocalizedText("overdue", "متأخر")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Order Date */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            <span className="font-medium mr-1 rtl:mr-0 rtl:ml-1">
              {getLocalizedText("order_date")}:
            </span>
            <span>{formatDate(order.order_date)}</span>
          </div>

          {/* Delivery Date */}
          {order.delivery_date && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Truck className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="font-medium mr-1 rtl:mr-0 rtl:ml-1">
                {getLocalizedText("delivery_date")}:
              </span>
              <span>{formatDate(order.delivery_date)}</span>
            </div>
          )}

          {/* Total Amount */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            <span className="font-medium mr-1 rtl:mr-0 rtl:ml-1">
              {getLocalizedText("final_amount")}:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(order.final_amount)}
            </span>
          </div>

          {/* Items Count */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Package className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            <span className="font-medium mr-1 rtl:mr-0 rtl:ml-1">
              {getLocalizedText("items")}:
            </span>
            <span>{totalQuantity}</span>
          </div>

          {/* Store Phone */}
          {order.store?.phone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="font-medium mr-1 rtl:mr-0 rtl:ml-1">
                {getLocalizedText("phone", "الهاتف")}:
              </span>
              <span>{order.store.phone}</span>
            </div>
          )}

          {/* Gifts Indicator */}
          {hasGifts && (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <Gift className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="font-medium">{getLocalizedText("gifts")}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-start">
              <FileText className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 mt-0.5 text-gray-500 dark:text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1 rtl:mr-0 rtl:ml-1">
                  {getLocalizedText("notes")}:
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {order.notes}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Items Section */}
        {order.items && order.items.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span>
                {getLocalizedText("items")} ({order.items.length})
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product?.name ||
                          `${getLocalizedText("product", "منتج")} ${index + 1}`}
                      </span>
                      {item.gift_quantity > 0 && (
                        <span className="ml-2 rtl:ml-0 rtl:mr-2 text-xs text-green-600 dark:text-green-400">
                          (+{item.gift_quantity}{" "}
                          {getLocalizedText("gift", "هدية")})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        {getLocalizedText("quantity")}: {item.quantity}
                      </span>
                      <span>{formatCurrency(item.final_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* Quick Status Update */}
              {nextAction && (
                <button
                  onClick={() => handleStatusUpdate(nextAction.status)}
                  disabled={isLoading}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    nextAction.color === "blue"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                      : nextAction.color === "yellow"
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                      : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                  }`}
                >
                  {isLoading ? (
                    <Loader className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1 animate-spin" />
                  ) : (
                    <nextAction.icon className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                  )}
                  {nextAction.label}
                </button>
              )}

              {/* Payment Status Update */}
              {order.payment_status === "pending" && (
                <button
                  onClick={() => handlePaymentStatusUpdate("paid")}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  <CreditCard className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                  {getLocalizedText("mark_paid", "تم الدفع")}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              {/* View Button */}
              {onView && (
                <button
                  onClick={() => onView(order)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                  title={getLocalizedText("view")}
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}

              {/* Edit Button */}
              {onEdit && (
                <button
                  onClick={() => onEdit(order)}
                  className="p-1.5 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded transition-colors"
                  title={getLocalizedText("edit")}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
