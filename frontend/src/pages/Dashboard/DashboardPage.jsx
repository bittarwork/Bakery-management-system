import { useAuthStore } from "../../store/authStore";
import {
  Users,
  Store,
  Package,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      name: "إجمالي المحلات",
      value: "42",
      change: "+4.75%",
      changeType: "positive",
      icon: Store,
    },
    {
      name: "المنتجات النشطة",
      value: "24",
      change: "+2.02%",
      changeType: "positive",
      icon: Package,
    },
    {
      name: "طلبات اليوم",
      value: "18",
      change: "+12.5%",
      changeType: "positive",
      icon: Calendar,
    },
    {
      name: "المبيعات اليومية",
      value: "€2,340",
      change: "+8.2%",
      changeType: "positive",
      icon: TrendingUp,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "order",
      message: "طلب جديد من محل الشاطئ",
      time: "منذ 5 دقائق",
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: 2,
      type: "delivery",
      message: "تم تسليم طلب لمحل الجامعة",
      time: "منذ 15 دقيقة",
      icon: MapPin,
      color: "text-green-600 bg-green-100",
    },
    {
      id: 3,
      type: "payment",
      message: "تم استلام دفعة من محل الميدان",
      time: "منذ 30 دقيقة",
      icon: TrendingUp,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      id: 4,
      type: "alert",
      message: "تحذير: مخزون الخبز منخفض",
      time: "منذ ساعة",
      icon: AlertCircle,
      color: "text-red-600 bg-red-100",
    },
  ];

  const pendingTasks = [
    {
      id: 1,
      task: "إعداد جدولة التوزيع ليوم غد",
      priority: "عالية",
      dueTime: "4:00 PM",
    },
    {
      id: 2,
      task: "مراجعة طلبات محل الوسط",
      priority: "متوسطة",
      dueTime: "6:00 PM",
    },
    {
      id: 3,
      task: "تحديث أسعار المنتجات",
      priority: "منخفضة",
      dueTime: "غداً",
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "عالية":
        return "text-red-600 bg-red-100";
      case "متوسطة":
        return "text-yellow-600 bg-yellow-100";
      case "منخفضة":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRoleText = (role) => {
    const roles = {
      admin: "مدير النظام",
      manager: "مدير التوزيع",
      distributor: "موزع",
      assistant: "مساعد",
    };
    return roles[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              مرحباً، {user?.full_name || user?.username}
            </h1>
            <p className="text-gray-600">
              {getRoleText(user?.role)} - لوحة التحكم الرئيسية
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 ml-1" />
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`mr-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              النشاطات الأخيرة
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 && (
                        <span
                          className="absolute top-4 right-4 -mr-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3 space-x-reverse">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.color}`}
                          >
                            <activity.icon className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.message}
                            </p>
                          </div>
                          <div className="text-left text-sm whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              المهام المعلقة
            </h3>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 space-x-reverse"
                >
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 mt-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {task.task}
                    </p>
                    <div className="mt-1 flex items-center space-x-2 space-x-reverse">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-sm text-gray-500">
                        {task.dueTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
