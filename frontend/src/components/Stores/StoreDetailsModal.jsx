import React from "react";
import {
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
} from "@heroicons/react/24/solid";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getLocalizedText,
} from "../../utils/formatters";

const StoreDetailsModal = ({ store, isOpen, onClose }) => {
  if (!isOpen || !store) return null;

  // Get store status info
  const getStoreStatus = (store) => {
    if (!store.is_active) {
      return {
        label: "غير نشط",
        color: "red",
        icon: XCircleIconSolid,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        iconColor: "text-red-500",
      };
    }

    if (store.current_balance > store.credit_limit) {
      return {
        label: "تجاوز الحد الائتماني",
        color: "amber",
        icon: ExclamationTriangleIconSolid,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        iconColor: "text-amber-500",
      };
    }

    return {
      label: "نشط",
      color: "green",
      icon: CheckCircleIconSolid,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconColor: "text-green-500",
    };
  };

  // Get payment method info
  const getPaymentMethodInfo = (method) => {
    const methods = {
      cash: { label: "نقدي", color: "green", icon: BanknotesIcon },
      bank: { label: "بنكي", color: "blue", icon: CreditCardIcon },
      mixed: { label: "مختلط", color: "purple", icon: CreditCardIcon },
    };
    return methods[method] || methods.cash;
  };

  const status = getStoreStatus(store);
  const paymentMethod = getPaymentMethodInfo(store.payment_method);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} mt-1`}
              >
                <status.icon className={`w-3 h-3 ml-1 ${status.iconColor}`} />
                {status.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 ml-2 text-gray-500" />
                  المعلومات الأساسية
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المحل
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                      {store.name}
                    </p>
                  </div>

                  {store.owner_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم المالك
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {store.owner_name}
                      </p>
                    </div>
                  )}

                  {store.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهاتف
                      </label>
                      <div className="flex items-center text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        <PhoneIcon className="w-4 h-4 ml-2 text-gray-400" />
                        <a
                          href={`tel:${store.phone}`}
                          className="hover:text-blue-600"
                        >
                          {store.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {store.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        البريد الإلكتروني
                      </label>
                      <div className="flex items-center text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        <EnvelopeIcon className="w-4 h-4 ml-2 text-gray-400" />
                        <a
                          href={`mailto:${store.email}`}
                          className="hover:text-blue-600"
                        >
                          {store.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {store.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العنوان
                      </label>
                      <div className="flex items-start text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        <MapPinIcon className="w-4 h-4 ml-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span>{store.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              {store.latitude && store.longitude && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="w-5 h-5 ml-2 text-gray-500" />
                    الموقع الجغرافي
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        خط العرض
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {parseFloat(store.latitude).toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        خط الطول
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {parseFloat(store.longitude).toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a
                      href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MapPinIcon className="w-4 h-4 ml-2" />
                      عرض على الخريطة
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BanknotesIcon className="w-5 h-5 ml-2 text-gray-500" />
                  المعلومات المالية
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      طريقة الدفع
                    </label>
                    <div className="flex items-center">
                      <div
                        className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-${paymentMethod.color}-100 text-${paymentMethod.color}-700`}
                      >
                        <paymentMethod.icon
                          className={`w-4 h-4 ml-2 text-${paymentMethod.color}-600`}
                        />
                        {paymentMethod.label}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الرصيد الحالي
                      </label>
                      <p
                        className={`text-lg font-bold px-3 py-2 rounded-md ${
                          store.current_balance > 0
                            ? "text-red-600 bg-red-50"
                            : store.current_balance < 0
                            ? "text-green-600 bg-green-50"
                            : "text-gray-900 bg-gray-50"
                        }`}
                      >
                        {formatCurrency(store.current_balance)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحد الائتماني
                      </label>
                      <p className="text-lg font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {formatCurrency(store.credit_limit)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الرصيد المتاح
                    </label>
                    <p
                      className={`text-lg font-bold px-3 py-2 rounded-md ${
                        store.credit_limit - store.current_balance > 0
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {formatCurrency(
                        store.credit_limit - store.current_balance
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 ml-2 text-gray-500" />
                  معلومات إضافية
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ الإنشاء
                    </label>
                    <div className="flex items-center text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                      <CalendarIcon className="w-4 h-4 ml-2 text-gray-400" />
                      {formatDate(store.created_at)}
                    </div>
                  </div>

                  {store.updated_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        آخر تحديث
                      </label>
                      <div className="flex items-center text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        <ClockIcon className="w-4 h-4 ml-2 text-gray-400" />
                        {formatDate(store.updated_at)}
                      </div>
                    </div>
                  )}

                  {store.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ملاحظات
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md whitespace-pre-wrap">
                        {store.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 space-x-reverse">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsModal;
