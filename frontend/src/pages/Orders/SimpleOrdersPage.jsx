import React, { useState, useEffect } from "react";
import { ClipboardList, Plus, RefreshCw } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { Button, useToastContext } from "../../components/common";

import { getLocalizedText, formatCurrency } from "../../utils/formatters";

const SimpleOrdersPage = () => {
  // Preferences

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToastContext();

  // دالة تحميل الطلبات بسيطة ومستقرة
  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      toast.info(
        getLocalizedText(
          "loading_orders",
          "جاري تحميل الطلبات...",
          "Loading orders..."
        )
      );

      // محاكاة تحميل الطلبات
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // بيانات وهمية للطلبات
      const mockOrders = [
        {
          id: 1,
          order_number: "ORD-001",
          customer_name: getLocalizedText(
            "customer_name_1",
            "أحمد محمد",
            "Ahmed Mohamed"
          ),
          total: 150.0,
          status: "pending",
          created_at: "2024-01-15T10:30:00",
        },
        {
          id: 2,
          order_number: "ORD-002",
          customer_name: getLocalizedText(
            "customer_name_2",
            "فاطمة علي",
            "Fatima Ali"
          ),
          total: 200.5,
          status: "confirmed",
          created_at: "2024-01-15T11:45:00",
        },
        {
          id: 3,
          order_number: "ORD-003",
          customer_name: getLocalizedText(
            "customer_name_3",
            "خالد سالم",
            "Khalid Salem"
          ),
          total: 75.25,
          status: "delivered",
          created_at: "2024-01-15T14:20:00",
        },
      ];

      setOrders(mockOrders);
      toast.success(
        getLocalizedText(
          "orders_loaded_success",
          `تم تحميل ${mockOrders.length} طلب بنجاح`,
          `Successfully loaded ${mockOrders.length} orders`
        )
      );
    } catch (err) {
      const errorMsg = getLocalizedText(
        "load_orders_error",
        "فشل في تحميل الطلبات",
        "Failed to load orders"
      );
      setError(errorMsg);
      toast.error(
        getLocalizedText(
          "load_orders_error_toast",
          "حدث خطأ أثناء تحميل الطلبات",
          "Error occurred while loading orders"
        )
      );
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // تحميل الطلبات عند تحميل الصفحة فقط
  useEffect(() => {
    loadOrders();
  }, []); // مصفوفة dependencies فارغة لتشغيل مرة واحدة فقط

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        text: getLocalizedText("status_pending", "في الانتظار", "Pending"),
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800",
        text: getLocalizedText("status_confirmed", "مؤكد", "Confirmed"),
      },
      delivered: {
        color: "bg-green-100 text-green-800",
        text: getLocalizedText("status_delivered", "تم التسليم", "Delivered"),
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        text: getLocalizedText("status_cancelled", "ملغي", "Cancelled"),
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClipboardList className="h-5 w-5 text-red-400" />
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-medium text-red-800">
                {getLocalizedText(
                  "orders_load_error",
                  "خطأ في تحميل الطلبات",
                  "Error Loading Orders"
                )}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadOrders}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {getLocalizedText("retry", "إعادة المحاولة", "Retry")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      {/* Unified Page Header */}
      <PageHeader
        className="mb-6"
        icon={ClipboardList}
        title={getLocalizedText(
          "orders_management",
          "إدارة الطلبات",
          "Orders Management"
        )}
        subtitle={getLocalizedText(
          "view_manage_orders",
          "عرض وإدارة جميع الطلبات",
          "View and manage all orders"
        )}
      >
        <Button
          variant="outline"
          icon={RefreshCw}
          size="md"
          disabled={loading}
          onClick={loadOrders}
          className={loading ? "animate-pulse" : ""}
        >
          {getLocalizedText("refresh", "تحديث", "Refresh")}
        </Button>

        <Button variant="primary" icon={Plus} size="md" disabled={loading}>
          {getLocalizedText("new_order", "طلب جديد", "New Order")}
        </Button>
      </PageHeader>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-gray-600 dark:text-gray-400">
            {getLocalizedText("loading", "جاري التحميل...", "Loading...")}
          </span>
        </div>
      )}

      {/* Orders List */}
      {!loading && orders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <li key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.order_number}
                        </p>
                        <div className="mr-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getLocalizedText("customer", "العميل:", "Customer:")}{" "}
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {getLocalizedText("date", "التاريخ:", "Date:")}{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            true // Default to Arabic
                              ? "ar-SA"
                              : "en-US"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="text-left ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {getLocalizedText("no_orders", "لا توجد طلبات", "No Orders")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {getLocalizedText(
              "no_orders_description",
              "ابدأ بإنشاء طلب جديد",
              "Start by creating a new order"
            )}
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                toast.success(
                  getLocalizedText(
                    "new_order_success",
                    "تم إنشاء طلب جديد بنجاح! 🎉",
                    "New order created successfully! 🎉"
                  )
                );
              }}
            >
              <Plus className="h-4 w-4 ml-2" />
              {getLocalizedText("new_order", "طلب جديد", "New Order")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleOrdersPage;
