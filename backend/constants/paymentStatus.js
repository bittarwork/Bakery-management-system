/**
 * ثوابت حالات الدفع
 */

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

// حالات تحتاج متابعة
export const PAYMENT_FOLLOW_UP_STATUSES = [
    PAYMENT_STATUS.PENDING,
    PAYMENT_STATUS.PARTIAL,
    PAYMENT_STATUS.OVERDUE
];

export default PAYMENT_STATUS; 