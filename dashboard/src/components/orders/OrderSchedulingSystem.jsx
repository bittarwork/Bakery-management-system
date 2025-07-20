import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  Truck,
  Package,
  Star,
  Zap,
  MapPin,
  User,
  Store,
  Euro,
  DollarSign,
  Plus,
  X,
  Edit,
  Save,
  RefreshCw,
  Filter,
  Search,
  Download,
  Settings,
  BarChart3,
  TrendingUp,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  Target,
  Flag,
  Timer,
  Users,
  Activity,
  Globe,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const OrderSchedulingSystem = ({
  orderId = null,
  onScheduleUpdate = null,
  showFullCalendar = true,
  compactMode = false,
  className = "",
}) => {
  // State
  const [schedulingData, setSchedulingData] = useState({
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    preferred_time: "",
    estimated_duration: 30, // in minutes
    priority: "medium",
    distributor_id: "",
    delivery_notes: "",
    auto_reschedule: true,
    send_reminders: true,
    notification_settings: {
      customer: true,
      distributor: true,
      store: true,
      admin: false,
    },
    recurring: {
      enabled: false,
      pattern: "weekly", // daily, weekly, monthly
      end_date: "",
      max_occurrences: 0,
    },
  });

  const [calendar, setCalendar] = useState({
    currentDate: new Date(),
    view: "month", // week, month
    selectedDate: null,
    events: [],
    availableSlots: [],
  });

  const [distributors, setDistributors] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDistributors();
    loadCalendarEvents();
    if (orderId) {
      loadOrderSchedule();
    }
  }, [orderId, calendar.currentDate]);

  // Auto-suggest optimal delivery times
  useEffect(() => {
    if (schedulingData.order_date && schedulingData.delivery_date) {
      generateOptimalSuggestions();
    }
  }, [
    schedulingData.order_date,
    schedulingData.delivery_date,
    schedulingData.distributor_id,
  ]);

  // Load distributors
  const loadDistributors = async () => {
    try {
      const response = await orderService.getDistributors();
      if (response.success) {
        setDistributors(response.data || []);
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
    }
  };

  // Load calendar events
  const loadCalendarEvents = async () => {
    try {
      const startDate = new Date(
        calendar.currentDate.getFullYear(),
        calendar.currentDate.getMonth(),
        1
      );
      const endDate = new Date(
        calendar.currentDate.getFullYear(),
        calendar.currentDate.getMonth() + 1,
        0
      );

      const response = await orderService.getScheduledOrders({
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });

      if (response.success) {
        setCalendar((prev) => ({
          ...prev,
          events: response.data.events || [],
          availableSlots: response.data.availableSlots || [],
        }));
      }
    } catch (error) {
      console.error("Error loading calendar events:", error);
    }
  };

  // Load existing order schedule
  const loadOrderSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrderSchedule(orderId);
      if (response.success && response.data) {
        setSchedulingData((prev) => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (error) {
      console.error("Error loading order schedule:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate optimal delivery suggestions
  const generateOptimalSuggestions = async () => {
    try {
      const response = await orderService.getDeliveryTimeSuggestions({
        order_date: schedulingData.order_date,
        delivery_date: schedulingData.delivery_date,
        distributor_id: schedulingData.distributor_id,
        priority: schedulingData.priority,
        estimated_duration: schedulingData.estimated_duration,
      });

      if (response.success) {
        setSuggestions(response.data.suggestions || []);
        setConflicts(response.data.conflicts || []);

        if (response.data.conflicts.length > 0) {
          setShowConflictModal(true);
        }
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  };

  // Handle schedule save
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const scheduleData = {
        ...schedulingData,
        order_id: orderId,
      };

      const response = orderId
        ? await orderService.updateOrderSchedule(orderId, scheduleData)
        : await orderService.createOrderSchedule(scheduleData);

      if (response.success) {
        toast.success("Order schedule saved successfully");
        if (onScheduleUpdate) {
          onScheduleUpdate(response.data);
        }
        loadCalendarEvents();
      } else {
        toast.error(response.message || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Error saving schedule");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle field change
  const handleFieldChange = (field, value) => {
    setSchedulingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested field change
  const handleNestedFieldChange = (parent, field, value) => {
    setSchedulingData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Apply suggested time
  const applySuggestion = (suggestion) => {
    setSchedulingData((prev) => ({
      ...prev,
      delivery_date: suggestion.date,
      preferred_time: suggestion.time,
      distributor_id: suggestion.distributor_id,
    }));
    toast.success("Suggestion applied");
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.medium;
  };

  // Format time
  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push({
          value: time,
          label: formatTime(time),
          available: true, // This would be determined by actual availability
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Conflict Resolution Modal
  const ConflictModal = () => (
    <AnimatePresence>
      {showConflictModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowConflictModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Scheduling Conflicts</h2>
                  <p className="text-sm text-gray-600">
                    We found {conflicts.length} potential conflicts with your
                    selected time
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {conflicts.map((conflict, index) => (
                <div
                  key={index}
                  className="p-4 border border-red-200 bg-red-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-red-800">
                        {conflict.type} Conflict
                      </h4>
                      <p className="text-sm text-red-600 mt-1">
                        {conflict.description}
                      </p>
                      <div className="text-xs text-red-500 mt-2">
                        <span>Time: {formatTime(conflict.time)}</span>
                        {conflict.distributor && (
                          <span className="ml-4">
                            Distributor: {conflict.distributor}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                        conflict.priority
                      )}`}
                    >
                      {conflict.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowConflictModal(false)}
                >
                  Keep Current Time
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      generateOptimalSuggestions();
                      setShowConflictModal(false);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Get Alternatives
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConflictModal(false);
                    }}
                  >
                    Resolve Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (compactMode) {
    return (
      <Card className={className}>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <Input
                type="date"
                value={schedulingData.delivery_date}
                onChange={(e) =>
                  handleFieldChange("delivery_date", e.target.value)
                }
                min={schedulingData.order_date}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time
              </label>
              <select
                value={schedulingData.preferred_time}
                onChange={(e) =>
                  handleFieldChange("preferred_time", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select time</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={schedulingData.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={schedulingData.auto_reschedule}
                  onChange={(e) =>
                    handleFieldChange("auto_reschedule", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Auto Reschedule
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={schedulingData.send_reminders}
                  onChange={(e) =>
                    handleFieldChange("send_reminders", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Send Reminders
                </span>
              </label>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ClockIcon className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Schedule
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order Scheduling System
            </h2>
            <p className="text-gray-600">
              Smart delivery scheduling with automated conflict resolution
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Advanced
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ClockIcon className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Schedule
          </Button>
        </div>
      </div>

      {/* Main Scheduling Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Schedule Details */}
        <div className="space-y-6">
          {/* Basic Schedule Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Schedule Details</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date *
                  </label>
                  <Input
                    type="date"
                    value={schedulingData.order_date}
                    onChange={(e) =>
                      handleFieldChange("order_date", e.target.value)
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date *
                  </label>
                  <Input
                    type="date"
                    value={schedulingData.delivery_date}
                    onChange={(e) =>
                      handleFieldChange("delivery_date", e.target.value)
                    }
                    min={schedulingData.order_date}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={schedulingData.preferred_time}
                    onChange={(e) =>
                      handleFieldChange("preferred_time", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((slot) => (
                      <option
                        key={slot.value}
                        value={slot.value}
                        disabled={!slot.available}
                      >
                        {slot.label} {!slot.available && "(Unavailable)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={schedulingData.estimated_duration}
                    onChange={(e) =>
                      handleFieldChange(
                        "estimated_duration",
                        parseInt(e.target.value)
                      )
                    }
                    min="15"
                    max="480"
                    step="15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={schedulingData.priority}
                    onChange={(e) =>
                      handleFieldChange("priority", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Distributor
                  </label>
                  <select
                    value={schedulingData.distributor_id}
                    onChange={(e) =>
                      handleFieldChange("distributor_id", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Auto-assign</option>
                    {distributors.map((distributor) => (
                      <option key={distributor.id} value={distributor.id}>
                        {distributor.full_name || distributor.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Notes
                </label>
                <textarea
                  value={schedulingData.delivery_notes}
                  onChange={(e) =>
                    handleFieldChange("delivery_notes", e.target.value)
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Special instructions for delivery..."
                />
              </div>

              {/* Quick Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={schedulingData.auto_reschedule}
                    onChange={(e) =>
                      handleFieldChange("auto_reschedule", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Auto Reschedule on Conflicts
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={schedulingData.send_reminders}
                    onChange={(e) =>
                      handleFieldChange("send_reminders", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Send Automated Reminders
                  </span>
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold">Smart Suggestions</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {suggestion.date}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {formatTime(suggestion.time)}
                            </span>
                          </div>
                          {suggestion.distributor_name && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {suggestion.distributor_name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                              suggestion.score >= 90
                                ? "high"
                                : suggestion.score >= 70
                                ? "medium"
                                : "low"
                            )}`}
                          >
                            {suggestion.score}% Match
                          </span>
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                      {suggestion.reasons && (
                        <p className="text-xs text-gray-600 mt-1">
                          {suggestion.reasons.join(" • ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column - Calendar and Advanced Settings */}
        <div className="space-y-6">
          {/* Calendar View */}
          {showFullCalendar && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Calendar View</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCalendar((prev) => ({
                          ...prev,
                          view: prev.view === "month" ? "week" : "month",
                        }))
                      }
                    >
                      {calendar.view === "month" ? "Week" : "Month"} View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="min-h-64 bg-gray-50 rounded-lg p-4">
                  {/* Simplified calendar - would be replaced with full calendar component */}
                  <div className="text-center text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Interactive Calendar View</p>
                    <p className="text-sm">
                      {calendar.events.length} scheduled deliveries this month
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Advanced Settings */}
          <AnimatePresence>
            {showAdvancedSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Advanced Settings</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {/* Notification Settings */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Notification Recipients
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(
                          schedulingData.notification_settings
                        ).map(([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                handleNestedFieldChange(
                                  "notification_settings",
                                  key,
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm capitalize">
                              {key}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Recurring Orders */}
                    <div>
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={schedulingData.recurring.enabled}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              "recurring",
                              "enabled",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 font-medium text-gray-900">
                          Recurring Order
                        </span>
                      </label>

                      {schedulingData.recurring.enabled && (
                        <div className="space-y-3 ml-6">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pattern
                              </label>
                              <select
                                value={schedulingData.recurring.pattern}
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    "recurring",
                                    "pattern",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <Input
                                type="date"
                                value={schedulingData.recurring.end_date}
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    "recurring",
                                    "end_date",
                                    e.target.value
                                  )
                                }
                                min={schedulingData.delivery_date}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Conflict Resolution Modal */}
      <ConflictModal />
    </div>
  );
};

export default OrderSchedulingSystem;
