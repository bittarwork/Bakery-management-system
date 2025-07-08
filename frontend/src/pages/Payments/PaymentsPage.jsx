import { CreditCard } from "lucide-react";

const PaymentsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-blue-500 ml-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              إدارة المدفوعات
            </h1>
            <p className="text-gray-600">متابعة المدفوعات والأرصدة</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow text-center">
        <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          صفحة المدفوعات قيد التطوير
        </h3>
        <p className="text-gray-500">ستتمكن قريباً من إدارة المدفوعات من هنا</p>
      </div>
    </div>
  );
};

export default PaymentsPage;
