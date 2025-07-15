import { apiService } from './apiService';

/**
 * Order Service
 * Handles all order-related API operations
 */
class OrderService {
    constructor() {
        this.baseEndpoint = '/orders';
    }

    /**
     * Get all orders with filtering and pagination
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getOrders(params = {}) {
        try {
            const queryParams = {
                page: params.page || 1,
                limit: params.limit || 10,
                status: params.status || null,
                payment_status: params.payment_status || null,
                store_id: params.store_id || null,
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                search: params.search || '',
                sortBy: params.sortBy || 'created_at',
                sortOrder: params.sortOrder || 'DESC'
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null || queryParams[key] === '') {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(this.baseEndpoint, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch orders: ${error.message}`);
        }
    }

    /**
     * Get single order by ID
     * @param {number} id - Order ID
     * @returns {Promise} API response
     */
    async getOrder(id) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${id}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch order: ${error.message}`);
        }
    }

    /**
     * Create new order
     * @param {Object} orderData - Order data
     * @returns {Promise} API response
     */
    async createOrder(orderData) {
        try {
            const response = await apiService.post(this.baseEndpoint, orderData);
            return response;
        } catch (error) {
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }

    /**
     * Update order
     * @param {number} id - Order ID
     * @param {Object} orderData - Updated order data
     * @returns {Promise} API response
     */
    async updateOrder(id, orderData) {
        try {
            const response = await apiService.put(`${this.baseEndpoint}/${id}`, orderData);
            return response;
        } catch (error) {
            throw new Error(`Failed to update order: ${error.message}`);
        }
    }

    /**
     * Delete order
     * @param {number} id - Order ID
     * @returns {Promise} API response
     */
    async deleteOrder(id) {
        try {
            const response = await apiService.delete(`${this.baseEndpoint}/${id}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to delete order: ${error.message}`);
        }
    }

    /**
     * Update order status
     * @param {number} id - Order ID
     * @param {string} status - New status
     * @returns {Promise} API response
     */
    async updateOrderStatus(id, status) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/status`, { status });
            return response;
        } catch (error) {
            throw new Error(`Failed to update order status: ${error.message}`);
        }
    }

    /**
     * Update payment status
     * @param {number} id - Order ID
     * @param {string} payment_status - New payment status
     * @returns {Promise} API response
     */
    async updatePaymentStatus(id, payment_status) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/payment-status`, { payment_status });
            return response;
        } catch (error) {
            throw new Error(`Failed to update payment status: ${error.message}`);
        }
    }

    /**
     * Get today's orders
     * @returns {Promise} API response
     */
    async getTodayOrders() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/today`);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch today's orders: ${error.message}`);
        }
    }

    /**
     * Get orders statistics
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getOrderStatistics(params = {}) {
        try {
            const queryParams = {
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                store_id: params.store_id || null
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/statistics`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch order statistics: ${error.message}`);
        }
    }

    /**
     * Export orders to CSV
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async exportOrders(params = {}) {
        try {
            const queryParams = {
                status: params.status || null,
                payment_status: params.payment_status || null,
                store_id: params.store_id || null,
                date_from: params.date_from || null,
                date_to: params.date_to || null
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/export`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to export orders: ${error.message}`);
        }
    }

    /**
     * Get order status options
     * @returns {Array} Status options
     */
    getStatusOptions() {
        return [
            { value: 'draft', label: 'Draft', color: 'gray' },
            { value: 'confirmed', label: 'Confirmed', color: 'blue' },
            { value: 'in_progress', label: 'In Progress', color: 'yellow' },
            { value: 'delivered', label: 'Delivered', color: 'green' },
            { value: 'cancelled', label: 'Cancelled', color: 'red' }
        ];
    }

    /**
     * Get payment status options
     * @returns {Array} Payment status options
     */
    getPaymentStatusOptions() {
        return [
            { value: 'pending', label: 'Pending', color: 'gray' },
            { value: 'partial', label: 'Partial', color: 'yellow' },
            { value: 'paid', label: 'Paid', color: 'green' },
            { value: 'overdue', label: 'Overdue', color: 'red' }
        ];
    }

    /**
     * Get status badge color
     * @param {string} status - Order status
     * @returns {string} Badge color
     */
    getStatusBadgeColor(status) {
        const statusOptions = this.getStatusOptions();
        const statusOption = statusOptions.find(option => option.value === status);
        return statusOption ? statusOption.color : 'gray';
    }

    /**
     * Get payment status badge color
     * @param {string} paymentStatus - Payment status
     * @returns {string} Badge color
     */
    getPaymentStatusBadgeColor(paymentStatus) {
        const paymentStatusOptions = this.getPaymentStatusOptions();
        const paymentStatusOption = paymentStatusOptions.find(option => option.value === paymentStatus);
        return paymentStatusOption ? paymentStatusOption.color : 'gray';
    }

    /**
     * Format order for display
     * @param {Object} order - Order object
     * @returns {Object} Formatted order
     */
    formatOrder(order) {
        return {
            ...order,
            formattedDate: new Date(order.order_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            formattedTime: new Date(order.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            statusBadge: this.getStatusBadgeColor(order.status),
            paymentStatusBadge: this.getPaymentStatusBadgeColor(order.payment_status)
        };
    }

    /**
     * Calculate order totals
     * @param {Array} items - Order items
     * @param {Object} discounts - Discount information
     * @returns {Object} Order totals
     */
    calculateOrderTotals(items, discounts = {}) {
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.quantity * item.unit_price);
        }, 0);

        const itemDiscounts = items.reduce((sum, item) => {
            return sum + (item.discount_amount || 0);
        }, 0);

        const orderDiscount = discounts.amount || 0;
        const totalDiscount = itemDiscounts + orderDiscount;
        const finalTotal = subtotal - totalDiscount;

        return {
            subtotal: subtotal.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2),
            finalTotal: finalTotal.toFixed(2)
        };
    }

    /**
     * Validate order data
     * @param {Object} orderData - Order data to validate
     * @returns {Object} Validation result
     */
    validateOrderData(orderData) {
        const errors = {};

        if (!orderData.store_id) {
            errors.store_id = 'Store is required';
        }

        if (!orderData.items || orderData.items.length === 0) {
            errors.items = 'At least one item is required';
        } else {
            orderData.items.forEach((item, index) => {
                if (!item.product_id) {
                    errors[`items.${index}.product_id`] = 'Product is required';
                }
                if (!item.quantity || item.quantity <= 0) {
                    errors[`items.${index}.quantity`] = 'Quantity must be greater than 0';
                }
                if (!item.unit_price || item.unit_price < 0) {
                    errors[`items.${index}.unit_price`] = 'Unit price must be greater than or equal to 0';
                }
            });
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

// Export singleton instance
export const orderService = new OrderService();
export default orderService; 