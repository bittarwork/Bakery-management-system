import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Euro,
  Truck,
  MapPin,
  Building,
  Loader2,
  AlertCircle,
  Star,
  Users,
  TrendingUp,
  Activity,
  Play,
  Zap,
  User,
  Route,
  Timer,
  Navigation,
  Target,
  Gauge,
  Package,
  Phone,
  Store,
  ChevronRight,
  RotateCcw,
  Filter,
  Download,
  Bell,
  Calendar as CalendarIcon,
  MapPin as LocationIcon,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import distributionService from "../../services/distributionService";
import userService from "../../services/userService";
import storeService from "../../services/storeService";
import { toast } from "react-hot-toast";

const DailyDistributionSchedulePage = () => {
  const navigate = useNavigate();

  // State management
  const [autoSchedules, setAutoSchedules] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggeringGeneration, setIsTriggeringGeneration] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    distributor_id: "",
    store_id: "",
    visit_status: "",
    schedule_date: new Date().toISOString().split("T")[0], // Today's date
  });

  // Statistics
  const [overallStats, setOverallStats] = useState({
    total_distributors: 0,
    total_orders: 0,
    total_stores: 0,
    total_estimated_duration: 0,
    distributors_with_orders: 0,
    distributors_with_existing_schedules: 0,
  });

  // Cron job status state
  const [cronJobStatus, setCronJobStatus] = useState({
    isRunning: false,
    lastExecution: null,
    executionCount: 0,
    nextExecution: null,
  });

  const [systemInfo, setSystemInfo] = useState({
    environment: "development",
    server_time: null,
    timezone: null,
  });

  // Enhanced logger for this component
  const componentLogger = {
    info: (message, data) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`📅 [Distribution Schedule] ${message}`, data || "");
      }
    },
    error: (message, error) => {
      console.error(`❌ [Distribution Schedule] ${message}`, error);
    },
    warn: (message, data) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`⚠️  [Distribution Schedule] ${message}`, data || "");
      }
    },
  };

  // Load initial data automatically
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-refresh when filters change
  useEffect(() => {
    if (!isLoading) {
      loadAutoSchedules();
    }
  }, [filters.schedule_date, filters.distributor_id, filters.visit_status]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadAutoSchedules(),
        loadDistributors(),
        loadStores(),
        loadCronJobStatus(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error loading initial data");
    }
  };

  // Load auto distribution schedules
  const loadAutoSchedules = async () => {
    try {
      setError("");

      componentLogger.info(
        "Loading auto distribution schedules for date:",
        filters.schedule_date
      );

      const response = await distributionService.getAutoDistributionSchedules(
        filters.schedule_date
      );

      componentLogger.info("Auto distribution schedules response:", response);

      if (response && response.success) {
        const autoSchedulesData = response.data?.distributors_schedules || [];
        const overallStatsData = response.data?.overall_statistics || {};

        // Apply filters
        let filteredSchedules = autoSchedulesData;

        if (filters.distributor_id) {
          filteredSchedules = filteredSchedules.filter(
            (schedule) => schedule.distributor.id == filters.distributor_id
          );
        }

        if (filters.visit_status) {
          filteredSchedules = filteredSchedules
            .map((schedule) => ({
              ...schedule,
              schedule_items: schedule.schedule_items.filter(
                (item) => item.visit_status === filters.visit_status
              ),
            }))
            .filter((schedule) => schedule.schedule_items.length > 0);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredSchedules = filteredSchedules.filter(
            (schedule) =>
              schedule.distributor.full_name
                .toLowerCase()
                .includes(searchTerm) ||
              schedule.schedule_items.some((item) =>
                item.store?.name.toLowerCase().includes(searchTerm)
              )
          );
        }

        setAutoSchedules(filteredSchedules);
        setOverallStats(overallStatsData);
      }
    } catch (error) {
      console.error("Error loading auto schedules:", error);
      setError("Failed to load distribution schedules");
      toast.error("Failed to load distribution schedules");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load distributors
  const loadDistributors = async () => {
    try {
      const response = await userService.getUsers({
        role: "distributor",
        limit: 100,
      });
      if (response && response.success) {
        setDistributors(response.data?.users || []);
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
    }
  };

  // Load stores
  const loadStores = async () => {
    try {
      const response = await storeService.getStores({ limit: 100 });
      if (response && response.success) {
        setStores(response.data?.stores || []);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  // Load cron job status
  const loadCronJobStatus = async () => {
    try {
      const response = await distributionService.getCronJobStatus();
      if (response && response.success) {
        setCronJobStatus(response.data?.cron_status || {});
        setSystemInfo(response.data?.system_info || {});
      }
    } catch (error) {
      console.error("Error loading cron job status:", error);
    }
  };

  // Trigger manual generation
  const triggerAutoGeneration = async () => {
    try {
      setIsTriggeringGeneration(true);

      const response = await distributionService.triggerAutoGeneration({
        date: filters.schedule_date,
      });

      if (response && response.success) {
        toast.success("Auto generation triggered successfully");
        await loadAutoSchedules();
        await loadCronJobStatus();
      } else {
        throw new Error(response?.message || "Failed to trigger generation");
      }
    } catch (error) {
      console.error("Error triggering auto generation:", error);
      toast.error(error.message || "Failed to trigger auto generation");
    } finally {
      setIsTriggeringGeneration(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAutoSchedules();
    await loadCronJobStatus();
  };

  // Get status info for visits
  const getStatusInfo = (status) => {
    const statusMap = {
      scheduled: {
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
        text: "Scheduled",
      },
      in_progress: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Timer,
        text: "In Progress",
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Cancelled",
      },
    };
    return statusMap[status] || statusMap.scheduled;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Gradient Background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 mb-8 shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Daily Distribution Schedule
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage and track distribution routes automatically
                </p>
              </div>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-4"
                >
                  <Calendar className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Active Distributors
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {overallStats.distributors_with_orders || 0}
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {overallStats.total_orders || 0}
                  </p>
                </div>
                <div className="bg-emerald-500 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">
                    Total Stores
                  </p>
                  <p className="text-3xl font-bold text-amber-900">
                    {overallStats.total_stores || 0}
                  </p>
                </div>
                <div className="bg-amber-500 p-3 rounded-xl">
                  <Store className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Est. Duration
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {Math.round(
                      (overallStats.total_estimated_duration || 0) / 60
                    )}
                    h
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Action Buttons & Cron Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <EnhancedButton
                    onClick={triggerAutoGeneration}
                    disabled={isTriggeringGeneration}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg"
                  >
                    {isTriggeringGeneration ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Generate Routes
                  </EnhancedButton>

                  <EnhancedButton
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    {isRefreshing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </EnhancedButton>
                </div>

                {/* Cron Status */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        cronJobStatus.isRunning
                          ? "bg-green-400 animate-pulse"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-gray-600">
                      Auto-generation:{" "}
                      {cronJobStatus.isRunning ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {cronJobStatus.lastExecution && (
                    <div className="text-gray-500">
                      Last run:{" "}
                      {new Date(cronJobStatus.lastExecution).toLocaleString(
                        "en-GB"
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <EnhancedInput
                      type="text"
                      placeholder="Search distributors or stores..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <EnhancedInput
                      type="date"
                      value={filters.schedule_date}
                      onChange={(e) =>
                        handleFilterChange("schedule_date", e.target.value)
                      }
                      className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distributor
                  </label>
                  <select
                    value={filters.distributor_id}
                    onChange={(e) =>
                      handleFilterChange("distributor_id", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Distributors</option>
                    {distributors.map((distributor) => (
                      <option key={distributor.id} value={distributor.id}>
                        {distributor.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.visit_status}
                    onChange={(e) =>
                      handleFilterChange("visit_status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <Card className="border-0 shadow-lg">
            <CardBody className="py-16">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600 text-lg">
                  Loading distribution schedules...
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardBody className="p-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Distribution Schedules */}
        {!isLoading && !error && (
          <AnimatePresence>
            {autoSchedules.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16"
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardBody className="p-12">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-indigo-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        No Distribution Schedules Found
                      </h3>
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        {filters.search ||
                        filters.distributor_id ||
                        filters.visit_status
                          ? "No schedules match your current filters. Try adjusting your search criteria."
                          : `No distribution schedules are available for ${formatDate(
                              filters.schedule_date
                            )}. Click "Generate Routes" to create new schedules automatically.`}
                      </p>
                      <EnhancedButton
                        onClick={triggerAutoGeneration}
                        disabled={isTriggeringGeneration}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg"
                      >
                        {isTriggeringGeneration ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Generate Routes Now
                      </EnhancedButton>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {autoSchedules.map((distributorSchedule, index) => (
                  <motion.div
                    key={distributorSchedule.distributor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
                      {/* Distributor Header */}
                      <CardHeader className="pb-0">
                        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 -mx-6 -mt-6 px-6 pt-6 pb-6 mb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className="relative">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                  <User className="w-8 h-8 text-white" />
                                </div>
                                {distributorSchedule.statistics
                                  .has_existing_schedule && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white mb-1">
                                  {distributorSchedule.distributor.full_name}
                                </h3>
                                <div className="flex items-center gap-4 text-white/80">
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>
                                      {distributorSchedule.distributor.phone}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Package className="w-4 h-4" />
                                    <span>
                                      {
                                        distributorSchedule.statistics
                                          .total_orders
                                      }{" "}
                                      orders
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Store className="w-4 h-4" />
                                    <span>
                                      {
                                        distributorSchedule.statistics
                                          .total_stores
                                      }{" "}
                                      stops
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-white/70 text-sm mb-1">
                                  Duration
                                </div>
                                <div className="text-2xl font-bold text-white">
                                  {Math.floor(
                                    distributorSchedule.statistics
                                      .estimated_duration_minutes / 60
                                  )}
                                  h{" "}
                                  {distributorSchedule.statistics
                                    .estimated_duration_minutes % 60}
                                  m
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-white/70 text-sm mb-1">
                                  Distance
                                </div>
                                <div className="text-xl font-semibold text-white flex items-center gap-1">
                                  <Route className="w-4 h-4" />
                                  {distributorSchedule.schedule_items
                                    .reduce(
                                      (total, item) =>
                                        total +
                                        (item.distance_from_previous || 0),
                                      0
                                    )
                                    .toFixed(1)}{" "}
                                  km
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      {/* Schedule Items */}
                      <CardBody className="pt-0">
                        {distributorSchedule.schedule_items.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600">No visits scheduled</p>
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {distributorSchedule.schedule_items.map(
                              (scheduleItem, itemIndex) => {
                                const statusInfo = getStatusInfo(
                                  scheduleItem.visit_status
                                );
                                const StatusIcon = statusInfo.icon;

                                return (
                                  <motion.div
                                    key={scheduleItem.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: itemIndex * 0.05 }}
                                    className="group relative"
                                  >
                                    <Card className="border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50">
                                      <CardBody className="p-6">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-6 flex-1">
                                            {/* Visit Order */}
                                            <div className="relative">
                                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="text-lg font-bold text-white">
                                                  {scheduleItem.visit_order}
                                                </span>
                                              </div>
                                              {scheduleItem.visit_order ===
                                                1 && (
                                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                  <Target className="w-3 h-3 text-white" />
                                                </div>
                                              )}
                                            </div>

                                            {/* Store Info */}
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Building className="w-5 h-5 text-indigo-600" />
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                  {scheduleItem.store?.name ||
                                                    "N/A"}
                                                </h4>
                                                {scheduleItem.is_auto_generated && (
                                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    Auto
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-1 text-gray-600 mb-3">
                                                <LocationIcon className="w-4 h-4" />
                                                <span className="text-sm">
                                                  {scheduleItem.store
                                                    ?.address || "N/A"}
                                                </span>
                                              </div>

                                              {/* Orders Summary */}
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                  <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-900">
                                                      {scheduleItem.orders
                                                        ?.length || 0}{" "}
                                                      Orders
                                                    </span>
                                                  </div>
                                                  {scheduleItem.orders?.length >
                                                    0 && (
                                                    <div className="text-xs text-blue-700 mt-1">
                                                      Total: €
                                                      {scheduleItem.orders
                                                        .reduce(
                                                          (sum, order) =>
                                                            sum +
                                                            parseFloat(
                                                              order.total_amount_eur ||
                                                                0
                                                            ),
                                                          0
                                                        )
                                                        .toFixed(2)}
                                                    </div>
                                                  )}
                                                </div>

                                                <div className="bg-purple-50 rounded-lg p-3">
                                                  <div className="flex items-center gap-2">
                                                    <Navigation className="w-4 h-4 text-purple-600" />
                                                    <span className="text-sm font-medium text-purple-900">
                                                      {scheduleItem.distance_from_previous
                                                        ? `${parseFloat(
                                                            scheduleItem.distance_from_previous
                                                          ).toFixed(1)} km`
                                                        : "N/A"}
                                                    </span>
                                                  </div>
                                                  <div className="text-xs text-purple-700 mt-1">
                                                    {scheduleItem.visit_order ===
                                                    1
                                                      ? "From depot"
                                                      : "From previous"}
                                                  </div>
                                                </div>

                                                <div className="bg-amber-50 rounded-lg p-3">
                                                  <div className="flex items-center gap-2">
                                                    <Timer className="w-4 h-4 text-amber-600" />
                                                    <span className="text-sm font-medium text-amber-900">
                                                      {scheduleItem.estimated_duration
                                                        ? `${scheduleItem.estimated_duration} min`
                                                        : "N/A"}
                                                    </span>
                                                  </div>
                                                  <div className="text-xs text-amber-700 mt-1">
                                                    Estimated time
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex flex-col items-end gap-3">
                                              <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                                              >
                                                <StatusIcon className="w-4 h-4 mr-1" />
                                                {statusInfo.text}
                                              </span>

                                              <EnhancedButton
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  // Handle view details
                                                  console.log(
                                                    "View details for:",
                                                    scheduleItem
                                                  );
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                              >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Details
                                              </EnhancedButton>
                                            </div>
                                          </div>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  </motion.div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default DailyDistributionSchedulePage;
