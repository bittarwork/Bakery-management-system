import React, { useState } from "react";

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    siteName: "Bakery Management System",
    currency: "EUR",
    secondaryCurrency: "SYP",
    exchangeRate: "15000",
    theme: "light",
    language: "ar",
    timezone: "Asia/Damascus",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement settings update
    console.log("Form data:", formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              General Settings
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  className="mt-1 input"
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      siteName: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <select
                  className="mt-1 input"
                  value={formData.theme}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, theme: e.target.value }))
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  className="mt-1 input"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                >
                  <option value="ar">Arabic</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  className="mt-1 input"
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                >
                  <option value="Asia/Damascus">Damascus</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date Format
                </label>
                <select
                  className="mt-1 input"
                  value={formData.dateFormat}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateFormat: e.target.value,
                    }))
                  }
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Format
                </label>
                <select
                  className="mt-1 input"
                  value={formData.timeFormat}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timeFormat: e.target.value,
                    }))
                  }
                >
                  <option value="12h">12 Hour</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Currency Settings
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary Currency
                </label>
                <select
                  className="mt-1 input"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US Dollar ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Secondary Currency
                </label>
                <select
                  className="mt-1 input"
                  value={formData.secondaryCurrency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryCurrency: e.target.value,
                    }))
                  }
                >
                  <option value="SYP">Syrian Pound (SYP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exchange Rate
                </label>
                <input
                  type="number"
                  className="mt-1 input"
                  value={formData.exchangeRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      exchangeRate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Notification Settings
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Browser Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Show desktop notifications
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Sound Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Play sound for important notifications
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
