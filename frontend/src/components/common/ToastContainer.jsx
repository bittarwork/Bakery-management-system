import React from "react";
import Toast from "./Toast";

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col max-w-sm pointer-events-none">
      <div className="flex flex-col space-y-3 pointer-events-auto">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(${index * -2}px) scale(${
                1 - index * 0.02
              })`,
              zIndex: toasts.length - index,
            }}
            className="transition-all duration-300 ease-out"
          >
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
