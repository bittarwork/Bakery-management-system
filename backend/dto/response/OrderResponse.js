import { ORDER_STATUS, PAYMENT_STATUS } from '../../constants/index.js';

/**
 * Data Transfer Object for order response
 */
export class OrderResponse {
    constructor(order, includeItems = false, includeStore = false, includeCreator = false) {
        this.id = order.id;
        this.order_number = order.order_number;
        this.store_id = order.store_id;
        this.order_date = order.order_date;
        this.delivery_date = order.delivery_date;
        this.total_amount = parseFloat(order.total_amount);
        this.discount_amount = parseFloat(order.discount_amount);
        this.final_amount = parseFloat(order.final_amount);
        this.status = order.status;
        this.payment_status = order.payment_status;
        this.gift_applied = order.gift_applied;
        this.notes = order.notes;
        this.created_by = order.created_by;
        this.created_at = order.created_at;
        this.updated_at = order.updated_at;

        // Add status labels and colors
        this.status_info = this.getStatusInfo();
        this.payment_status_info = this.getPaymentStatusInfo();

        // Add computed properties
        this.can_be_modified = this.canBeModified();
        this.can_be_cancelled = this.canBeCancelled();
        this.is_overdue = this.isOverdue();

        // Include related data if requested
        if (includeItems && (order.OrderItems || order.items)) {
            const orderItems = order.OrderItems || order.items || [];
            this.items = orderItems.map(item => new OrderItemResponse(item));
            this.items_count = this.items.length;
            this.total_quantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
        }

        if (includeStore && (order.Store || order.store)) {
            const store = order.Store || order.store;
            this.store = {
                id: store.id,
                name: store.name,
                address: store.address,
                phone: store.phone
            };
        }

        if (includeCreator && (order.Creator || order.creator)) {
            const creator = order.Creator || order.creator;
            this.creator = {
                id: creator.id,
                full_name: creator.full_name,
                username: creator.username
            };
        }
    }

    /**
     * Get status information with label and color
     * @returns {Object} status info
     */
    getStatusInfo() {
        const statusMap = {
            [ORDER_STATUS.DRAFT]: { label: 'مسودة', color: 'gray', icon: '📝' },
            [ORDER_STATUS.CONFIRMED]: { label: 'مؤكد', color: 'blue', icon: '✅' },
            [ORDER_STATUS.IN_PROGRESS]: { label: 'قيد التنفيذ', color: 'yellow', icon: '⏳' },
            [ORDER_STATUS.DELIVERED]: { label: 'تم التسليم', color: 'green', icon: '🚚' },
            [ORDER_STATUS.CANCELLED]: { label: 'ملغي', color: 'red', icon: '❌' }
        };

        return statusMap[this.status] || { label: this.status, color: 'gray', icon: '❓' };
    }

    /**
     * Get payment status information with label and color
     * @returns {Object} payment status info
     */
    getPaymentStatusInfo() {
        const statusMap = {
            [PAYMENT_STATUS.PENDING]: { label: 'في الانتظار', color: 'gray', icon: '⏳' },
            [PAYMENT_STATUS.PARTIAL]: { label: 'دفع جزئي', color: 'yellow', icon: '💰' },
            [PAYMENT_STATUS.PAID]: { label: 'مدفوع', color: 'green', icon: '✅' },
            [PAYMENT_STATUS.OVERDUE]: { label: 'متأخر', color: 'red', icon: '⚠️' }
        };

        return statusMap[this.payment_status] || { label: this.payment_status, color: 'gray', icon: '❓' };
    }

    /**
     * Check if order can be modified
     * @returns {boolean}
     */
    canBeModified() {
        return [ORDER_STATUS.DRAFT, ORDER_STATUS.CONFIRMED].includes(this.status);
    }

    /**
     * Check if order can be cancelled
     * @returns {boolean}
     */
    canBeCancelled() {
        return [ORDER_STATUS.DRAFT, ORDER_STATUS.CONFIRMED].includes(this.status);
    }

    /**
     * Check if order is overdue
     * @returns {boolean}
     */
    isOverdue() {
        if (!this.delivery_date) return false;
        const today = new Date();
        const deliveryDate = new Date(this.delivery_date);
        return deliveryDate < today && this.status !== ORDER_STATUS.DELIVERED;
    }

    /**
     * Get summary information
     * @returns {Object} summary
     */
    getSummary() {
        return {
            id: this.id,
            order_number: this.order_number,
            order_date: this.order_date,
            delivery_date: this.delivery_date,
            final_amount: this.final_amount,
            discount_amount: this.discount_amount,
            status: this.status,
            status_info: this.status_info,
            payment_status: this.payment_status,
            payment_status_info: this.payment_status_info,
            items: this.items || [],
            items_count: this.items_count || 0,
            total_quantity: this.total_quantity || 0,
            store: this.store,
            creator: this.creator,
            notes: this.notes,
            can_be_modified: this.can_be_modified,
            can_be_cancelled: this.can_be_cancelled,
            is_overdue: this.is_overdue
        };
    }
}

/**
 * Data Transfer Object for order item response
 */
export class OrderItemResponse {
    constructor(orderItem) {
        this.id = orderItem.id;
        this.order_id = orderItem.order_id;
        this.product_id = orderItem.product_id;
        this.quantity = parseInt(orderItem.quantity);
        this.unit_price = parseFloat(orderItem.unit_price);
        this.total_price = parseFloat(orderItem.total_price);
        this.discount_amount = parseFloat(orderItem.discount_amount);
        this.final_price = parseFloat(orderItem.final_price);
        this.gift_quantity = parseInt(orderItem.gift_quantity) || 0;
        this.gift_reason = orderItem.gift_reason;
        this.created_at = orderItem.created_at;
        this.updated_at = orderItem.updated_at;

        // Add computed properties
        this.total_quantity = this.quantity + this.gift_quantity;
        this.has_gift = this.gift_quantity > 0;
        this.discount_percentage = this.getDiscountPercentage();

        // Include product info if available
        if (orderItem.Product || orderItem.product) {
            const product = orderItem.Product || orderItem.product;
            this.product = {
                id: product.id,
                name: product.name,
                sku: product.sku,
                unit: product.unit
            };
        }
    }

    /**
     * Calculate discount percentage
     * @returns {number} discount percentage
     */
    getDiscountPercentage() {
        if (this.total_price === 0) return 0;
        return Math.round((this.discount_amount / this.total_price) * 100 * 100) / 100;
    }
}

/**
 * Data Transfer Object for paginated orders response
 */
export class OrdersListResponse {
    constructor(orders, pagination, filters = {}) {
        this.orders = orders.map(order => new OrderResponse(order, true, true, true).getSummary());
        this.pagination = {
            current_page: pagination.page,
            per_page: pagination.limit,
            total: pagination.total,
            total_pages: Math.ceil(pagination.total / pagination.limit),
            has_next: pagination.page < Math.ceil(pagination.total / pagination.limit),
            has_prev: pagination.page > 1
        };
        this.filters = filters;
        this.summary = this.getSummary();
    }

    /**
     * Get summary statistics
     * @returns {Object} summary
     */
    getSummary() {
        const totalAmount = this.orders.reduce((sum, order) => sum + order.final_amount, 0);
        const statusCounts = {};
        const paymentStatusCounts = {};

        this.orders.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
            paymentStatusCounts[order.payment_status] = (paymentStatusCounts[order.payment_status] || 0) + 1;
        });

        return {
            total_orders: this.orders.length,
            total_amount: Math.round(totalAmount * 100) / 100,
            status_counts: statusCounts,
            payment_status_counts: paymentStatusCounts
        };
    }
} 