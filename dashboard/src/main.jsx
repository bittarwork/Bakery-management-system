import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/index.css";
import "./styles/enhanced-ui.css";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <App />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{
              top: 20,
              right: 20,
            }}
            toastOptions={{
              // Define default options
              className: "",
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
              // Default options for specific types
              success: {
                duration: 3000,
                style: {
                  background: "#22c55e",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#22c55e",
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#ef4444",
                },
              },
              loading: {
                duration: Infinity,
                style: {
                  background: "#f97316",
                  color: "#fff",
                },
              },
            }}
          />
        </HelmetProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
