import {
  Package,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import { productService } from "../../services/productService";

const ProductStatistics = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 animate-pulse"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full ml-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const stats = [
    {
      title: "إجمالي المنتجات",
      value: statistics.total || 0,
      icon: Package,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      textColor: "text-blue-700",
    },
    {
      title: "المنتجات النشطة",
      value: statistics.active || 0,
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
      textColor: "text-green-700",
    },
    {
      title: "المنتجات غير النشطة",
      value: statistics.inactive || 0,
      icon: XCircle,
      color: "red",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
      textColor: "text-red-700",
    },
    {
      title: "أقل سعر",
      value: productService.formatPrice(statistics.priceRange?.min_price || 0),
      icon: DollarSign,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      textColor: "text-purple-700",
    },
    {
      title: "أعلى سعر",
      value: productService.formatPrice(statistics.priceRange?.max_price || 0),
      icon: TrendingUp,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500",
      textColor: "text-orange-700",
    },
    {
      title: "متوسط الهامش",
      value: productService.formatPrice(statistics.averageMargin || 0),
      icon: Activity,
      color: "indigo",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-500",
      textColor: "text-indigo-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg shadow-sm p-6 border border-gray-100`}
        >
          <div className="flex items-center">
            <stat.icon className={`h-8 w-8 ${stat.iconColor} ml-3`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductStatistics;
