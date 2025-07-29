import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";

const Breadcrumb = () => {
  const location = useLocation();

  // Breadcrumb translation mapping
  const breadcrumbTranslations = {
    "/dashboard": "الرئيسية",
    "/analytics": "التحليلات",
    "/orders": "الطلبات",
    "/orders/create": "إنشاء طلب",
    "/stores": "المتاجر",
    "/stores/create": "إضافة متجر",
    "/products": "المنتجات",
    "/products/create": "إضافة منتج",
    "/users": "المستخدمين",
    "/users/create": "إضافة مستخدم",
    "/vehicles": "المركبات",
    "/vehicles/add": "إضافة مركبة",
    "/vehicles/edit": "تعديل المركبة",
    "/reports": "التقارير",
    "/reports/daily": "التقارير اليومية",
    "/reports/monthly": "التقارير الشهرية",
    "/reports/yearly": "التقارير السنوية",
    "/settings": "الإعدادات",
    "/settings/profile": "الملف الشخصي",
    "/settings/general": "الإعدادات العامة",
    "/ai-chat": "المساعد الذكي",
    "/pricing": "التسعير",
    edit: "تعديل",
    details: "التفاصيل",
  };

  // Get path segments
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show breadcrumb on dashboard home
  if (location.pathname === "/dashboard") {
    return null;
  }

  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      {
        name: "الرئيسية",
        path: "/dashboard",
        icon: Home,
      },
    ];

    let currentPath = "";
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip 'dashboard' segment as it's already included as home
      if (segment === "dashboard") return;

      const name = breadcrumbTranslations[currentPath] || segment;
      const isLast = index === pathnames.length - 1;

      breadcrumbs.push({
        name,
        path: currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index > 0 && (
            <ChevronLeft className="h-4 w-4 mx-2 text-gray-400 rotate-180" />
          )}

          {breadcrumb.isLast ? (
            <span className="font-medium text-gray-900 flex items-center">
              {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4 ml-2" />}
              {breadcrumb.name}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="hover:text-blue-600 transition-colors flex items-center hover:underline"
            >
              {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4 ml-2" />}
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
