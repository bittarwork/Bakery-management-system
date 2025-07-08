import React, { useState, useEffect } from "react";
import { FiX, FiAlertTriangle, FiTrash2, FiInfo } from "react-icons/fi";
import { deleteStore } from "../../services/storesAPI";
import { useToastContext } from "../common";

const DeleteConfirmModal = ({ isOpen, onClose, store, onSuccess }) => {
  const toast = useToastContext();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Reset confirm text when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
    }
  }, [isOpen]);

  if (!isOpen || !store) return null;

  const handleDelete = async () => {
    if (confirmText.trim() !== store.name.trim()) {
      toast.error("يرجى كتابة اسم المحل بشكل صحيح للتأكيد");
      return;
    }

    setLoading(true);
    try {
      await deleteStore(store.id);
      toast.success("تم حذف المحل بنجاح");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error(error.response?.data?.message || "فشل في حذف المحل");
    } finally {
      setLoading(false);
    }
  };

  const isConfirmValid = confirmText.trim() === store.name.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              تأكيد حذف المحل
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3 space-x-reverse">
              <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  تحذير: هذا الإجراء لا يمكن التراجع عنه
                </h4>
                <p className="text-sm text-red-700">
                  سيتم حذف جميع البيانات المرتبطة بهذا المحل نهائياً
                </p>
              </div>
            </div>
          </div>

          {/* Store Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-3">
              <FiInfo className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                معلومات المحل المراد حذفه:
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">الاسم:</span>
                <span className="text-sm font-medium text-gray-900">
                  {store.name}
                </span>
              </div>
              {store.owner_name && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">المالك:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {store.owner_name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">الحالة:</span>
                <span
                  className={`text-sm font-medium ${
                    store.is_active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {store.is_active ? "نشط" : "غير نشط"}
                </span>
              </div>
              {store.current_balance &&
                parseFloat(store.current_balance) !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">الرصيد:</span>
                    <span
                      className={`text-sm font-medium ${
                        parseFloat(store.current_balance) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {parseFloat(store.current_balance).toFixed(2)} د.ج
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                للتأكيد، اكتب اسم المحل في الحقل أدناه:
              </label>
              <button
                type="button"
                onClick={() => setConfirmText(store.name)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                disabled={loading}
              >
                نسخ الاسم
              </button>
            </div>
            <div className="bg-gray-100 p-2 rounded mb-2 border">
              <span className="text-sm font-mono text-gray-800 select-all">
                {store.name}
              </span>
            </div>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="اكتب اسم المحل هنا..."
              disabled={loading}
            />
            {confirmText && !isConfirmValid && (
              <p className="text-sm text-red-600 mt-1">
                الاسم المدخل لا يطابق اسم المحل
              </p>
            )}
            {isConfirmValid && (
              <p className="text-sm text-green-600 mt-1">✓ الاسم متطابق</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={handleDelete}
              disabled={!isConfirmValid || loading}
              className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-medium transition-all ${
                isConfirmValid && !loading
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الحذف...</span>
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4" />
                  <span>حذف المحل نهائياً</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
