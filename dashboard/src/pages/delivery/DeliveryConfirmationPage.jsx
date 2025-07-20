/**
 * Delivery Confirmation Page
 * Customer-facing page for confirming delivery appointments
 * Accessible via token link sent to customers
 */

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  TruckIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Services
import deliverySchedulingService from "../../services/deliverySchedulingService";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

const DeliveryConfirmationPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");

  useEffect(() => {
    loadScheduleData();
  }, [token]);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await deliverySchedulingService.getDeliveryScheduleByToken(token);

      if (response.success) {
        setSchedule(response.data);
        setConfirmed(response.data.status === "confirmed");
      } else {
        setError(response.message || "فشل في تحميل بيانات التسليم");
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async () => {
    if (!schedule || confirmed) return;

    try {
      setConfirming(true);

      const response = await deliverySchedulingService.confirmDeliverySchedule(
        token,
        customerNotes
      );

      if (response.success) {
        setConfirmed(true);
        toast.success("تم تأكيد موعد التسليم بنجاح");
        // Update schedule status locally
        setSchedule((prev) => ({
          ...prev,
          status: "confirmed",
          customer_notes: customerNotes,
        }));
      } else {
        toast.error(response.message || "فشل في تأكيد الموعد");
      }
    } catch (error) {
      console.error("Error confirming schedule:", error);
      toast.error("خطأ في تأكيد الموعد");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="2xl" text="جاري تحميل بيانات التسليم..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              خطأ في التحميل
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadScheduleData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <ExclamationTriangleIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              الرابط غير صحيح
            </h1>
            <p className="text-gray-600 mb-6">
              الرابط المستخدم غير صحيح أو منتهي الصلاحية
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TruckIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            تأكيد موعد التسليم
          </h1>
          <p className="text-gray-600">
            يرجى مراجعة تفاصيل التسليم وتأكيد الموعد
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Status Banner */}
          <div className={`px-6 py-4 ${statusInfo.bgColor} border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-2xl">{statusInfo.icon}</span>
                <div>
                  <h2 className={`font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </h2>
                  <p className={`text-sm ${statusInfo.color} opacity-80`}>
                    طلب #{schedule.order_number}
                  </p>
                </div>
              </div>

              {confirmed && (
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 ml-2" />
                  معلومات التسليم
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">التاريخ:</span>
                      <span className="mr-2">
                        {new Date(schedule.scheduled_date).toLocaleDateString(
                          "ar-AE",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 space-x-reverse">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">الوقت:</span>
                      <span className="mr-2">
                        {schedule.scheduled_time_start} -{" "}
                        {schedule.scheduled_time_end}
                      </span>
                      <span
                        className={`mr-2 px-2 py-1 rounded-full text-xs ${slotInfo.bgColor} ${slotInfo.color}`}
                      >
                        {slotInfo.icon} {slotInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 space-x-reverse">
                    <TruckIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">نوع التسليم:</span>
                      <span
                        className={`mr-2 px-2 py-1 rounded-full text-xs ${typeInfo.bgColor} ${typeInfo.color}`}
                      >
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    </div>
                  </div>

                  {schedule.delivery_fee_eur > 0 && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <span className="text-gray-400">€</span>
                      </div>
                      <div>
                        <span className="font-medium">رسوم التسليم:</span>
                        <span className="mr-2 font-semibold text-green-600">
                          €{parseFloat(schedule.delivery_fee_eur).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 ml-2" />
                  معلومات الاتصال
                </h3>

                <div className="space-y-3">
                  {schedule.contact_person && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium">الاسم:</span>
                        <span className="mr-2">{schedule.contact_person}</span>
                      </div>
                    </div>
                  )}

                  {schedule.contact_phone && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium">الهاتف:</span>
                        <span className="mr-2" dir="ltr">
                          {schedule.contact_phone}
                        </span>
                      </div>
                    </div>
                  )}

                  {schedule.delivery_address && (
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-medium">العنوان:</span>
                        <p className="mr-2 text-gray-700 leading-relaxed">
                          {schedule.delivery_address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Instructions */}
            {schedule.delivery_instructions && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  تعليمات التسليم:
                </h4>
                <p className="text-blue-800 text-sm">
                  {schedule.delivery_instructions}
                </p>
              </div>
            )}

            {/* Customer Notes Section */}
            {!confirmed && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية (اختياري):
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أي ملاحظات أو تعليمات إضافية..."
                />
              </div>
            )}

            {/* Customer Notes Display (if confirmed) */}
            {confirmed && schedule.customer_notes && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">ملاحظاتك:</h4>
                <p className="text-green-800 text-sm">
                  {schedule.customer_notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            {!confirmed ? (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  بتأكيد هذا الموعد، أنت توافق على استلام طلبك في الوقت المحدد
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmation}
                  disabled={confirming}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  {confirming ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>جاري التأكيد...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>تأكيد الموعد</span>
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600 mb-2">
                  <CheckCircleIcon className="w-6 h-6 ml-2" />
                  <span className="font-semibold">تم تأكيد الموعد بنجاح</span>
                </div>
                <p className="text-sm text-gray-600">
                  ستتم مراسلتك قبل موعد التسليم. شكراً لك!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          <p>في حالة وجود أي استفسار، يرجى الاتصال بنا</p>
        </motion.div>
      </div>
    </div>
  );
};

export default DeliveryConfirmationPage;
