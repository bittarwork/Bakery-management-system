// Utility to help remove mock data from all distribution pages
// This script provides standard error handling instead of mock data

export const standardErrorHandler = (error, setterFunction, errorMessage) => {
    console.error(errorMessage, error);
    setterFunction([]);
    return errorMessage + ": " + (error.response?.data?.message || error.message);
};

export const distributorErrorHandler = (error, setDistributors, setPagination = null) => {
    console.error("Error loading distributors:", error);
    setDistributors([]);

    if (setPagination) {
        setPagination({
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
        });
    }

    return "خطأ في تحميل الموزعين: " + (error.response?.data?.message || error.message);
};

export const ordersErrorHandler = (error, setOrders, setPagination = null) => {
    console.error("Error loading orders:", error);
    setOrders([]);

    if (setPagination) {
        setPagination({
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
        });
    }

    return "خطأ في تحميل الطلبات: " + (error.response?.data?.message || error.message);
};

export const schedulesErrorHandler = (error, setSchedules) => {
    console.error("Error loading schedules:", error);
    setSchedules([]);
    return "خطأ في تحميل الجداول: " + (error.response?.data?.message || error.message);
};

export const reportsErrorHandler = (error, setReports) => {
    console.error("Error loading reports:", error);
    setReports([]);
    return "خطأ في تحميل التقارير: " + (error.response?.data?.message || error.message);
};

export const analyticsErrorHandler = (error, setAnalytics) => {
    console.error("Error loading analytics:", error);
    setAnalytics({});
    return "خطأ في تحميل التحليلات: " + (error.response?.data?.message || error.message);
}; 