import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SessionManager from "../SessionManager";
import { usePreferences } from "../../contexts";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionManagerOpen, setSessionManagerOpen] = useState(false);
  const { preferences } = usePreferences();

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSessionManagerOpen = () => {
    setSessionManagerOpen(true);
  };

  const handleSessionManagerClose = () => {
    setSessionManagerOpen(false);
  };

  // Apply theme classes
  const themeClasses =
    preferences?.general?.theme === "dark"
      ? "bg-gray-900 text-white"
      : "bg-gray-50 text-gray-900";

  return (
    <div className={`flex h-screen ${themeClasses}`} dir="rtl">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        preferences={preferences}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={handleMenuClick}
          onSessionManagerOpen={handleSessionManagerOpen}
          preferences={preferences}
        />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Session Manager Modal */}
      {sessionManagerOpen && (
        <SessionManager onClose={handleSessionManagerClose} />
      )}
    </div>
  );
};

export default Layout;
