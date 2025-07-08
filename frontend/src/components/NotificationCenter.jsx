import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import notificationAPI from "../services/notificationAPI";

const NotificationCenter = ({ isOpen, onClose, className = "" }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, priority
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // تحميل الإشعارات من API
  const loadNotifications = async (resetPage = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const response = await notificationAPI.getNotifications({
        page: currentPage,
        limit: 20,
        filter,
        sortBy,
      });

      if (response.success) {
        const newNotifications = response.data.notifications || [];

        // تطبيع البيانات - التأكد من وجود id
        const normalizedNotifications = newNotifications.map(
          (notification, index) => ({
            ...notification,
            _id:
              notification._id ||
              notification.id ||
              `temp-${index}-${Date.now()}`,
            id:
              notification.id ||
              notification._id ||
              `temp-${index}-${Date.now()}`,
          })
        );

        if (resetPage) {
          setNotifications(normalizedNotifications);
          setPage(1);
        } else {
          setNotifications((prev) => [...prev, ...normalizedNotifications]);
        }

        setStats({
          total: response.data.pagination.total || 0,
          unread: response.data.unreadCount || 0,
          read:
            (response.data.pagination.total || 0) -
            (response.data.unreadCount || 0),
        });

        setHasMore(currentPage < response.data.pagination.pages);
        if (!resetPage) {
          setPage((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("خطأ في تحميل الإشعارات:", error);
      toast.error("خطأ في تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  // تحميل الإشعارات عند فتح المركز أو تغيير الفلاتر
  useEffect(() => {
    if (isOpen) {
      loadNotifications(true);
    }
  }, [isOpen, filter, sortBy]);

  // إغلاق عند النقر خارج المكون
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // تعيين إشعار كمقروء
  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      toast.error("معرف الإشعار غير صحيح");
      return;
    }

    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          (notification._id || notification.id) === notificationId
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      setStats((prev) => ({
        ...prev,
        unread: prev.unread > 0 ? prev.unread - 1 : 0,
        read: prev.read + 1,
      }));
      toast.success("تم تعيين الإشعار كمقروء");
    } catch (error) {
      console.error("خطأ في تعيين الإشعار كمقروء:", error);
      toast.error("خطأ في تعيين الإشعار كمقروء");
    }
  };

  // تعيين إشعار كغير مقروء
  const markAsUnread = async (notificationId) => {
    if (!notificationId) {
      toast.error("معرف الإشعار غير صحيح");
      return;
    }

    try {
      await notificationAPI.markAsUnread(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          (notification._id || notification.id) === notificationId
            ? { ...notification, isRead: false, readAt: null }
            : notification
        )
      );
      setStats((prev) => ({
        ...prev,
        unread: prev.unread + 1,
        read: prev.read > 0 ? prev.read - 1 : 0,
      }));
      toast.success("تم تعيين الإشعار كغير مقروء");
    } catch (error) {
      console.error("خطأ في تعيين الإشعار كغير مقروء:", error);
      toast.error("خطأ في تعيين الإشعار كغير مقروء");
    }
  };

  // تعيين جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
            readAt: new Date(),
          }))
        );
        setStats((prev) => ({ ...prev, unread: 0, read: prev.total }));
        toast.success(`تم تعيين ${response.modifiedCount} إشعار كمقروء`);
      }
    } catch (error) {
      console.error("خطأ في تعيين جميع الإشعارات كمقروءة:", error);
      toast.error("خطأ في تعيين جميع الإشعارات كمقروءة");
    }
  };

  // حذف إشعار
  const deleteNotification = async (notificationId) => {
    if (!notificationId) {
      toast.error("معرف الإشعار غير صحيح");
      return;
    }

    try {
      await notificationAPI.deleteNotification(notificationId);
      const deletedNotification = notifications.find(
        (n) => (n._id || n.id) === notificationId
      );
      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            (notification._id || notification.id) !== notificationId
        )
      );

      if (deletedNotification) {
        setStats((prev) => ({
          total: prev.total - 1,
          unread: deletedNotification.isRead ? prev.unread : prev.unread - 1,
          read: deletedNotification.isRead ? prev.read - 1 : prev.read,
        }));
      }

      toast.success("تم حذف الإشعار");
    } catch (error) {
      console.error("خطأ في حذف الإشعار:", error);
      toast.error("خطأ في حذف الإشعار");
    }
  };

  // حذف جميع الإشعارات
  const clearAllNotifications = async () => {
    if (notifications.length === 0) {
      toast.info("لا توجد إشعارات للحذف");
      return;
    }

    if (!confirm("هل أنت متأكد من حذف جميع الإشعارات؟")) return;

    try {
      const response = await notificationAPI.clearAllNotifications();
      if (response.success) {
        setNotifications([]);
        setStats({ total: 0, unread: 0, read: 0 });
        toast.success(
          `تم حذف ${response.deletedCount || notifications.length} إشعار`
        );
      }
    } catch (error) {
      console.error("خطأ في حذف جميع الإشعارات:", error);
      toast.error("خطأ في حذف جميع الإشعارات");
    }
  };

  // التعامل مع النقر على الإشعار
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id || notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  // تحميل المزيد من الإشعارات
  const loadMore = () => {
    if (hasMore && !loading) {
      loadNotifications(false);
    }
  };

  // الحصول على عدد الإشعارات حسب الفلتر
  const getFilterCount = (filterType) => {
    switch (filterType) {
      case "unread":
        return stats.unread;
      case "read":
        return stats.read;
      default:
        return stats.total;
    }
  };

  // تنسيق الوقت
  const formatTime = (timestamp) => {
    return notificationAPI.formatNotificationTime(timestamp);
  };

  // الحصول على لون النوع
  const getTypeColor = (type) => {
    const colorMap = {
      order: "text-green-600 dark:text-green-400",
      inventory: "text-orange-600 dark:text-orange-400",
      delivery: "text-blue-600 dark:text-blue-400",
      payment: "text-purple-600 dark:text-purple-400",
      system: "text-gray-600 dark:text-gray-400",
      customer: "text-indigo-600 dark:text-indigo-400",
    };
    return colorMap[type] || "text-gray-600 dark:text-gray-400";
  };

  // عرض البيانات الإضافية
  const renderMetadata = (notification) => {
    if (!notification.metadata) return null;

    const { type, metadata } = notification;

    switch (type) {
      case "order":
        return (
          <span>
            رقم الطلب: {metadata.orderNumber} • المبلغ: {metadata.totalAmount}{" "}
            ريال
          </span>
        );
      case "inventory":
        return (
          <span>
            متبقي: {metadata.currentStock} من {metadata.minStock}
          </span>
        );
      case "payment":
        return (
          <span>
            المبلغ: {metadata.amount} ريال • {metadata.paymentMethod}
          </span>
        );
      case "delivery":
        return <span>العميل: {metadata.customerName}</span>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none z-50 max-h-96 overflow-hidden border dark:border-gray-700">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              الإشعارات
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stats.unread} غير مقروء
              </span>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex justify-between items-center space-x-2">
            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {[
                { key: "all", label: "الكل" },
                { key: "unread", label: "غير مقروء" },
                { key: "read", label: "مقروء" },
              ].map((tab, index) => (
                <button
                  key={`${tab.key}-${index}`}
                  onClick={() => setFilter(tab.key)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    filter === tab.key
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                  }`}
                >
                  {tab.label} ({getFilterCount(tab.key)})
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="priority">الأولوية</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-3">
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                disabled={loading}
              >
                تعيين الكل كمقروء
              </button>
            )}

            {stats.total > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium disabled:opacity-50"
                disabled={loading}
              >
                حذف الكل
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">
                جاري تحميل الإشعارات...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg
                className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p>لا توجد إشعارات</p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mt-2"
                >
                  عرض جميع الإشعارات
                </button>
              )}
            </div>
          ) : (
            <>
              {notifications.map((notification, index) => (
                <div
                  key={
                    notification._id ||
                    notification.id ||
                    `notification-${index}`
                  }
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors relative ${
                    !notification.isRead
                      ? "bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500 dark:border-blue-400"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Priority Indicator */}
                  {notification.priority === "high" && (
                    <div className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div
                      className={`text-2xl ${getTypeColor(
                        notification.type
                      )} flex-shrink-0`}
                    >
                      {notification.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              !notification.isRead
                                ? "text-gray-900 dark:text-gray-100"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Metadata */}
                          {notification.metadata && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {renderMetadata(notification)}
                            </div>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.isRead
                              ? markAsUnread(
                                  notification._id || notification.id
                                )
                              : markAsRead(notification._id || notification.id);
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          {notification.isRead
                            ? "تعيين كغير مقروء"
                            : "تعيين كمقروء"}
                        </button>

                        <span className="text-gray-300 dark:text-gray-600">
                          |
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(
                              notification._id || notification.id
                            );
                          }}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="p-4 text-center border-b border-gray-100 dark:border-gray-700">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                  >
                    {loading ? "جاري التحميل..." : "تحميل المزيد"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <button
            onClick={() => {
              navigate("/notifications");
              onClose();
            }}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
          >
            عرض جميع الإشعارات
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
