import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState(0);
  const toastRef = useRef(null);

  useEffect(() => {
    // ظهور التوست مع انيميشن
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // إعداد التايمر للاختفاء
    const duration = toast.duration || 5000;
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    // إعداد شريط التقدم
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 100);
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(progressInterval);
    };
  }, [toast.duration]);

  const handleClose = () => {
    setIsVisible(false);
    // انتظار انتهاء انيميشن الاختفاء
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  // دوال السحب والإفلات
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const deltaX = clientX - startX;
    setDragX(Math.min(0, deltaX)); // السماح بالسحب فقط إلى اليسار
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // إذا تم السحب أكثر من 150px إلى اليسار، احذف التوست
    if (dragX < -150) {
      handleClose();
    } else {
      // إعادة التوست إلى موضعه الأصلي
      setDragX(0);
    }
  };

  // أحداث الماوس
  const handleMouseDown = (e) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // أحداث اللمس
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // إضافة مستمعي الأحداث للماوس
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, startX]);

  const getToastConfig = () => {
    const configs = {
      success: {
        bg: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
        border: "border-emerald-300",
        icon: CheckCircle,
        iconColor: "text-white",
        textColor: "text-white",
        progressBar: "bg-emerald-200",
        shadow: "shadow-emerald-500/25",
        glow: "shadow-emerald-400/50",
      },
      error: {
        bg: "bg-gradient-to-br from-red-500 via-rose-500 to-pink-600",
        border: "border-red-300",
        icon: AlertCircle,
        iconColor: "text-white",
        textColor: "text-white",
        progressBar: "bg-red-200",
        shadow: "shadow-red-500/25",
        glow: "shadow-red-400/50",
      },
      warning: {
        bg: "bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600",
        border: "border-amber-300",
        icon: AlertTriangle,
        iconColor: "text-white",
        textColor: "text-white",
        progressBar: "bg-amber-200",
        shadow: "shadow-amber-500/25",
        glow: "shadow-amber-400/50",
      },
      info: {
        bg: "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600",
        border: "border-blue-300",
        icon: Info,
        iconColor: "text-white",
        textColor: "text-white",
        progressBar: "bg-blue-200",
        shadow: "shadow-blue-500/25",
        glow: "shadow-blue-400/50",
      },
    };
    return configs[toast.type] || configs.info;
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  // حساب التحويل والشفافية بناءً على السحب
  const dragOpacity = isDragging ? Math.max(0.5, 1 + dragX / 300) : 1;
  const dragScale = isDragging ? Math.max(0.95, 1 + dragX / 1000) : 1;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-3
        ${
          isVisible
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }
      `}
    >
      <div
        ref={toastRef}
        className={`
          relative max-w-md w-full ${config.bg} ${config.border}
          border-2 shadow-xl ${config.shadow} rounded-xl pointer-events-auto
          ring-1 ring-white/20 overflow-hidden backdrop-blur-sm
          ${
            isDragging
              ? "cursor-grabbing shadow-2xl"
              : "cursor-grab hover:shadow-2xl"
          }
          hover:scale-[1.02] transition-all duration-300 ease-out
          ${isDragging ? config.glow : ""}
        `}
        style={{
          transform: `translateX(${dragX}px) scale(${dragScale})`,
          opacity: dragOpacity,
          transition: isDragging
            ? "none"
            : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* مؤشر السحب المحسن */}
        {isDragging && dragX < -30 && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <div
              className={`
              flex items-center justify-center w-10 h-10 rounded-full 
              backdrop-blur-md transition-all duration-200
              ${
                dragX < -150
                  ? "bg-red-500/80 scale-110 shadow-lg shadow-red-500/50"
                  : "bg-white/30 scale-100"
              }
            `}
            >
              <X
                className={`w-5 h-5 text-white transition-transform duration-200 ${
                  dragX < -150 ? "scale-110" : "scale-100"
                }`}
              />
            </div>
            {dragX < -150 && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  اتركه للحذف
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <IconComponent
                  className={`h-5 w-5 ${config.iconColor}`}
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="mr-4 w-0 flex-1 pt-1">
              <p
                className={`text-sm font-semibold ${config.textColor} leading-relaxed`}
              >
                {toast.message}
              </p>
            </div>
            <div className="mr-2 flex-shrink-0 flex">
              <button
                className={`
                  w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm
                  flex items-center justify-center
                  ${config.textColor} hover:bg-white/30 focus:outline-none 
                  focus:bg-white/30 transition-all duration-200
                  hover:scale-110 active:scale-95
                `}
                onClick={handleClose}
              >
                <span className="sr-only">إغلاق</span>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* شريط التقدم المحسن */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-black/10 w-full rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${config.progressBar} transition-all duration-100 ease-linear relative overflow-hidden`}
            style={{ width: `${progress}%` }}
          >
            {/* تأثير اللمعان على شريط التقدم */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* تأثير اللمعان المحسن */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* تأثير الحدود المتوهجة */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
      </div>
    </div>
  );
};

export default Toast;
