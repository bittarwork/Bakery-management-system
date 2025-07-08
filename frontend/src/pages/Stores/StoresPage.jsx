import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { Store } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StoresList from "./StoresList";
import StoresDashboard from "./StoresDashboard";

import { getLocalizedText } from "../../utils/formatters";

const tabClass = (selected) =>
  `px-4 py-2 text-sm font-medium focus:outline-none border-b-2 transition-colors duration-200 ${
    selected
      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
      : "border-transparent text-gray-600 hover:text-blue-600 dark:text-gray-300"
  }`;

const StoresPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Default tab selection
  useEffect(() => {
    const view = "grid"; // Default view
    // table / list = index 0 (القائمة), grid = index 0 as list, map preference could be custom
    if (view === "grid") {
      setSelectedIndex(0);
    } else if (view === "table" || view === "list") {
      setSelectedIndex(0);
    }
    // in future: 'map' to index 1
  }, []);

  const t = (key, ar, en) => getLocalizedText(key, ar, en);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Unified Page Header */}
        <PageHeader
          className="mb-6"
          icon={Store}
          title={t("stores_management", "إدارة المحلات", "Stores Management")}
          subtitle={t(
            "stores_page_subtitle",
            "عرض وإدارة جميع المحلات مع الإحصائيات والخريطة التفاعلية",
            "View and manage all stores with interactive map and statistics"
          )}
        />

        {/* Tabs */}
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <Tab className={({ selected }) => tabClass(selected)}>
              {t("list", "القائمة", "List")}
            </Tab>
            <Tab className={({ selected }) => tabClass(selected)}>
              {t("map", "الخريطة", "Map")}
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-6">
            <Tab.Panel>
              {/* Stores List */}
              <StoresList />
            </Tab.Panel>

            <Tab.Panel>
              {/* Stores Dashboard with Map & Stats */}
              <StoresDashboard />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default StoresPage;
