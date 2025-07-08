/**
 * تصدير جميع الثوابت
 */

// Order Status
export {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS,
    EDITABLE_ORDER_STATUSES,
    CANCELLABLE_ORDER_STATUSES,
    DELETABLE_ORDER_STATUSES
} from './orderStatus.js';

// Payment Status
export {
    PAYMENT_STATUS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
    PAYMENT_FOLLOW_UP_STATUSES
} from './paymentStatus.js';

// User Roles
export {
    USER_ROLES,
    USER_ROLE_LABELS,
    USER_ROLE_PERMISSIONS,
    MANAGEMENT_ROLES,
    ORDER_CREATION_ROLES
} from './userRoles.js';

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
};

// API Messages
export const API_MESSAGES = {
    SUCCESS: {
        CREATED: 'تم الإنشاء بنجاح',
        UPDATED: 'تم التحديث بنجاح',
        DELETED: 'تم الحذف بنجاح',
        RETRIEVED: 'تم جلب البيانات بنجاح'
    },
    ERROR: {
        NOT_FOUND: 'العنصر غير موجود',
        UNAUTHORIZED: 'غير مصرح لك بالوصول',
        FORBIDDEN: 'ممنوع الوصول',
        VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
        SERVER_ERROR: 'خطأ في الخادم'
    }
}; 