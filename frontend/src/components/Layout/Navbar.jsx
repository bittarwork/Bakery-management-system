import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Menu, X, User, LogOut, Settings } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Right side - Menu button and title */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden lg:block lg:mr-4">
              <h1 className="text-xl font-semibold text-gray-900">
                نظام إدارة توزيع المخبوزات
              </h1>
            </div>
          </div>

          {/* Left side - User menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.full_name || user?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRoleText(user?.role)}
                    </p>
                  </div>
                </div>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 ml-2" />
                      الإعدادات
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
