import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
  DollarSign,
  Package2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";

const ProductsListPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    search: "",
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: "White Bread",
          code: "WB-001",
          category: "Bread",
          price: 2.5,
          cost: 1.2,
          stock: 150,
          minStock: 50,
          status: "active",
          description: "Fresh white bread made daily",
          image: "bread-white.jpg",
          supplier: "Local Flour Co.",
          lastRestock: "2024-03-20",
        },
        {
          id: 2,
          name: "Croissant",
          code: "CR-002",
          category: "Pastry",
          price: 3.5,
          cost: 1.8,
          stock: 45,
          minStock: 30,
          status: "active",
          description: "Buttery French croissant",
          image: "croissant.jpg",
          supplier: "Butter Delights",
          lastRestock: "2024-03-22",
        },
        {
          id: 3,
          name: "Chocolate Cake",
          code: "CC-003",
          category: "Cake",
          price: 25.0,
          cost: 12.0,
          stock: 8,
          minStock: 10,
          status: "active",
          description: "Rich chocolate layer cake",
          image: "chocolate-cake.jpg",
          supplier: "Sweet Supplies",
          lastRestock: "2024-03-18",
        },
        {
          id: 4,
          name: "Whole Wheat Bread",
          code: "WW-004",
          category: "Bread",
          price: 3.0,
          cost: 1.5,
          stock: 25,
          minStock: 40,
          status: "active",
          description: "Healthy whole wheat bread",
          image: "bread-whole-wheat.jpg",
          supplier: "Local Flour Co.",
          lastRestock: "2024-03-21",
        },
        {
          id: 5,
          name: "Danish Pastry",
          code: "DP-005",
          category: "Pastry",
          price: 4.0,
          cost: 2.2,
          stock: 0,
          minStock: 20,
          status: "inactive",
          description: "Traditional Danish pastry",
          image: "danish-pastry.jpg",
          supplier: "Butter Delights",
          lastRestock: "2024-03-15",
        },
        {
          id: 6,
          name: "Cheesecake",
          code: "CS-006",
          category: "Cake",
          price: 30.0,
          cost: 15.0,
          stock: 5,
          minStock: 8,
          status: "active",
          description: "New York style cheesecake",
          image: "cheesecake.jpg",
          supplier: "Sweet Supplies",
          lastRestock: "2024-03-19",
        },
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return CheckCircle;
      case "inactive":
        return XCircle;
      default:
        return Package;
    }
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0)
      return { status: "out", color: "text-red-600", bg: "bg-red-100" };
    if (stock <= minStock)
      return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { status: "good", color: "text-green-600", bg: "bg-green-100" };
  };

  const getStockIcon = (stock, minStock) => {
    const stockStatus = getStockStatus(stock, minStock);
    switch (stockStatus.status) {
      case "out":
        return XCircle;
      case "low":
        return AlertTriangle;
      case "good":
        return CheckCircle;
      default:
        return Package2;
    }
  };

  const columns = [
    {
      key: "name",
      title: "Product",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
            <Package className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">Code: {row.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      render: (value) => (
        <div className="flex items-center">
          <Tag className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: "price",
      title: "Price",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">€{value.toFixed(2)}</div>
          <div className="text-sm text-gray-500">
            Cost: €{row.cost.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      title: "Stock",
      render: (value, row) => {
        const stockStatus = getStockStatus(value, row.minStock);
        const StockIcon = getStockIcon(value, row.minStock);
        return (
          <div className="flex items-center">
            <StockIcon className={`w-4 h-4 mr-2 ${stockStatus.color}`} />
            <div>
              <div className={`font-medium ${stockStatus.color}`}>{value}</div>
              <div className="text-sm text-gray-500">Min: {row.minStock}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const Icon = getStatusIcon(value);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              value
            )}`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {value === "active" ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Link to={`/products/${row.id}`}>
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
            >
              View
            </Button>
          </Link>
          <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== productId));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting products...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    lowStock: products.filter((p) => p.stock <= p.minStock && p.stock > 0)
      .length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    totalValue: products.reduce(
      (sum, product) => sum + product.price * product.stock,
      0
    ),
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your bakery product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Link to="/products/create">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Products
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.lowStock}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.outOfStock}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                €{stats.totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({ category: "", status: "", search: "" })
              }
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Bread">Bread</option>
                <option value="Pastry">Pastry</option>
                <option value="Cake">Cake</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                placeholder="Search by name or code..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Products List</h2>
        </CardHeader>
        <CardBody>
          <DataTable
            data={products}
            columns={columns}
            searchable={true}
            sortable={true}
            pagination={true}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductsListPage;
