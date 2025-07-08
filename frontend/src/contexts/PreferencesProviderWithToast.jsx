import React from "react";
import { PreferencesProvider as OriginalPreferencesProvider } from "./PreferencesContext";
import useGlobalToast from "../hooks/useGlobalToast";

// Wrapper component that provides toast to PreferencesProvider
export const PreferencesProviderWithToast = ({ children, ...props }) => {
  const toast = useGlobalToast();

  // تمرير toast كـ prop إضافي
  return (
    <OriginalPreferencesProvider {...props} toast={toast}>
      {children}
    </OriginalPreferencesProvider>
  );
};

export default PreferencesProviderWithToast;
