import { Truck } from "lucide-react";

const DistributionPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Truck className="h-8 w-8 text-blue-500 ml-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة التوزيع</h1>
            <p className="text-gray-600">جدولة ومتابعة عمليات التوزيع</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow text-center">
        <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          صفحة التوزيع قيد التطوير
        </h3>
        <p className="text-gray-500">
          ستتمكن قريباً من إدارة عمليات التوزيع من هنا
        </p>
      </div>
    </div>
  );
};

export default DistributionPage;
