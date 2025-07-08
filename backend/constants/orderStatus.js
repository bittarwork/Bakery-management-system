/**
 * ثوابت حالات الطلبات
 */

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

// حالات يمكن تعديلها
export const EDITABLE_ORDER_STATUSES = [
    ORDER_STATUS.DRAFT,
    ORDER_STATUS.CONFIRMED
];

// حالات يمكن إلغاؤها
export const CANCELLABLE_ORDER_STATUSES = [
    ORDER_STATUS.DRAFT,
    ORDER_STATUS.CONFIRMED
];

// حالات يمكن حذفها
export const DELETABLE_ORDER_STATUSES = [
    ORDER_STATUS.DRAFT
];

export default ORDER_STATUS; 