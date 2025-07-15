import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Globe,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Package,
  Euro,
  AlertCircle,
  Navigation,
  Building2,
  Clock,
  Star,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StoreMap from "../../components/ui/StoreMap";
import storeService from "../../services/storeService";
import { toast } from "react-hot-toast";

const StoreDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Load store data
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setIsLoading(true);

        // Load store details
        const storeResponse = await storeService.getStore(id);
        setStore(storeResponse.data);

        // Load store statistics
        try {
          const statsResponse = await storeService.getStoreStatistics(id);
          setStatistics(statsResponse.data);
        } catch (error) {
          console.warn("Could not load store statistics:", error);
        }

        // Load recent orders
        try {
          const ordersResponse = await storeService.getStoreOrders(id, {
            limit: 5,
          });
          setRecentOrders(ordersResponse.data || []);
        } catch (error) {
          console.warn("Could not load recent orders:", error);
        }

        // Load recent payments
        try {
          const paymentsResponse = await storeService.getStorePayments(id, {
            limit: 5,
          });
          setRecentPayments(paymentsResponse.data || []);
        } catch (error) {
          console.warn("Could not load recent payments:", error);
        }
      } catch (error) {
        console.error("Error loading store data:", error);
        toast.error("Failed to load store data");
        navigate("/stores");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadStoreData();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await storeService.deleteStore(id);
      toast.success("Store deleted successfully");
      navigate("/stores");
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("Failed to delete store");
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusIcon = (status) => {
    return status === "active" ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Store Not Found
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The store you're looking for doesn't exist or may have been removed.
          </p>
          <Link to="/stores">
            <Button variant="primary" className="px-8 py-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stores
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/stores"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Building2 className="w-8 h-8 mr-3 text-blue-600" />
                  {store.name}
                </h1>
                <p className="text-gray-500 mt-1">Store ID: #{store.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                {getStatusIcon(store.status)}
                <span
                  className={`text-sm font-medium ${
                    store.status === "active"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {store.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <Link to={`/stores/edit/${id}`}>
                <Button
                  variant="outline"
                  icon={<Edit className="w-4 h-4" />}
                  className="bg-white hover:bg-gray-50"
                >
                  Edit Store
                </Button>
              </Link>
              <Button
                variant="outline"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Store
                </h3>
                <p className="text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Are you sure you want to delete <strong>"{store.name}"</strong>?
              This will permanently remove all associated data including orders,
              payments, and statistics.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
                className="px-6"
              >
                Delete Store
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Store Info & Orders */}
          <div className="xl:col-span-3 space-y-8">
            {/* Store Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Globe className="w-6 h-6 mr-3" />
                    Store Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          Basic Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Store Name
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Region
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.region
                                ? store.region.charAt(0).toUpperCase() +
                                  store.region.slice(1)
                                : "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Payment Method
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.payment_method
                                ? store.payment_method.charAt(0).toUpperCase() +
                                  store.payment_method.slice(1)
                                : "Cash"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Credit Limit
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.credit_limit || store.credit_limit_eur
                                ? `€${parseFloat(
                                    store.credit_limit || store.credit_limit_eur
                                  ).toLocaleString()}`
                                : "No limit"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Contact Person
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.contact_person || "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-sm text-gray-600">Phone</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {store.phone || "Not specified"}
                              </span>
                              {store.phone && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(store.phone, "Phone")
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {copiedField === "Phone" ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-sm text-gray-600">Email</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {store.email || "Not specified"}
                              </span>
                              {store.email && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(store.email, "Email")
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {copiedField === "Email" ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </h3>
                    <p className="text-sm text-gray-900">
                      {store.address || "No address available"}
                    </p>
                    {store.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Notes
                        </h4>
                        <p className="text-sm text-gray-600">{store.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recent Orders Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Package className="w-6 h-6 mr-3" />
                    Recent Orders
                  </h2>
                </div>
                <div className="p-6">
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-100 rounded-full p-2">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  Order #{order.id}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                €
                                {parseFloat(
                                  order.total_amount || 0
                                ).toLocaleString()}
                              </p>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Orders Yet
                      </h3>
                      <p className="text-gray-600">
                        This store hasn't received any orders yet.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Stats, Payments & Location */}
          <div className="space-y-8">
            {/* Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3" />
                    Statistics
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics?.total_orders || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="bg-green-100 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Euro className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        €{(statistics?.total_revenue || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="bg-yellow-100 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        €
                        {statistics?.average_order_value
                          ? parseFloat(
                              statistics.average_order_value
                            ).toLocaleString()
                          : "0.00"}
                      </p>
                      <p className="text-sm text-gray-600">Avg. Order</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="bg-indigo-100 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics?.monthly_orders || 0}
                      </p>
                      <p className="text-sm text-gray-600">This Month</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recent Payments Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <CreditCard className="w-6 h-6 mr-3" />
                    Recent Payments
                  </h2>
                </div>
                <div className="p-6">
                  {recentPayments.length > 0 ? (
                    <div className="space-y-4">
                      {recentPayments.map((payment, index) => (
                        <motion.div
                          key={payment.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 rounded-full p-2">
                                <CreditCard className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  Payment #{payment.id}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(
                                    payment.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                €
                                {parseFloat(
                                  payment.amount || 0
                                ).toLocaleString()}
                              </p>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                                  payment.status
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm">
                        No payment history
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Location Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <MapPin className="w-6 h-6 mr-3" />
                    Location
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {/* Address Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Store Address
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {store.address || "No address available"}
                        </p>
                        {store.latitude && store.longitude && (
                          <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                            <span className="font-medium">Coordinates:</span>{" "}
                            {parseFloat(store.latitude).toFixed(6)},{" "}
                            {parseFloat(store.longitude).toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Map Display */}
                  {store.latitude && store.longitude ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Location on Map
                        </h3>
                        <button
                          onClick={() => {
                            const url = `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
                            window.open(url, "_blank");
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Maps</span>
                        </button>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <StoreMap
                          stores={[store]}
                          height="250px"
                          showControls={true}
                          interactive={true}
                          center={{
                            lat: parseFloat(store.latitude),
                            lng: parseFloat(store.longitude),
                          }}
                          zoom={15}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 mb-2 font-medium">
                          No location data
                        </p>
                        <p className="text-xs text-gray-500">
                          Add coordinates to display map
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location Actions */}
                  {store.latitude && store.longitude && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
                          window.open(url, "_blank");
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        <span className="font-medium">Get Directions</span>
                      </button>
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            store.address || store.name
                          )}`;
                          window.open(url, "_blank");
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Search Address</span>
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsPage;
