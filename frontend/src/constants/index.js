/**
 * ثوابت الـ Frontend
 */

// حالات الطلبات
export const ORDER_STATUS = {
    DRAFT: 'draft',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.DRAFT]: 'مسودة',
    [ORDER_STATUS.CONFIRMED]: 'مؤكد',
    [ORDER_STATUS.IN_PROGRESS]: 'قيد التنفيذ',
    [ORDER_STATUS.DELIVERED]: 'مُسلم',
    [ORDER_STATUS.CANCELLED]: 'ملغي'
};

export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.DRAFT]: 'gray',
    [ORDER_STATUS.CONFIRMED]: 'blue',
    [ORDER_STATUS.IN_PROGRESS]: 'yellow',
    [ORDER_STATUS.DELIVERED]: 'green',
    [ORDER_STATUS.CANCELLED]: 'red'
};

// حالات الدفع
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PARTIAL: 'partial',
    PAID: 'paid',
    OVERDUE: 'overdue'
};

export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.PENDING]: 'معلق',
    [PAYMENT_STATUS.PARTIAL]: 'جزئي',
    [PAYMENT_STATUS.PAID]: 'مدفوع',
    [PAYMENT_STATUS.OVERDUE]: 'متأخر'
};

export const PAYMENT_STATUS_COLORS = {
    [PAYMENT_STATUS.PENDING]: 'gray',
    [PAYMENT_STATUS.PARTIAL]: 'yellow',
    [PAYMENT_STATUS.PAID]: 'green',
    [PAYMENT_STATUS.OVERDUE]: 'red'
};

// أدوار المستخدمين
export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    DISTRIBUTOR: 'distributor',
    VIEWER: 'viewer'
};

export const USER_ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'مدير النظام',
    [USER_ROLES.MANAGER]: 'مدير',
    [USER_ROLES.DISTRIBUTOR]: 'موزع',
    [USER_ROLES.VIEWER]: 'مشاهد'
};

// مسارات التطبيق
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    ORDERS: '/orders',
    ORDERS_CREATE: '/orders/create',
    ORDERS_EDIT: '/orders/:id/edit',
    ORDERS_VIEW: '/orders/:id',
    STORES: '/stores',
    PRODUCTS: '/products',
    USERS: '/users',
    REPORTS: '/reports',
    SETTINGS: '/settings'
};

// إعدادات التطبيق
export const APP_CONFIG = {
    NAME: 'نظام إدارة توزيع المخابز',
    VERSION: '1.0.0',
    API_TIMEOUT: 30000,
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 12,
        PAGE_SIZE_OPTIONS: [12, 24, 48, 96]
    },
    DATE_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    CURRENCY: 'EUR'
};

// رسائل التطبيق
export const MESSAGES = {
    SUCCESS: {
        SAVE: 'تم الحفظ بنجاح',
        UPDATE: 'تم التحديث بنجاح',
        DELETE: 'تم الحذف بنجاح',
        LOGIN: 'تم تسجيل الدخول بنجاح',
        LOGOUT: 'تم تسجيل الخروج بنجاح'
    },
    ERROR: {
        NETWORK: 'خطأ في الاتصال بالخادم',
        UNAUTHORIZED: 'غير مصرح لك بالوصول',
        NOT_FOUND: 'الصفحة غير موجودة',
        VALIDATION: 'يرجى التحقق من البيانات المدخلة',
        GENERIC: 'حدث خطأ غير متوقع'
    },
    CONFIRM: {
        DELETE: 'هل أنت متأكد من الحذف؟',
        CANCEL: 'هل أنت متأكد من الإلغاء؟',
        LOGOUT: 'هل تريد تسجيل الخروج؟'
    }
}; 