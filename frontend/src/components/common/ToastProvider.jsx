import React, { createContext, useContext } from "react";
import useToast from "../../hooks/useToast";
import ToastContainer from "./ToastContainer";

const ToastContext = createContext();

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext يجب أن يكون داخل ToastProvider");
  }
  return context;
};

const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
