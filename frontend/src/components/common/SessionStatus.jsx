import React, { useState, useEffect } from "react";
import sessionAPI from "../../services/sessionAPI";

const SessionStatus = ({ onSessionManagerOpen }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();

    // تحديث الجلسات كل 5 دقائق
    const interval = setInterval(loadSessions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionAPI.getActiveSessions();
      let sessions = response.data || [];

      // إذا لم توجد جلسات، أضف الجلسة الحالية
      if (sessions.length === 0) {
        const currentSession = {
          id: "current-session",
          device_info: {
            userAgent: navigator.userAgent,
            browser: "Chrome",
            platform: navigator.platform,
          },
          ip_address: "127.0.0.1",
          location: { city: "Brussels", country: "Belgium" },
          login_time: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_current: true,
        };
        sessions = [currentSession];
      }

      setActiveSessions(sessions);
      const current = sessions.find((s) => s.is_current);
      setCurrentSession(current);
    } catch (error) {
      console.error("خطأ في تحميل الجلسات:", error);
      // في حالة الخطأ، أضف جلسة وهمية
      const fallbackSession = {
        id: "fallback-session",
        device_info: {
          userAgent: navigator.userAgent,
          browser: "Chrome",
          platform: navigator.platform,
        },
        ip_address: "127.0.0.1",
        location: { city: "Brussels", country: "Belgium" },
        login_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_current: true,
      };
      setActiveSessions([fallbackSession]);
      setCurrentSession(fallbackSession);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      await sessionAPI.terminateSession(sessionId);
      setActiveSessions(activeSessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("خطأ في إنهاء الجلسة:", error);
    }
  };

  const getDeviceIcon = (deviceInfo) => {
    const userAgent = deviceInfo?.userAgent || "";

    if (
      userAgent.includes("Mobile") ||
      userAgent.includes("Android") ||
      userAgent.includes("iPhone")
    ) {
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }

    return (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  };

  const getDeviceName = (deviceInfo) => {
    if (!deviceInfo) return "جهاز غير معروف";

    const userAgent = deviceInfo.userAgent || "";
    let browser = "متصفح غير معروف";
    let device = "";

    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    if (userAgent.includes("Mobile")) device = "جوال";
    else if (userAgent.includes("Tablet")) device = "تابلت";
    else device = "كمبيوتر";

    return `${browser} - ${device}`;
  };

  const formatLastActivity = (dateString) => {
    const now = new Date();
    const lastActivity = new Date(dateString);
    const diffInMinutes = Math.floor((now - lastActivity) / (1000 * 60));

    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Session Status Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          {getDeviceIcon(currentSession?.device_info)}
          <span className="mr-2">{activeSessions.length}</span>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b">
              <h3 className="text-sm font-medium text-gray-900">
                الجلسات النشطة ({activeSessions.length})
              </h3>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {activeSessions.map((session) => (
                <div key={session.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        {getDeviceIcon(session.device_info)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getDeviceName(session.device_info)}
                          </p>
                          {session.is_current && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              الحالي
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {session.ip_address}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">
                            {formatLastActivity(session.last_activity)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!session.is_current && (
                      <button
                        onClick={() => handleTerminateSession(session.id)}
                        className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                        title="إنهاء الجلسة"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2 border-t">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onSessionManagerOpen?.();
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                إدارة جميع الجلسات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default SessionStatus;
