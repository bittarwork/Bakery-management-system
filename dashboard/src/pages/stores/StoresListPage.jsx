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
} from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";

const StoresListPage = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStores([
        {
          id: 1,
          name: "Bakery Central",
          address: "123 Main Street, Downtown",
          phone: "+1 555-0123",
          email: "central@bakery.com",
          status: "active",
          revenue: 12500,
          orders: 45,
        },
        {
          id: 2,
          name: "Sweet Corner",
          address: "456 Oak Avenue, Westside",
          phone: "+1 555-0124",
          email: "sweet@bakery.com",
          status: "active",
          revenue: 8900,
          orders: 32,
        },
        {
          id: 3,
          name: "Fresh Bread Co.",
          address: "789 Pine Road, Eastside",
          phone: "+1 555-0125",
          email: "fresh@bakery.com",
          status: "inactive",
          revenue: 0,
          orders: 0,
        },
        {
          id: 4,
          name: "Artisan Bakery",
          address: "321 Elm Street, Northside",
          phone: "+1 555-0126",
          email: "artisan@bakery.com",
          status: "active",
          revenue: 15600,
          orders: 58,
        },
        {
          id: 5,
          name: "Golden Crust",
          address: "654 Maple Drive, Southside",
          phone: "+1 555-0127",
          email: "golden@bakery.com",
          status: "active",
          revenue: 11200,
          orders: 41,
        },
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
      key: "revenue",
      title: "Revenue",
      render: (value) => (
        <div className="text-sm font-medium text-gray-900">
          €{value.toLocaleString()}
        </div>
      ),
    },
    {
      key: "orders",
      title: "Orders",
      render: (value) => <div className="text-sm text-gray-900">{value}</div>,
    },
  ];

  const handleDelete = (storeId) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      setStores(stores.filter((store) => store.id !== storeId));
    }
  };

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
        <Link to="/stores/create">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Store
          </Button>
        </Link>
      </motion.div>

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
                {stores.length}
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
                {stores.filter((store) => store.status === "active").length}
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
                €
                {stores
                  .reduce((sum, store) => sum + store.revenue, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Store className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stores.reduce((sum, store) => sum + store.orders, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stores Table */}
      <DataTable
        data={stores}
        columns={columns}
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={true}
        itemsPerPage={10}
      />
    </div>
  );
};

export default StoresListPage;
