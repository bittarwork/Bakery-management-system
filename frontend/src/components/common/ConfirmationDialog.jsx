import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  Loader,
  AlertCircle,
} from "lucide-react";

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info", // 'info', 'warning', 'danger', 'success'
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  isLoading = false,
  icon: CustomIcon,
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    const configs = {
      info: {
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
        icon: CheckCircle,
      },
      warning: {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        buttonColor: "bg-yellow-600 hover:bg-yellow-700",
        icon: AlertTriangle,
      },
      danger: {
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        buttonColor: "bg-red-600 hover:bg-red-700",
        icon: Trash2,
      },
      success: {
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        buttonColor: "bg-green-600 hover:bg-green-700",
        icon: CheckCircle,
      },
    };
    return configs[type] || configs.info;
  };

  const config = getTypeConfig();
  const IconComponent = CustomIcon || config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
        <div className="p-6">
          <div className="text-center">
            {/* Icon */}
            <div
              className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${config.bgColor}`}
            >
              <IconComponent className={`h-8 w-8 ${config.textColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-colors ${config.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>جاري المعالجة...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
