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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Store Not Found
        </h3>
        <p className="text-gray-600 mb-4">
          The store you're looking for doesn't exist.
        </p>
        <Link to="/stores">
          <Button variant="primary">Back to Stores</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link to="/stores" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              store.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {store.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex space-x-3">
          <Link to={`/stores/edit/${id}`}>
            <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
              Edit Store
            </Button>
          </Link>
          <Button
            variant="outline"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-700"
          >
            Delete Store
          </Button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Delete Store
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{store.name}"? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
              >
                Delete Store
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Store Information
              </h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Store Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">
                    {store.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Store ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{store.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        store.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {store.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Region</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {store.region
                      ? store.region.charAt(0).toUpperCase() +
                        store.region.slice(1)
                      : "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Contact Person
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {store.contact_person || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {store.phone || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {store.email || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Method
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {store.payment_method
                      ? store.payment_method.charAt(0).toUpperCase() +
                        store.payment_method.slice(1)
                      : "Cash"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Credit Limit
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {store.credit_limit
                      ? `€${parseFloat(store.credit_limit).toLocaleString()}`
                      : "No limit"}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {store.address || "Not specified"}
                  </dd>
                </div>
                {store.notes && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {store.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Recent Orders
              </h2>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          €
                          {parseFloat(order.total_amount || 0).toLocaleString()}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent orders found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Store Stats */}
        <div className="space-y-6">
          <Card>
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Store Statistics
              </h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Total Orders
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {statistics?.total_orders || 0}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Euro className="w-4 h-4 mr-2" />
                  Total Revenue
                </h3>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  €{(statistics?.total_revenue || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Average Order Value
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  €
                  {statistics?.average_order_value
                    ? parseFloat(
                        statistics.average_order_value
                      ).toLocaleString()
                    : "0.00"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  This Month Orders
                </h3>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {statistics?.monthly_orders || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Recent Payments
              </h2>
            </div>
            <div className="card-body">
              {recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Payment #{payment.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          €{parseFloat(payment.amount || 0).toLocaleString()}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment history available</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Store Location
              </h2>
            </div>
            <div className="card-body">
              {store.latitude && store.longitude ? (
                <StoreMap
                  stores={[store]}
                  height="300px"
                  showControls={false}
                  interactive={false}
                  center={{
                    lat: parseFloat(store.latitude),
                    lng: parseFloat(store.longitude),
                  }}
                  zoom={15}
                />
              ) : (
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">No location data available</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsPage;
