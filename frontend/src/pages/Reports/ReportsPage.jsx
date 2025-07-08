import { BarChart3 } from "lucide-react";

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-blue-500 ml-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              التقارير والإحصائيات
            </h1>
            <p className="text-gray-600">عرض التقارير التفصيلية والإحصائيات</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          صفحة التقارير قيد التطوير
        </h3>
        <p className="text-gray-500">
          ستتمكن قريباً من عرض التقارير والإحصائيات من هنا
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;
