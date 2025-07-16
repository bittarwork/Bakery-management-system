import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Download,
  RefreshCw,
  Package,
  Store,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Euro,
  DollarSign,
  Gift,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  CreditCard,
  Receipt,
  Tag,
  Star,
  Heart,
  Award,
  Shield,
  Info,
  AlertTriangle,
  Check,
  X,
  Minus,
  Plus,
  Eye,
  Settings,
  MoreVertical,
  Share,
  Copy,
  ExternalLink,
  Activity,
  History,
  Truck,
  Building,
  Globe,
  Calculator,
  TrendingUp,
  Target,
  Zap,
  Bell,
  Mail,
  MessageSquare,
  Save,
  RotateCcw,
  Archive,
  Bookmark,
  Flag,
  Star as StarIcon,
  Heart as HeartIcon,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrder(id);

      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error("Order not found");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
      navigate("/orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      setIsUpdating(true);
      await orderService.updateOrderStatus(id, selectedStatus);
      toast.success("Order status updated successfully");
      setShowStatusModal(false);
      fetchOrder();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async () => {
    if (!selectedPaymentStatus) return;

    try {
      setIsUpdating(true);
      await orderService.updatePaymentStatus(id, selectedPaymentStatus);
      toast.success("Payment status updated successfully");
      setShowPaymentModal(false);
      fetchOrder();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await orderService.deleteOrder(id);
      toast.success("Order deleted successfully");
      navigate("/orders");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Currency formatter
  const formatCurrency = (amount, currency = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <FileText className="w-5 h-5" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5" />;
      case "in_progress":
        return <ClockIcon className="w-5 h-5" />;
      case "delivered":
        return <Package className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  // Get payment status icon
  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "partial":
        return <AlertTriangle className="w-5 h-5" />;
      case "paid":
        return <CheckCircle className="w-5 h-5" />;
      case "overdue":
        return <XCircle className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  // Status badge component
  const StatusBadge = ({ status, type = "order" }) => {
    const statusConfig =
      type === "order"
        ? orderService.getStatusOptions()
        : orderService.getPaymentStatusOptions();

    const config = statusConfig.find((s) => s.value === status);

    if (!config) return null;

    const colorClasses = {
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
          colorClasses[config.color]
        }`}
      >
        {type === "order"
          ? getStatusIcon(status)
          : getPaymentStatusIcon(status)}
        <span className="ml-2">{config.label}</span>
      </div>
    );
  };

  // Status update modal
  const StatusUpdateModal = ({
    show,
    onClose,
    title,
    currentStatus,
    statusOptions,
    onUpdate,
    selectedStatus,
    setSelectedStatus,
  }) => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        show ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <StatusBadge
                status={currentStatus}
                type={title.includes("Payment") ? "payment" : "order"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select new status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={!selectedStatus || isUpdating}>
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Status
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          <Link to="/orders" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600 mt-1">
              Created on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => fetchOrder()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/orders/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteOrder}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <StatusBadge status={order.status} type="order" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStatus(order.status);
                  setShowStatusModal(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <StatusBadge status={order.payment_status} type="payment" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPaymentStatus(order.payment_status);
                  setShowPaymentModal(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount (EUR)</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(order.final_amount_eur, "EUR")}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount (SYP)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(order.final_amount_syp, "SYP")}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Order Information</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order Number
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {order.order_number}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order Date
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(order.order_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Delivery Date
                    </label>
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {order.delivery_date
                          ? new Date(order.delivery_date).toLocaleDateString()
                          : "Not set"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Store
                    </label>
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {order.store_name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {order.currency}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Exchange Rate
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        1 EUR = {order.exchange_rate} SYP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">{order.notes}</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Order Items</h2>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-right py-3 px-4">Quantity</th>
                      <th className="text-right py-3 px-4">Unit Price</th>
                      <th className="text-right py-3 px-4">Discount</th>
                      <th className="text-right py-3 px-4">Gift</th>
                      <th className="text-right py-3 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.product_name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium">{item.quantity}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium">
                            {order.currency === "EUR" ? "€" : "ل.س"}
                            {item.unit_price?.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.discount_amount > 0 ? (
                            <span className="text-red-600 font-medium">
                              -{order.currency === "EUR" ? "€" : "ل.س"}
                              {item.discount_amount?.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.gift_quantity > 0 ? (
                            <div className="flex items-center justify-end space-x-1">
                              <Gift className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                {item.gift_quantity}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-green-600">
                            {order.currency === "EUR" ? "€" : "ل.س"}
                            {item.final_price?.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {order.currency === "EUR" ? "€" : "ل.س"}
                    {order.total_amount_eur?.toFixed(2)}
                  </span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Discount:</span>
                    <span className="font-medium text-red-600">
                      -{order.currency === "EUR" ? "€" : "ل.س"}
                      {order.discount_amount?.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Final Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      {order.currency === "EUR" ? "€" : "ل.س"}
                      {order.final_amount_eur?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Currency conversion */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 text-center">
                    <p>Exchange Rate: 1 EUR = {order.exchange_rate} SYP</p>
                    <p className="mt-1">
                      <span className="text-purple-600 font-medium">
                        Total SYP:{" "}
                        {formatCurrency(order.final_amount_syp, "SYP")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Gift Summary */}
          {order.items?.some((item) => item.gift_quantity > 0) && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-green-600">
                  Gift Items
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {order.items
                    ?.filter((item) => item.gift_quantity > 0)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Gift className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">
                              {item.product_name}
                            </p>
                            {item.gift_reason && (
                              <p className="text-sm text-green-600">
                                {item.gift_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-green-600">
                          {item.gift_quantity}
                        </span>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedStatus(order.status);
                    setShowStatusModal(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Order Status
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedPaymentStatus(order.payment_status);
                    setShowPaymentModal(true);
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Status
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/orders/${id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Order
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <StatusUpdateModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Order Status"
        currentStatus={order.status}
        statusOptions={orderService.getStatusOptions()}
        onUpdate={handleStatusUpdate}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      <StatusUpdateModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Update Payment Status"
        currentStatus={order.payment_status}
        statusOptions={orderService.getPaymentStatusOptions()}
        onUpdate={handlePaymentStatusUpdate}
        selectedStatus={selectedPaymentStatus}
        setSelectedStatus={setSelectedPaymentStatus}
      />
    </div>
  );
};

export default OrderDetailsPage;
