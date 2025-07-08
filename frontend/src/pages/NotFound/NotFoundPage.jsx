import { Link } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-400">404</span>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            الصفحة غير موجودة
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها.
          </p>

          <div className="mt-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="h-4 w-4 ml-2" />
              العودة للرئيسية
              <ArrowRight className="h-4 w-4 mr-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
