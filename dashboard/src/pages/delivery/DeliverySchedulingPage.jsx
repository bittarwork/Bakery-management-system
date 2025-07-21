/**
 * Delivery Scheduling Page
 * Advanced Delivery Scheduling with Calendar Integration
 * Phase 6 - Complete Order Management
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  CalendarIcon,
  TruckIcon,
  ClockIcon,
  ChartBarIcon,
  MapPinIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Services
import deliverySchedulingService from "../../services/deliverySchedulingService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const DeliverySchedulingPage = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [performance, setPerformance] = useState({});
  const [capacity, setCapacity] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    time_slot: "",
    delivery_type: "",
    date_from: "",
    date_to: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Load initial data
  useEffect(() => {
    loadTabData();
  }, [activeTab, filters, pagination.currentPage, selectedDate]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "calendar":
          await loadCalendarData();
          break;
        case "schedules":
          await loadSchedules();
          break;
        case "capacity":
          await loadCapacityData();
          break;
        case "statistics":
          await loadStatistics();
          break;
        case "performance":
          await loadPerformance();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarData = async () => {
    try {
      const response = await deliverySchedulingService.getDeliverySchedules({
        view: "calendar",
        date_from: filters.date_from || getWeekStart(new Date(selectedDate)),
        date_to: filters.date_to || getWeekEnd(new Date(selectedDate)),
        status: filters.status,
        time_slot: filters.time_slot,
        delivery_type: filters.delivery_type,
      });

      if (response.success) {
        const events = (response.data.schedules || []).map((schedule) =>
          deliverySchedulingService.formatScheduleForCalendar(schedule)
        );
        setCalendarEvents(events);
      }
    } catch (error) {
      console.error("Error loading calendar data:", error);
      // استخدام بيانات تجريبية للتقويم
      const mockSchedules = [
        {
          id: 1,
          order_number: "ORD-2024-101",
          order_id: 101,
          scheduled_date: "2024-01-20",
          scheduled_time_start: "14:00",
          scheduled_time_end: "15:00",
          status: "scheduled",
          delivery_type: "standard",
          contact_person: "خالد أحمد",
          contact_phone: "+32 456 789 123",
          delivery_address: "Avenue Louise 123, Brussels",
          delivery_fee_eur: 5.5,
        },
        {
          id: 2,
          order_number: "ORD-2024-102",
          order_id: 102,
          scheduled_date: "2024-01-21",
          scheduled_time_start: "10:00",
          scheduled_time_end: "11:00",
          status: "confirmed",
          delivery_type: "express",
          contact_person: "سارة محمد",
          contact_phone: "+32 465 123 789",
          delivery_address: "Rue des Arabes 45, Antwerp",
          delivery_fee_eur: 8.0,
        },
      ];

      const events = mockSchedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.order_number,
        date: schedule.scheduled_date,
        start: schedule.scheduled_time_start,
        end: schedule.scheduled_time_end,
        color:
          schedule.status === "confirmed" ? "text-green-600" : "text-blue-600",
        backgroundColor:
          schedule.status === "confirmed" ? "bg-green-50" : "bg-blue-50",
        borderColor:
          schedule.status === "confirmed"
            ? "border-green-200"
            : "border-blue-200",
        extendedProps: {
          order_id: schedule.order_id,
          order_number: schedule.order_number,
          status: schedule.status,
          delivery_type: schedule.delivery_type,
          contact_person: schedule.contact_person,
          contact_phone: schedule.contact_phone,
          delivery_address: schedule.delivery_address,
          delivery_fee: schedule.delivery_fee_eur,
        },
      }));

      setCalendarEvents(events);
      toast.error("تم استخدام بيانات تجريبية - مشكلة في الاتصال بالخادم");
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await deliverySchedulingService.getDeliverySchedules({
        page: pagination.currentPage,
        ...filters,
      });

      if (response.success) {
        setSchedules(response.data.schedules || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      // استخدام بيانات تجريبية للجداول
      const mockSchedules = [
        {
          id: 1,
          order_number: "ORD-2024-101",
          order_id: 101,
          scheduled_date: "2024-01-20",
          scheduled_time_start: "14:00",
          scheduled_time_end: "15:00",
          status: "scheduled",
          delivery_type: "standard",
          contact_person: "خالد أحمد",
          contact_phone: "+32 456 789 123",
          delivery_address: "Avenue Louise 123, Brussels",
          delivery_fee_eur: 5.5,
          store_name: "متجر الأمين",
        },
        {
          id: 2,
          order_number: "ORD-2024-102",
          order_id: 102,
          scheduled_date: "2024-01-21",
          scheduled_time_start: "10:00",
          scheduled_time_end: "11:00",
          status: "confirmed",
          delivery_type: "express",
          contact_person: "سارة محمد",
          contact_phone: "+32 465 123 789",
          delivery_address: "Rue des Arabes 45, Antwerp",
          delivery_fee_eur: 8.0,
          store_name: "مخبز النور",
        },
      ];

      setSchedules(mockSchedules);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
      });
      toast.error("تم استخدام بيانات تجريبية - مشكلة في الاتصال بالخادم");
    }
  };

  const loadCapacityData = async () => {
    try {
      const response = await deliverySchedulingService.getDeliveryCapacity({
        date_from: filters.date_from || selectedDate,
        date_to: filters.date_to || getWeekEnd(new Date(selectedDate)),
        time_slot: filters.time_slot,
      });

      if (response.success) {
        setCapacity(response.data || {});
      }
    } catch (error) {
      console.error("Error loading capacity data:", error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await deliverySchedulingService.getDeliveryStatistics({
        date_from: filters.date_from,
        date_to: filters.date_to,
      });

      if (response.success) {
        setStatistics(response.data || {});
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadPerformance = async () => {
    try {
      const response = await deliverySchedulingService.getDeliveryPerformance({
        date_from: filters.date_from,
        date_to: filters.date_to,
        time_slot: filters.time_slot,
        delivery_type: filters.delivery_type,
      });

      if (response.success) {
        setPerformance(response.data || {});
      }
    } catch (error) {
      console.error("Error loading performance data:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleScheduleAction = async (scheduleId, action, data = {}) => {
    try {
      let response;
      switch (action) {
        case "reschedule":
          response = await deliverySchedulingService.rescheduleDelivery(
            scheduleId,
            data
          );
          break;
        case "cancel":
          response = await deliverySchedulingService.cancelDeliverySchedule(
            scheduleId,
            data.reason
          );
          break;
        default:
          return;
      }

      if (response.success) {
        toast.success(
          `تم ${
            action === "reschedule" ? "إعادة جدولة" : "إلغاء"
          } التسليم بنجاح`
        );
        await loadTabData();
      } else {
        toast.error(
          `فشل في ${action === "reschedule" ? "إعادة الجدولة" : "الإلغاء"}`
        );
      }
    } catch (error) {
      console.error(`Error ${action}ing schedule:`, error);
      toast.error(
        `خطأ في ${action === "reschedule" ? "إعادة الجدولة" : "الإلغاء"}`
      );
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      time_slot: "",
      delivery_type: "",
      date_from: "",
      date_to: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Helper functions
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  };

  const getWeekEnd = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  };

  // Tabs configuration
  const tabs = [
    {
      id: "calendar",
      name: "التقويم",
      icon: CalendarIcon,
      description: "عرض التقويم التفاعلي",
    },
    {
      id: "schedules",
      name: "الجداول",
      icon: ClockIcon,
      description: "إدارة جداول التسليم",
    },
    {
      id: "capacity",
      name: "السعة",
      icon: TruckIcon,
      description: "إدارة سعة التسليم",
    },
    {
      id: "statistics",
      name: "الإحصائيات",
      icon: ChartBarIcon,
      description: "إحصائيات التسليم",
    },
    {
      id: "performance",
      name: "الأداء",
      icon: CheckCircleIcon,
      description: "تحليل الأداء",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              إدارة جدولة التسليم
            </h1>
            <p className="text-gray-600">
              نظام جدولة التسليم المتقدم مع إدارة السعة والأداء
            </p>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                /* TODO: Open create modal */
              }}
            >
              <PlusIcon className="w-5 h-5" />
              <span>جدولة جديدة</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-4 mb-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          {activeTab === "schedules" && (
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الجداول..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Date Selector for Calendar */}
          {activeTab === "calendar" && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">جميع الحالات</option>
            <option value="scheduled">مجدول</option>
            <option value="confirmed">مؤكد</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="delivered">تم التسليم</option>
            <option value="missed">فائت</option>
            <option value="rescheduled">معاد جدولته</option>
          </select>

          {/* Time Slot Filter */}
          <select
            value={filters.time_slot}
            onChange={(e) => handleFilterChange("time_slot", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">جميع الأوقات</option>
            <option value="morning">صباحي</option>
            <option value="afternoon">مسائي</option>
            <option value="evening">مسائي متأخر</option>
            <option value="custom">مخصص</option>
          </select>

          {/* Delivery Type Filter */}
          <select
            value={filters.delivery_type}
            onChange={(e) =>
              handleFilterChange("delivery_type", e.target.value)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">جميع الأنواع</option>
            <option value="standard">عادي</option>
            <option value="express">سريع</option>
            <option value="scheduled">مجدول</option>
            <option value="pickup">استلام</option>
          </select>

          {/* Date Range for non-calendar tabs */}
          {activeTab !== "calendar" && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">إلى</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            مسح المرشحات
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm min-h-96">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6">
            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <CalendarTab
                events={calendarEvents}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                onScheduleAction={handleScheduleAction}
              />
            )}

            {/* Schedules Tab */}
            {activeTab === "schedules" && (
              <SchedulesTab
                schedules={schedules}
                pagination={pagination}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, currentPage: page }))
                }
                onScheduleAction={handleScheduleAction}
              />
            )}

            {/* Capacity Tab */}
            {activeTab === "capacity" && (
              <CapacityTab
                capacity={capacity}
                selectedDate={selectedDate}
                filters={filters}
              />
            )}

            {/* Statistics Tab */}
            {activeTab === "statistics" && (
              <StatisticsTab statistics={statistics} />
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <PerformanceTab performance={performance} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Calendar Tab Component
const CalendarTab = ({
  events,
  selectedDate,
  onDateChange,
  onScheduleAction,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = dateStr === new Date().toISOString().split("T")[0];
        const isSelected = dateStr === selectedDate;
        const dayEvents = events.filter((event) => event.date === dateStr);

        days.push({
          date: new Date(currentDate),
          dateStr,
          isCurrentMonth,
          isToday,
          isSelected,
          events: dayEvents,
          eventCount: dayEvents.length,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString("ar-AE", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">تقويم التسليم - {monthName}</h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            اليوم
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Week Header */}
        <div className="grid grid-cols-7 bg-gray-50">
          {[
            "الأحد",
            "الاثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة",
            "السبت",
          ].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <motion.div
              key={index}
              whileHover={{ backgroundColor: "#f9fafb" }}
              className={`p-2 h-24 border-b border-r border-gray-200 cursor-pointer ${
                !day.isCurrentMonth
                  ? "bg-gray-50 text-gray-400"
                  : day.isSelected
                  ? "bg-blue-50 border-blue-200"
                  : day.isToday
                  ? "bg-yellow-50"
                  : "bg-white"
              }`}
              onClick={() => onDateChange(day.dateStr)}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  day.isToday ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {day.date.getDate()}
              </div>

              {day.eventCount > 0 && (
                <div className="space-y-1">
                  {day.events.slice(0, 2).map((event, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-1 py-0.5 rounded truncate ${
                        event.extendedProps.statusInfo?.bgColor || "bg-blue-100"
                      } ${
                        event.extendedProps.statusInfo?.color || "text-blue-800"
                      }`}
                      title={`${event.title} - ${event.extendedProps.statusInfo?.label}`}
                    >
                      {event.title}
                    </div>
                  ))}

                  {day.eventCount > 2 && (
                    <div className="text-xs text-gray-500">
                      +{day.eventCount - 2} أخرى
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">
            مهام يوم {new Date(selectedDate).toLocaleDateString("ar-AE")}
          </h4>

          {events.filter((event) => event.date === selectedDate).length ===
          0 ? (
            <p className="text-gray-500 text-center py-4">
              لا توجد مهام في هذا اليوم
            </p>
          ) : (
            <div className="space-y-2">
              {events
                .filter((event) => event.date === selectedDate)
                .sort((a, b) => (a.start || "").localeCompare(b.start || ""))
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onAction={onScheduleAction}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="font-medium">{event.title}</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${event.extendedProps.statusInfo?.bgColor} ${event.extendedProps.statusInfo?.color}`}
          >
            {event.extendedProps.statusInfo?.label}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {event.start} - {event.end}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
        <div>العميل: {event.extendedProps.contact_person}</div>
        <div>الهاتف: {event.extendedProps.contact_phone}</div>
      </div>

      {event.extendedProps.delivery_address && (
        <div className="text-sm text-gray-600 mb-2 flex items-center">
          <MapPinIcon className="w-4 h-4 ml-1" />
          {event.extendedProps.delivery_address}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span
            className={`px-2 py-1 rounded-full text-xs ${event.extendedProps.typeInfo?.bgColor} ${event.extendedProps.typeInfo?.color}`}
          >
            {event.extendedProps.typeInfo?.icon}{" "}
            {event.extendedProps.typeInfo?.label}
          </span>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          {event.extendedProps.status === "scheduled" && (
            <>
              <button
                onClick={() => onAction(event.id, "reschedule", {})}
                className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                title="إعادة الجدولة"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  onAction(event.id, "cancel", { reason: "طلب العميل" })
                }
                className="text-red-600 hover:bg-red-50 p-1 rounded"
                title="إلغاء"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
              </button>
            </>
          )}

          <span className="text-sm font-medium text-gray-900">
            €{parseFloat(event.extendedProps.delivery_fee || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Schedules Tab Component
const SchedulesTab = ({
  schedules,
  pagination,
  onPageChange,
  onScheduleAction,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          جداول التسليم ({schedules.length})
        </h3>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد جداول تسليم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onAction={onScheduleAction}
            />
          ))}

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Schedule Card Component
const ScheduleCard = ({ schedule, onAction }) => {
  const statusInfo = deliverySchedulingService.getScheduleStatusInfo(
    schedule.status
  );
  const typeInfo = deliverySchedulingService.getDeliveryTypeInfo(
    schedule.delivery_type
  );
  const slotInfo = deliverySchedulingService.getTimeSlotInfo(
    schedule.time_slot
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <TruckIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-gray-900">
              طلب #{schedule.order_number}
            </h4>
            <p className="text-sm text-gray-500">{schedule.store_name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <span
            className={`px-2 py-1 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.color}`}
          >
            {statusInfo.icon} {statusInfo.label}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${typeInfo.bgColor} ${typeInfo.color}`}
          >
            {typeInfo.icon} {typeInfo.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-500">التاريخ:</span>
          <span className="font-medium text-gray-900 mr-2">
            {new Date(schedule.scheduled_date).toLocaleDateString("ar-AE")}
          </span>
        </div>
        <div>
          <span className="text-gray-500">الوقت:</span>
          <span className="font-medium text-gray-900 mr-2">
            {schedule.scheduled_time_start} - {schedule.scheduled_time_end}
          </span>
        </div>
        <div>
          <span className="text-gray-500">الفترة:</span>
          <span className={`font-medium mr-2 ${slotInfo.color}`}>
            {slotInfo.icon} {slotInfo.label}
          </span>
        </div>
        <div>
          <span className="text-gray-500">الرسوم:</span>
          <span className="font-medium text-gray-900 mr-2">
            €{parseFloat(schedule.delivery_fee_eur || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {schedule.contact_person && (
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <span className="text-gray-500">جهة الاتصال:</span>
            <span className="font-medium text-gray-900 mr-2">
              {schedule.contact_person}
            </span>
          </div>
          {schedule.contact_phone && (
            <div>
              <span className="text-gray-500">الهاتف:</span>
              <span className="font-medium text-gray-900 mr-2">
                {schedule.contact_phone}
              </span>
            </div>
          )}
        </div>
      )}

      {schedule.delivery_address && (
        <div className="text-sm mb-3 flex items-start">
          <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 ml-1 flex-shrink-0" />
          <span className="text-gray-600">{schedule.delivery_address}</span>
        </div>
      )}

      {schedule.delivery_instructions && (
        <div className="text-sm mb-3">
          <span className="text-gray-500">تعليمات التسليم: </span>
          <span className="text-gray-700">
            {schedule.delivery_instructions}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {schedule.status === "scheduled" && (
        <div className="flex items-center space-x-2 space-x-reverse pt-3 border-t border-gray-100">
          <button
            onClick={() => onAction(schedule.id, "reschedule", {})}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors"
          >
            إعادة جدولة
          </button>
          <button
            onClick={() =>
              onAction(schedule.id, "cancel", { reason: "إلغاء إداري" })
            }
            className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      )}
    </motion.div>
  );
};

// Capacity Tab Component
const CapacityTab = ({ capacity, selectedDate, filters }) => {
  const dailyCapacity = capacity.daily_capacity || [];
  const suggestedSlots = capacity.suggested_slots || [];
  const overallStats = capacity.overall_stats || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">إدارة سعة التسليم</h3>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CapacityCard
          title="السعة الإجمالية"
          value={overallStats.total_capacity || 0}
          icon={TruckIcon}
          color="blue"
        />
        <CapacityCard
          title="مستخدم"
          value={overallStats.used_capacity || 0}
          icon={CheckCircleIcon}
          color="green"
        />
        <CapacityCard
          title="متاح"
          value={overallStats.available_capacity || 0}
          icon={ClockIcon}
          color="orange"
        />
      </div>

      {/* Daily Capacity Breakdown */}
      {dailyCapacity.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4">السعة اليومية</h4>
          <div className="space-y-3">
            {dailyCapacity.map((day) => (
              <DailyCapacityCard key={day.date} day={day} />
            ))}
          </div>
        </div>
      )}

      {/* Suggested Time Slots */}
      {suggestedSlots.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4">الأوقات المقترحة</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedSlots.map((slot, index) => (
              <SuggestedSlotCard key={index} slot={slot} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Daily Capacity Card Component
const DailyCapacityCard = ({ day }) => {
  const usagePercentage =
    day.total_capacity > 0 ? (day.used_capacity / day.total_capacity) * 100 : 0;

  const capacityColor =
    deliverySchedulingService.getCapacityColor(usagePercentage);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-900">
          {new Date(day.date).toLocaleDateString("ar-AE")}
        </h5>
        <span className={`text-sm font-semibold ${capacityColor}`}>
          {usagePercentage.toFixed(0)}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            usagePercentage >= 90
              ? "bg-red-500"
              : usagePercentage >= 75
              ? "bg-orange-500"
              : usagePercentage >= 50
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-500">إجمالي:</span>
          <span className="font-medium text-gray-900 mr-2">
            {day.total_capacity}
          </span>
        </div>
        <div>
          <span className="text-gray-500">مستخدم:</span>
          <span className="font-medium text-gray-900 mr-2">
            {day.used_capacity}
          </span>
        </div>
        <div>
          <span className="text-gray-500">متاح:</span>
          <span className="font-medium text-gray-900 mr-2">
            {day.available_capacity}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Suggested Slot Card Component
const SuggestedSlotCard = ({ slot }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-green-50 border border-green-200 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-green-900">
          {new Date(slot.date).toLocaleDateString("ar-AE")}
        </span>
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
      </div>

      <div className="text-sm text-green-800 mb-2">
        {deliverySchedulingService.getTimeSlotInfo(slot.time_slot).label}
      </div>

      <div className="text-sm">
        <span className="text-green-700">متاح: </span>
        <span className="font-medium text-green-900">
          {slot.available_capacity} مكان
        </span>
      </div>
    </motion.div>
  );
};

// Statistics Tab Component
const StatisticsTab = ({ statistics }) => {
  const summary =
    deliverySchedulingService.calculateStatisticsSummary(statistics);
  const timeSlotStats = statistics.time_slot_stats || [];
  const deliveryTypeStats = statistics.delivery_type_stats || [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">إحصائيات التسليم</h3>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الجداول"
          value={summary.total_schedules}
          icon={CalendarIcon}
          color="blue"
        />
        <StatCard
          title="معدل الإنجاز"
          value={`${summary.completion_rate.toFixed(1)}%`}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="معدل الفقدان"
          value={`${summary.missed_rate.toFixed(1)}%`}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`€${summary.total_revenue.toFixed(2)}`}
          icon={TruckIcon}
          color="purple"
        />
      </div>

      {/* Time Slot Statistics */}
      {timeSlotStats.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4">
            إحصائيات الفترات الزمنية
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {timeSlotStats.map((stat) => (
              <TimeSlotStatCard key={stat.time_slot} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/* Delivery Type Statistics */}
      {deliveryTypeStats.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4">إحصائيات أنواع التسليم</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deliveryTypeStats.map((stat) => (
              <DeliveryTypeStatCard key={stat.delivery_type} stat={stat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Performance Tab Component
const PerformanceTab = ({ performance }) => {
  const metrics = performance.performance_metrics || {};
  const trends = performance.trends || [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">تحليل الأداء</h3>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="نقاط الأداء"
          value={`${metrics.overall_score || 0}%`}
          icon={ChartBarIcon}
          color="blue"
        />
        <MetricCard
          title="الدقة في المواعيد"
          value={`${metrics.on_time_percentage || 0}%`}
          icon={ClockIcon}
          color="green"
        />
        <MetricCard
          title="رضا العملاء"
          value={`${metrics.customer_satisfaction || 0}%`}
          icon={CheckCircleIcon}
          color="purple"
        />
        <MetricCard
          title="كفاءة التسليم"
          value={`${metrics.delivery_efficiency || 0}%`}
          icon={TruckIcon}
          color="orange"
        />
      </div>

      {/* Performance Trends */}
      {trends.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4">اتجاهات الأداء</h4>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">رسم بياني لاتجاهات الأداء</p>
            <p className="text-xs text-gray-400 mt-2">
              {trends.length} نقطة بيانات متاحة
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const CapacityCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-4 rounded-lg border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-4 rounded-lg border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-4 rounded-lg border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const TimeSlotStatCard = ({ stat }) => {
  const slotInfo = deliverySchedulingService.getTimeSlotInfo(stat.time_slot);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={`font-medium ${slotInfo.color}`}>
          {slotInfo.icon} {slotInfo.label}
        </span>
        <span className="text-sm text-gray-500">{stat.total_deliveries}</span>
      </div>
      <div className="text-sm text-gray-600">
        معدل النجاح: {stat.success_rate?.toFixed(1)}%
      </div>
    </div>
  );
};

const DeliveryTypeStatCard = ({ stat }) => {
  const typeInfo = deliverySchedulingService.getDeliveryTypeInfo(
    stat.delivery_type
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={`font-medium ${typeInfo.color}`}>
          {typeInfo.icon} {typeInfo.label}
        </span>
        <span className="text-sm text-gray-500">{stat.total_deliveries}</span>
      </div>
      <div className="text-sm text-gray-600">
        الإيرادات: €{stat.total_revenue?.toFixed(2)}
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 space-x-reverse">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        السابق
      </button>

      <span className="px-3 py-2 text-sm text-gray-700">
        الصفحة {currentPage} من {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        التالي
      </button>
    </div>
  );
};

export default DeliverySchedulingPage;
