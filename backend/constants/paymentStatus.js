/**
 * Payment status constants
 */

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid'
};

export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.PENDING]: 'Pending',
    [PAYMENT_STATUS.PAID]: 'Paid'
};

export const PAYMENT_STATUS_COLORS = {
    [PAYMENT_STATUS.PENDING]: 'orange',
    [PAYMENT_STATUS.PAID]: 'green'
};

// Status that needs follow up
export const PAYMENT_FOLLOW_UP_STATUSES = [
    PAYMENT_STATUS.PENDING
];

export default PAYMENT_STATUS; 