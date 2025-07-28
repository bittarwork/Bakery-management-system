import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  PencilIcon,
  TrashIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import orderService from "../../services/orderService.js";
import userService from "../../services/userService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import BackButton from "../../components/ui/BackButton";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distributors, setDistributors] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Load order data
  useEffect(() => {
    if (id) {
      loadOrder();
      loadDistributors();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(id);
      // Handle both old and new response formats
      const orderData = response.data || response;
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error loading order";
      toast.error(errorMessage);
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await userService.getUsers({ role: "distributor" });
      // Handle both old and new response formats
      const usersData = response.data || response;
      setDistributors(usersData.users || usersData || []);
    } catch (error) {
      console.error("Error loading distributors:", error);
    }
  };

  // Handle status updates
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(id, newStatus);
      toast.success("Order status updated successfully");
      loadOrder();
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error updating status";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus) => {
    try {
      setUpdating(true);
      await orderService.updatePaymentStatus(id, newPaymentStatus);
      toast.success("Payment status updated successfully");
      loadOrder();
    } catch (error) {
      console.error("Error updating payment status:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error updating payment status";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Handle distributor assignment
  const handleDistributorAssignment = async (distributorId) => {
    try {
      setUpdating(true);
      if (distributorId) {
        await orderService.assignDistributor(id, distributorId);
        toast.success("Distributor assigned successfully");
      } else {
        await orderService.unassignDistributor(id);
        toast.success("Distributor unassigned successfully");
      }
      loadOrder();
    } catch (error) {
      console.error("Error updating distributor:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error updating distributor";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await orderService.deleteOrder(id);
      toast.success("Order deleted successfully");
      navigate("/orders");
    } catch (error) {
      console.error("Error deleting order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error deleting order";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Order not found
        </h3>
        <p className="text-gray-500 mb-4">
          The order you're looking for doesn't exist.
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {order.order_number}
            </h1>
            <p className="text-gray-600 mt-1">Order details and management</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {orderService.canEditOrder(order) && (
            <Link
              to={`/orders/${order.id}/edit`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
          )}
          {orderService.canDeleteOrder(order) && (
            <button
              onClick={handleDeleteOrder}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Order Status
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updating}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${orderService.getStatusColor(
                      order.status
                    )} border-none`}
                  >
                    {orderService.getStatusOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={order.payment_status}
                    onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                    disabled={updating}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${orderService.getPaymentStatusColor(
                      order.payment_status
                    )} border-none`}
                  >
                    {orderService.getPaymentStatusOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || item.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Unit:{" "}
                            {item.product?.unit || item.product_unit || "piece"}
                          </div>
                          {item.notes && (
                            <div className="text-sm text-gray-500 italic">
                              Note: {item.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {order.currency === "EUR"
                          ? orderService.formatAmount(
                              item.unit_price_eur,
                              "EUR"
                            )
                          : orderService.formatAmount(
                              item.unit_price_syp,
                              "SYP"
                            )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {order.currency === "EUR"
                          ? orderService.formatAmount(
                              item.total_price_eur,
                              "EUR"
                            )
                          : orderService.formatAmount(
                              item.total_price_syp,
                              "SYP"
                            )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Order Total */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {order.currency === "EUR"
                    ? orderService.formatAmount(order.final_amount_eur, "EUR")
                    : orderService.formatAmount(order.final_amount_syp, "SYP")}
                </span>
              </div>
            </div>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Order Notes
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Order Summary
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Number:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.order_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Currency:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Items Count:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.items?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created By:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.creator?.full_name || order.created_by_name}
                </span>
              </div>
            </div>
          </Card>

          {/* Store Information */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                Store Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {order.store?.name || order.store_name}
                </h3>
                {order.store?.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    {order.store.location}
                  </p>
                )}
                {order.store?.phone && (
                  <p className="text-sm text-gray-600">{order.store.phone}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Distributor Assignment */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Distributor Assignment
              </h2>
            </div>
            <div className="p-6">
              {order.assigned_distributor_id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {order.assignedDistributor?.full_name}
                      </h3>
                      {order.assignedDistributor?.phone && (
                        <p className="text-sm text-gray-600">
                          {order.assignedDistributor.phone}
                        </p>
                      )}
                    </div>
                    <Badge color="green">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Assigned
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleDistributorAssignment(null)}
                    disabled={updating}
                    className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                  >
                    Unassign Distributor
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-gray-500">
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm">No distributor assigned</span>
                  </div>
                  <select
                    onChange={(e) =>
                      e.target.value &&
                      handleDistributorAssignment(parseInt(e.target.value))
                    }
                    disabled={updating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Distributor</option>
                    {distributors.map((distributor) => (
                      <option key={distributor.id} value={distributor.id}>
                        {distributor.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>

          {/* Order Dates */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Important Dates
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm text-gray-600">Order Date:</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(order.order_date).toLocaleDateString()}
                </p>
              </div>
              {order.delivery_date && (
                <div>
                  <span className="text-sm text-gray-600">Delivery Date:</span>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(order.delivery_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-600">Created At:</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Updated:</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(order.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
