/**
 * Payment status constants
 */

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PARTIAL: 'partial',
    PAID: 'paid',
    OVERDUE: 'overdue'
};

export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.PENDING]: 'Pending',
    [PAYMENT_STATUS.PARTIAL]: 'Partial',
    [PAYMENT_STATUS.PAID]: 'Paid',
    [PAYMENT_STATUS.OVERDUE]: 'Overdue'
};

export const PAYMENT_STATUS_COLORS = {
    [PAYMENT_STATUS.PENDING]: 'orange',
    [PAYMENT_STATUS.PARTIAL]: 'yellow',
    [PAYMENT_STATUS.PAID]: 'green',
    [PAYMENT_STATUS.OVERDUE]: 'red'
};

// Status that needs follow up
export const PAYMENT_FOLLOW_UP_STATUSES = [
    PAYMENT_STATUS.PENDING,
    PAYMENT_STATUS.PARTIAL,
    PAYMENT_STATUS.OVERDUE
];

export default PAYMENT_STATUS; 