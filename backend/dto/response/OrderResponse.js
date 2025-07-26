import { ORDER_STATUS, PAYMENT_STATUS } from '../../constants/index.js';

/**
 * Data Transfer Object for order response
 */
export class OrderResponse {
    constructor(order, includeItems = false, includeStore = false, includeCreator = false, includeDistributor = false) {
        this.id = order.id;
        this.order_number = order.order_number;
        this.store_id = order.store_id;
        this.order_date = order.order_date;
        this.delivery_date = order.delivery_date;
        this.total_amount_eur = parseFloat(order.total_amount_eur || 0);
        this.total_amount_syp = parseFloat(order.total_amount_syp || 0);
        this.discount_amount_eur = parseFloat(order.discount_amount_eur || 0);
        this.discount_amount_syp = parseFloat(order.discount_amount_syp || 0);
        this.final_amount_eur = parseFloat(order.final_amount_eur || 0);
        this.final_amount_syp = parseFloat(order.final_amount_syp || 0);
        this.status = order.status;
        this.payment_status = order.payment_status;
        this.priority = order.priority || 'medium';
        this.notes = order.notes;
        this.created_by = order.created_by;
        this.created_at = order.created_at;
        this.updated_at = order.updated_at;

        // Add distribution fields
        this.assigned_distributor_id = order.assigned_distributor_id;
        this.assigned_at = order.assigned_at;
        this.delivery_started_at = order.delivery_started_at;
        this.delivery_status = order.delivery_status || 'pending';

        // Add status labels and colors
        this.status_info = this.getStatusInfo();
        this.payment_status_info = this.getPaymentStatusInfo();
        this.distribution_status_info = this.getDistributionStatusInfo();

        // Add computed properties
        this.can_be_modified = this.canBeModified();
        this.can_be_cancelled = this.canBeCancelled();
        this.is_overdue = this.isOverdue();
        this.has_assigned_distributor = !!this.assigned_distributor_id;

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

        if (includeDistributor && (order.AssignedDistributor || order.assignedDistributor)) {
            const distributor = order.AssignedDistributor || order.assignedDistributor;
            this.assigned_distributor = {
                id: distributor.id,
                full_name: distributor.full_name,
                username: distributor.username,
                phone: distributor.phone,
                email: distributor.email
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
     * Get distribution status information with label and color
     * @returns {Object} distribution status info
     */
    getDistributionStatusInfo() {
        const statusMap = {
            'pending': { label: 'في الانتظار', color: 'gray', icon: '⏳' },
            'in_transit': { label: 'في الطريق', color: 'yellow', icon: '🚚' },
            'delivered': { label: 'تم التسليم', color: 'green', icon: '✅' },
            'returned': { label: 'مرتجع', color: 'red', icon: '↩️' },
            'cancelled': { label: 'ملغي', color: 'red', icon: '❌' }
        };

        return statusMap[this.delivery_status] || { label: this.delivery_status, color: 'gray', icon: '❓' };
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
            store_id: this.store_id,
            order_date: this.order_date,
            delivery_date: this.delivery_date,
            total_amount_eur: this.total_amount_eur,
            total_amount_syp: this.total_amount_syp,
            final_amount_eur: this.final_amount_eur,
            final_amount_syp: this.final_amount_syp,
            discount_amount_eur: this.discount_amount_eur,
            discount_amount_syp: this.discount_amount_syp,
            status: this.status,
            status_info: this.status_info,
            payment_status: this.payment_status,
            payment_status_info: this.payment_status_info,
            priority: this.priority || 'medium',
            items: this.items || [],
            items_count: this.items_count || 0,
            total_quantity: this.total_quantity || 0,
            store: this.store,
            store_name: this.store ? this.store.name : 'N/A',
            creator: this.creator,
            notes: this.notes,
            can_be_modified: this.can_be_modified,
            can_be_cancelled: this.can_be_cancelled,
            is_overdue: this.is_overdue,
            created_at: this.created_at,
            updated_at: this.updated_at,
            assigned_distributor: this.assigned_distributor,
            has_assigned_distributor: this.has_assigned_distributor,
            distribution_status: this.delivery_status,
            distribution_status_info: this.distribution_status_info
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
        this.product_name = orderItem.product_name;
        this.product_barcode = orderItem.product_barcode;
        this.product_sku = orderItem.product_sku;
        this.product_description = orderItem.product_description;
        this.supplier_id = orderItem.supplier_id;
        this.supplier_name = orderItem.supplier_name;
        this.unit = orderItem.unit;
        this.product_category = orderItem.product_category;
        this.quantity = parseInt(orderItem.quantity) || 0;
        this.delivered_quantity = parseInt(orderItem.delivered_quantity) || 0;
        this.returned_quantity = parseInt(orderItem.returned_quantity) || 0;
        this.damaged_quantity = parseInt(orderItem.damaged_quantity) || 0;
        this.delivery_date = orderItem.delivery_date;
        this.delivery_status = orderItem.delivery_status;
        this.delivery_notes = orderItem.delivery_notes;
        this.delivery_confirmed_by = orderItem.delivery_confirmed_by;
        this.delivery_confirmed_at = orderItem.delivery_confirmed_at;
        this.tracking_number = orderItem.tracking_number;
        this.delivery_method = orderItem.delivery_method;
        this.estimated_delivery_date = orderItem.estimated_delivery_date;
        this.actual_delivery_date = orderItem.actual_delivery_date;
        this.unit_price_eur = parseFloat(orderItem.unit_price_eur) || 0;
        this.unit_price_syp = parseFloat(orderItem.unit_price_syp) || 0;
        this.total_price_eur = parseFloat(orderItem.total_price_eur) || 0;
        this.total_price_syp = parseFloat(orderItem.total_price_syp) || 0;
        this.discount_amount_eur = parseFloat(orderItem.discount_amount_eur) || 0;
        this.discount_amount_syp = parseFloat(orderItem.discount_amount_syp) || 0;
        this.final_price_eur = parseFloat(orderItem.final_price_eur) || 0;
        this.final_price_syp = parseFloat(orderItem.final_price_syp) || 0;
        this.notes = orderItem.notes;
        this.return_reason = orderItem.return_reason;
        this.created_at = orderItem.created_at;
        this.updated_at = orderItem.updated_at;

        // Add computed properties
        this.total_quantity = this.quantity + this.delivered_quantity;
        this.has_delivery_info = this.delivery_date || this.tracking_number || this.delivery_status !== 'pending';
        this.is_delivered = this.delivery_status === 'delivered';
        this.is_returned = this.returned_quantity > 0;
        this.is_damaged = this.damaged_quantity > 0;

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
     * Get delivery status information with label and color
     * @returns {Object} delivery status info
     */
    getDeliveryStatusInfo() {
        const statusMap = {
            'pending': { label: 'في الانتظار', color: 'gray', icon: '⏳' },
            'in_transit': { label: 'في الطريق', color: 'yellow', icon: '🚚' },
            'delivered': { label: 'تم التسليم', color: 'green', icon: '✅' },
            'returned': { label: 'مرتجع', color: 'red', icon: '↩️' },
            'cancelled': { label: 'ملغي', color: 'red', icon: '❌' }
        };

        return statusMap[this.delivery_status] || { label: this.delivery_status, color: 'gray', icon: '❓' };
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
        const totalAmountEur = this.orders.reduce((sum, order) => sum + order.final_amount_eur, 0);
        const totalAmountSyp = this.orders.reduce((sum, order) => sum + order.final_amount_syp, 0);
        const statusCounts = {};
        const paymentStatusCounts = {};

        this.orders.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
            paymentStatusCounts[order.payment_status] = (paymentStatusCounts[order.payment_status] || 0) + 1;
        });

        return {
            total_orders: this.orders.length,
            total_amount_eur: Math.round(totalAmountEur * 100) / 100,
            total_amount_syp: Math.round(totalAmountSyp * 100) / 100,
            status_counts: statusCounts,
            payment_status_counts: paymentStatusCounts
        };
    }
} 