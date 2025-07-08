import React from "react";

// A reusable page header to unify title, subtitle, icon and optional actions.
// Props:
//   icon:   React component (Lucide/HeroIcon) to display on left side
//   title:  string – already localized text to display as main heading
//   subtitle: string (optional) – secondary description line
//   children: ReactNode – optional actions (e.g., buttons) to render on the right side
//   className: additional utility classes for root wrapper
// Usage:
//   <PageHeader icon={Package} title="إدارة المنتجات" subtitle="..."> ...actions... </PageHeader>
const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center justify-between ${className}`}
    >
      <div className="flex items-start">
        {Icon && (
          <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400 ml-3" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center space-x-3 space-x-reverse">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
