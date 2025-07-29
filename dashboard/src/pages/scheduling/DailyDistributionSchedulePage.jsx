import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Euro,
  Truck,
  MapPin,
  FileText,
  Building,
  Loader2,
  AlertCircle,
  Star,
  Users,
  TrendingUp,
  Activity,
  Play,
  Pause,
  RotateCcw,
  User,
  Route,
  Timer,
  ClipboardList,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import CreateScheduleModal from "../../components/scheduling/CreateScheduleModal";
import distributionService from "../../services/distributionService";
import userService from "../../services/userService";
import storeService from "../../services/storeService";
import { toast } from "react-hot-toast";

const DailyDistributionSchedulePage = () => {
  const navigate = useNavigate();

  // State management
  const [schedules, setSchedules] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    distributor_id: "",
    store_id: "",
    visit_status: "",
    schedule_date: new Date().toISOString().split("T")[0], // Today's date
    start_date: "",
    end_date: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalSchedules: 0,
    scheduledVisits: 0,
    inProgressVisits: 0,
    completedVisits: 0,
    cancelledVisits: 0,
  });

  // Auto distribution schedules state
  const [autoSchedules, setAutoSchedules] = useState([]);
  const [overallStats, setOverallStats] = useState({
    total_distributors: 0,
    total_orders: 0,
    total_stores: 0,
    total_estimated_duration: 0,
    distributors_with_orders: 0,
    distributors_with_existing_schedules: 0,
  });
  const [viewMode, setViewMode] = useState("auto"); // 'auto' or 'manual'

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    scheduleId: null,
    storeName: "",
    isLoading: false,
  });

  // Action loading states
  const [actionLoading, setActionLoading] = useState({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (viewMode === "manual") {
      loadSchedules();
    } else {
      loadAutoSchedules();
    }
  }, [pagination.currentPage, filters, viewMode]);

  const loadInitialData = async () => {
    try {
      if (viewMode === "auto") {
        await Promise.all([
          loadAutoSchedules(),
          loadDistributors(),
          loadStores(),
        ]);
      } else {
        await Promise.all([
          loadSchedules(),
          loadDistributors(),
          loadStores(),
          loadStatistics(),
        ]);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error loading initial data");
    }
  };

  // Load schedules
  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Clean filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value && value.trim() !== ""
        )
      );

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...cleanFilters,
      };

      console.log("🔍 Loading distribution schedules with params:", params);
      const response = await distributionService.getDistributionSchedules(
        params
      );
      console.log("📦 Distribution schedules response:", response);

      if (response && response.success) {
        const schedulesData = response.data?.schedules || [];
        setSchedules(schedulesData);

        // Update pagination
        if (response.data?.pagination) {
          const paginationData = response.data.pagination;
          setPagination((prev) => ({
            ...prev,
            currentPage: paginationData.current_page,
            totalPages: paginationData.total_pages,
            totalItems: paginationData.total_records,
          }));
        }

        // Calculate statistics from loaded data
        calculateStatistics(schedulesData);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      setError("Failed to load distribution schedules");
      toast.error("Failed to load distribution schedules");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load auto distribution schedules
  const loadAutoSchedules = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log(
        "🔍 Loading auto distribution schedules for date:",
        filters.schedule_date
      );
      const response = await distributionService.getAutoDistributionSchedules(
        filters.schedule_date
      );
      console.log("📦 Auto distribution schedules response:", response);

      if (response && response.success) {
        const autoSchedulesData = response.data?.distributors_schedules || [];
        const overallStatsData = response.data?.overall_statistics || {};

        setAutoSchedules(autoSchedulesData);
        setOverallStats(overallStatsData);

        // Update statistics for display
        let totalSchedules = 0;
        let scheduledVisits = 0;
        let inProgressVisits = 0;
        let completedVisits = 0;
        let cancelledVisits = 0;

        autoSchedulesData.forEach((distributorSchedule) => {
          distributorSchedule.schedule_items.forEach((item) => {
            totalSchedules++;
            switch (item.visit_status) {
              case "scheduled":
                scheduledVisits++;
                break;
              case "in_progress":
                inProgressVisits++;
                break;
              case "completed":
                completedVisits++;
                break;
              case "cancelled":
                cancelledVisits++;
                break;
            }
          });
        });

        setStatistics({
          totalSchedules,
          scheduledVisits,
          inProgressVisits,
          completedVisits,
          cancelledVisits,
        });
      }
    } catch (error) {
      console.error("Error loading auto schedules:", error);
      setError("Failed to load auto distribution schedules");
      toast.error("Failed to load auto distribution schedules");
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
        status: "active",
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
      const response = await storeService.getStores();
      if (response && response.success) {
        setStores(response.data?.stores || []);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await distributionService.getScheduleStatistics();
      if (response && response.success) {
        setStatistics(response.data?.statistics || {});
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  // Calculate statistics from schedules
  const calculateStatistics = (schedulesData) => {
    const stats = {
      totalSchedules: schedulesData.length,
      scheduledVisits: 0,
      inProgressVisits: 0,
      completedVisits: 0,
      cancelledVisits: 0,
    };

    schedulesData.forEach((schedule) => {
      switch (schedule.visit_status) {
        case "scheduled":
          stats.scheduledVisits++;
          break;
        case "in_progress":
          stats.inProgressVisits++;
          break;
        case "completed":
          stats.completedVisits++;
          break;
        case "cancelled":
          stats.cancelledVisits++;
          break;
      }
    });

    setStatistics(stats);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInitialData();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  // Handle schedule actions
  const handleStartVisit = async (scheduleId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [scheduleId]: "starting" }));

      const response = await distributionService.startStoreVisit(scheduleId);
      if (response && response.success) {
        toast.success("Store visit started successfully");
        loadSchedules(); // Refresh data
      }
    } catch (error) {
      console.error("Error starting visit:", error);
      toast.error("Failed to start store visit");
    } finally {
      setActionLoading((prev) => ({ ...prev, [scheduleId]: null }));
    }
  };

  const handleCompleteVisit = async (scheduleId, notes = "") => {
    try {
      setActionLoading((prev) => ({ ...prev, [scheduleId]: "completing" }));

      const response = await distributionService.completeStoreVisit(
        scheduleId,
        notes
      );
      if (response && response.success) {
        toast.success("Store visit completed successfully");
        loadSchedules(); // Refresh data
      }
    } catch (error) {
      console.error("Error completing visit:", error);
      toast.error("Failed to complete store visit");
    } finally {
      setActionLoading((prev) => ({ ...prev, [scheduleId]: null }));
    }
  };

  const handleCancelVisit = async (scheduleId, reason = "") => {
    try {
      setActionLoading((prev) => ({ ...prev, [scheduleId]: "cancelling" }));

      const response = await distributionService.cancelStoreVisit(
        scheduleId,
        reason
      );
      if (response && response.success) {
        toast.success("Store visit cancelled successfully");
        loadSchedules(); // Refresh data
      }
    } catch (error) {
      console.error("Error cancelling visit:", error);
      toast.error("Failed to cancel store visit");
    } finally {
      setActionLoading((prev) => ({ ...prev, [scheduleId]: null }));
    }
  };

  // Handle delete
  const handleDeleteClick = (schedule) => {
    setDeleteModal({
      isOpen: true,
      scheduleId: schedule.id,
      storeName: schedule.store?.name || "Unknown Store",
      isLoading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));

      const response = await distributionService.deleteDistributionSchedule(
        deleteModal.scheduleId
      );
      if (response && response.success) {
        toast.success("Distribution schedule deleted successfully");
        loadSchedules(); // Refresh data
        setDeleteModal({
          isOpen: false,
          scheduleId: null,
          storeName: "",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete distribution schedule");
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle create schedule
  const handleCreateSchedule = async (scheduleData) => {
    try {
      const response = await distributionService.generateDistributionSchedule(
        scheduleData
      );
      if (response && response.success) {
        loadSchedules(); // Refresh the schedules list
        return response;
      }
      throw new Error(response?.message || "Failed to generate schedule");
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "scheduled":
        return {
          color: "text-blue-600 bg-blue-100",
          icon: Clock,
          text: "Scheduled",
        };
      case "in_progress":
        return {
          color: "text-yellow-600 bg-yellow-100",
          icon: Play,
          text: "In Progress",
        };
      case "completed":
        return {
          color: "text-green-600 bg-green-100",
          icon: CheckCircle,
          text: "Completed",
        };
      case "cancelled":
        return {
          color: "text-red-600 bg-red-100",
          icon: XCircle,
          text: "Cancelled",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-100",
          icon: AlertTriangle,
          text: "Unknown",
        };
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Daily Distribution Schedule
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage daily distribution schedules and track visit progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("auto")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "auto"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Auto Schedule
            </button>
            <button
              onClick={() => setViewMode("manual")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "manual"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Manual Schedule
            </button>
          </div>

          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </EnhancedButton>

          {viewMode === "manual" && (
            <EnhancedButton
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Schedule
            </EnhancedButton>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Schedules
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalSchedules}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-900">
                  {statistics.scheduledVisits}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {statistics.inProgressVisits}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Play className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {statistics.completedVisits}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">
                  {statistics.cancelledVisits}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <EnhancedInput
                  type="text"
                  placeholder="Search schedules..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Date
              </label>
              <EnhancedInput
                type="date"
                value={filters.schedule_date}
                onChange={(e) =>
                  handleFilterChange("schedule_date", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distributor
              </label>
              <select
                value={filters.distributor_id}
                onChange={(e) =>
                  handleFilterChange("distributor_id", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.visit_status}
                onChange={(e) =>
                  handleFilterChange("visit_status", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

      {/* Schedules Display */}
      {viewMode === "auto" ? (
        // Auto Schedules Display - Show by Distributor
        <div className="space-y-6">
          {autoSchedules.length === 0 ? (
            <Card>
              <CardBody className="py-12">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No distributors with schedules found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No active distributors have orders assigned for{" "}
                    {filters.schedule_date}.
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            autoSchedules.map((distributorSchedule) => (
              <Card
                key={distributorSchedule.distributor.id}
                className="overflow-hidden"
              >
                <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {distributorSchedule.distributor.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {distributorSchedule.distributor.phone} •{" "}
                          {distributorSchedule.statistics.total_orders} orders •{" "}
                          {distributorSchedule.statistics.total_stores} stops
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Estimated Duration
                      </div>
                      <div className="text-lg font-semibold text-indigo-600">
                        {Math.round(
                          distributorSchedule.statistics
                            .estimated_duration_minutes / 60
                        )}
                        h{" "}
                        {distributorSchedule.statistics
                          .estimated_duration_minutes % 60}
                        m
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  {distributorSchedule.schedule_items.length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No visits scheduled for this distributor
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Visit Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Store
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Orders
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {distributorSchedule.schedule_items.map(
                            (scheduleItem, index) => {
                              const statusInfo = getStatusInfo(
                                scheduleItem.visit_status
                              );
                              const StatusIcon = statusInfo.icon;

                              return (
                                <motion.tr
                                  key={scheduleItem.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                  }}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-indigo-600">
                                          {scheduleItem.visit_order}
                                        </span>
                                      </div>
                                      {scheduleItem.is_auto_generated && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                          Auto
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {scheduleItem.store?.name || "N/A"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {scheduleItem.store?.address || "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {scheduleItem.orders?.length || 0} orders
                                      {scheduleItem.orders?.length > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          Total: €
                                          {scheduleItem.orders
                                            .reduce(
                                              (sum, order) =>
                                                sum +
                                                parseFloat(
                                                  order.total_amount_eur || 0
                                                ),
                                              0
                                            )
                                            .toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                                    >
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {statusInfo.text}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {scheduleItem.estimated_duration
                                      ? `${scheduleItem.estimated_duration} min`
                                      : "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                      <EnhancedButton
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedSchedule(scheduleItem);
                                          setShowDetailsModal(true);
                                        }}
                                        className="flex items-center gap-1"
                                      >
                                        <Eye className="w-3 h-3" />
                                        Details
                                      </EnhancedButton>
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Manual Schedules Table (Original)
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Distribution Schedules ({schedules.length})
              </h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No schedules found
                </h3>
                <p className="text-gray-600 mb-6">
                  {filters.search ||
                  filters.distributor_id ||
                  filters.visit_status
                    ? "No schedules match your current filters."
                    : "No distribution schedules have been created yet."}
                </p>
                <EnhancedButton onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Schedule
                </EnhancedButton>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distributor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visit Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.map((schedule) => {
                      const statusInfo = getStatusInfo(schedule.visit_status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <motion.tr
                          key={schedule.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(schedule.schedule_date)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatTime(schedule.scheduled_start_time)} -{" "}
                                {formatTime(schedule.scheduled_end_time)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <User className="h-4 w-4 text-indigo-600" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {schedule.distributor?.full_name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {schedule.distributor?.phone || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {schedule.store?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {schedule.store?.address || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              #{schedule.visit_order || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {schedule.estimated_duration
                              ? `${schedule.estimated_duration} min`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {/* Action buttons based on status */}
                              {schedule.visit_status === "scheduled" && (
                                <EnhancedButton
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartVisit(schedule.id)}
                                  disabled={
                                    actionLoading[schedule.id] === "starting"
                                  }
                                  className="flex items-center gap-1"
                                >
                                  {actionLoading[schedule.id] === "starting" ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Play className="w-3 h-3" />
                                  )}
                                  Start
                                </EnhancedButton>
                              )}

                              {schedule.visit_status === "in_progress" && (
                                <>
                                  <EnhancedButton
                                    size="sm"
                                    variant="success"
                                    onClick={() =>
                                      handleCompleteVisit(schedule.id)
                                    }
                                    disabled={
                                      actionLoading[schedule.id] ===
                                      "completing"
                                    }
                                    className="flex items-center gap-1"
                                  >
                                    {actionLoading[schedule.id] ===
                                    "completing" ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3" />
                                    )}
                                    Complete
                                  </EnhancedButton>
                                  <EnhancedButton
                                    size="sm"
                                    variant="danger"
                                    onClick={() =>
                                      handleCancelVisit(
                                        schedule.id,
                                        "Cancelled by admin"
                                      )
                                    }
                                    disabled={
                                      actionLoading[schedule.id] ===
                                      "cancelling"
                                    }
                                    className="flex items-center gap-1"
                                  >
                                    {actionLoading[schedule.id] ===
                                    "cancelling" ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <XCircle className="w-3 h-3" />
                                    )}
                                    Cancel
                                  </EnhancedButton>
                                </>
                              )}

                              {/* View details button */}
                              <EnhancedButton
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSchedule(schedule);
                                  setShowDetailsModal(true);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Details
                              </EnhancedButton>

                              {/* Delete button - only for scheduled visits */}
                              {schedule.visit_status === "scheduled" && (
                                <EnhancedButton
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDeleteClick(schedule)}
                                  className="flex items-center gap-1 ml-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </EnhancedButton>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{" "}
                  of {pagination.totalItems} results
                </div>
                <div className="flex items-center gap-2">
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </EnhancedButton>
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </EnhancedButton>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            scheduleId: null,
            storeName: "",
            isLoading: false,
          })
        }
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title="Delete Distribution Schedule"
        message={`Are you sure you want to delete the distribution schedule for "${deleteModal.storeName}"? This action cannot be undone.`}
      />

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSuccess={handleCreateSchedule}
        distributors={distributors}
        stores={stores}
      />
    </div>
  );
};

export default DailyDistributionSchedulePage;
