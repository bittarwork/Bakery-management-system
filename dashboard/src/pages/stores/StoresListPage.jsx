import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MapPin,
  Phone,
  Mail,
  Store,
  Eye,
  Edit,
  Trash2,
  Map,
  List,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import StoreMap from "../../components/ui/StoreMap";
import storeService from "../../services/storeService";
import { toast } from "react-hot-toast";

const StoresListPage = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'
  const [filters, setFilters] = useState({
    status: "",
    region: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
  });

  // Load stores data
  const loadStores = async () => {
    try {
      setIsLoading(true);
      const response = await storeService.getStores(filters);

      // Handle the correct response structure from backend
      const storesData = response.data?.stores || response.data || [];
      setStores(storesData);

      // Calculate statistics
      const stats = {
        total: storesData.length || 0,
        active:
          storesData.filter((store) => store.status === "active").length || 0,
        inactive:
          storesData.filter((store) => store.status === "inactive").length || 0,
        totalRevenue:
          storesData.reduce(
            (sum, store) => sum + (parseFloat(store.total_purchases_eur) || 0),
            0
          ) || 0,
      };
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [filters]);

  // Handle store deletion
  const handleDelete = async (storeId) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      try {
        await storeService.deleteStore(storeId);
        toast.success("Store deleted successfully");
        loadStores(); // Reload stores
      } catch (error) {
        console.error("Error deleting store:", error);
        toast.error("Failed to delete store");
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: "",
      region: "",
      search: "",
    });
  };

  const columns = [
    {
      key: "name",
      title: "Store Name",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      title: "Address",
      render: (value) => (
        <div className="flex items-center text-sm text-gray-900">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          {value}
        </div>
      ),
    },
    {
      key: "phone",
      title: "Contact",
      render: (value, row) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <Phone className="w-4 h-4 text-gray-400 mr-2" />
            {value}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "total_purchases_eur",
      title: "Revenue",
      render: (value) => (
        <div className="text-sm font-medium text-gray-900">
          €{(parseFloat(value) || 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: "total_orders",
      title: "Orders",
      render: (value) => (
        <div className="text-sm text-gray-900">{value || 0}</div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Link to={`/stores/${row.id}`}>
            <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <Link to={`/stores/edit/${row.id}`}>
            <button className="p-1 text-green-600 hover:text-green-800 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-600">Manage your bakery store locations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={loadStores}
          >
            Refresh
          </Button>
          <Link to="/stores/create">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Store
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Regions</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="central">Central</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.total}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Stores</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.active}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <Store className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Inactive Stores
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.inactive}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                €{statistics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <Card>
          <DataTable
            data={stores}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No stores found"
          />
        </Card>
      ) : (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Store Locations
            </h3>
            <StoreMap
              stores={stores}
              height="600px"
              showControls={true}
              interactive={false}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default StoresListPage;
