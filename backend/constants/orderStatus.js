/**
 * Order status constants
 */

export const ORDER_STATUS = {
    DRAFT: 'draft',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.DRAFT]: 'Draft',
    [ORDER_STATUS.CONFIRMED]: 'Confirmed',
    [ORDER_STATUS.IN_PROGRESS]: 'In Progress',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.DRAFT]: 'gray',
    [ORDER_STATUS.CONFIRMED]: 'blue',
    [ORDER_STATUS.IN_PROGRESS]: 'orange',
    [ORDER_STATUS.DELIVERED]: 'green',
    [ORDER_STATUS.CANCELLED]: 'red'
};

// Statuses that can be edited
export const EDITABLE_ORDER_STATUSES = [
    ORDER_STATUS.DRAFT
];

// Statuses that can be cancelled
export const CANCELLABLE_ORDER_STATUSES = [
    ORDER_STATUS.DRAFT,
    ORDER_STATUS.CONFIRMED
];

// Statuses that can be deleted
export const DELETABLE_ORDER_STATUSES = [
    ORDER_STATUS.DRAFT
];

export default ORDER_STATUS; 