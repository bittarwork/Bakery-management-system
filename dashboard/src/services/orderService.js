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
                distributor_id: params.distributor_id || null,
                priority: params.priority || null,
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                delivery_date_from: params.delivery_date_from || null,
                delivery_date_to: params.delivery_date_to || null,
                amount_min: params.amount_min || null,
                amount_max: params.amount_max || null,
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
     * Assign distributor to order
     * @param {number} id - Order ID
     * @param {number} distributorId - Distributor ID
     * @returns {Promise} API response
     */
    async assignDistributor(id, distributorId) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/assign-distributor`, {
                distributor_id: distributorId
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to assign distributor: ${error.message}`);
        }
    }

    /**
     * Update order priority
     * @param {number} id - Order ID
     * @param {string} priority - New priority
     * @returns {Promise} API response
     */
    async updateOrderPriority(id, priority) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/priority`, { priority });
            return response;
        } catch (error) {
            throw new Error(`Failed to update order priority: ${error.message}`);
        }
    }

    /**
     * Update order delivery date
     * @param {number} id - Order ID
     * @param {string} deliveryDate - New delivery date
     * @returns {Promise} API response
     */
    async updateDeliveryDate(id, deliveryDate) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/delivery-date`, {
                delivery_date: deliveryDate
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to update delivery date: ${error.message}`);
        }
    }

    /**
     * Add note to order
     * @param {number} id - Order ID
     * @param {string} note - Note content
     * @returns {Promise} API response
     */
    async addOrderNote(id, note) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${id}/notes`, { note });
            return response;
        } catch (error) {
            throw new Error(`Failed to add order note: ${error.message}`);
        }
    }

    /**
     * Cancel order with reason
     * @param {number} id - Order ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise} API response
     */
    async cancelOrder(id, reason) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/cancel`, {
                reason,
                status: 'cancelled'
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to cancel order: ${error.message}`);
        }
    }

    /**
     * Request refund for order
     * @param {number} id - Order ID
     * @param {Object} refundData - Refund information
     * @returns {Promise} API response
     */
    async requestRefund(id, refundData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${id}/refund`, refundData);
            return response;
        } catch (error) {
            throw new Error(`Failed to request refund: ${error.message}`);
        }
    }

    /**
     * Duplicate order
     * @param {number} id - Order ID
     * @returns {Promise} API response
     */
    async duplicateOrder(id) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${id}/duplicate`);
            return response;
        } catch (error) {
            throw new Error(`Failed to duplicate order: ${error.message}`);
        }
    }

    /**
     * Get order history/timeline
     * @param {number} id - Order ID
     * @returns {Promise} API response
     */
    async getOrderHistory(id) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${id}/history`);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch order history: ${error.message}`);
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
                distributor_id: params.distributor_id || null,
                priority: params.priority || null,
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                delivery_date_from: params.delivery_date_from || null,
                delivery_date_to: params.delivery_date_to || null,
                amount_min: params.amount_min || null,
                amount_max: params.amount_max || null
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
     * Get order reports
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getOrderReports(params = {}) {
        try {
            const queryParams = {
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                payment_status: params.payment_status || null,
                order_status: params.order_status || null,
                currency: params.currency || null,
                min_amount: params.min_amount || null,
                max_amount: params.max_amount || null
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/reports`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch order reports: ${error.message}`);
        }
    }

    /**
     * Export order reports
     * @param {string} format - Export format (csv, json)
     * @param {string} reportType - Report type
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async exportOrderReports(format, reportType, params = {}) {
        try {
            const queryParams = {
                format,
                type: reportType,
                ...params
            };

            const response = await apiService.get(`${this.baseEndpoint}/reports/export`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to export order reports: ${error.message}`);
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
     * Get priority options
     * @returns {Array} Priority options
     */
    getPriorityOptions() {
        return [
            { value: 'low', label: 'Low', color: 'gray' },
            { value: 'medium', label: 'Medium', color: 'blue' },
            { value: 'high', label: 'High', color: 'orange' },
            { value: 'urgent', label: 'Urgent', color: 'red' }
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
     * Get priority badge color
     * @param {string} priority - Priority
     * @returns {string} Badge color
     */
    getPriorityBadgeColor(priority) {
        const priorityOptions = this.getPriorityOptions();
        const priorityOption = priorityOptions.find(option => option.value === priority);
        return priorityOption ? priorityOption.color : 'gray';
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
            formattedDeliveryDate: order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'Not scheduled',
            statusBadge: this.getStatusBadgeColor(order.status),
            paymentStatusBadge: this.getPaymentStatusBadgeColor(order.payment_status),
            priorityBadge: this.getPriorityBadgeColor(order.priority)
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

        // Validate priority
        if (orderData.priority && !['low', 'medium', 'high', 'urgent'].includes(orderData.priority)) {
            errors.priority = 'Invalid priority value';
        }

        // Validate delivery date
        if (orderData.delivery_date && new Date(orderData.delivery_date) < new Date()) {
            errors.delivery_date = 'Delivery date cannot be in the past';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Get order workflow steps
     * @param {string} currentStatus - Current order status
     * @returns {Array} Available next steps
     */
    getOrderWorkflowSteps(currentStatus) {
        const workflows = {
            draft: ['confirmed', 'cancelled'],
            confirmed: ['in_progress', 'cancelled'],
            in_progress: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: []
        };

        return workflows[currentStatus] || [];
    }

    /**
     * Check if status transition is allowed
     * @param {string} fromStatus - Current status
     * @param {string} toStatus - Target status
     * @returns {boolean} Whether transition is allowed
     */
    isStatusTransitionAllowed(fromStatus, toStatus) {
        const allowedSteps = this.getOrderWorkflowSteps(fromStatus);
        return allowedSteps.includes(toStatus);
    }

    /**
     * Get order priority level
     * @param {string} priority - Priority string
     * @returns {number} Priority level (1-4)
     */
    getPriorityLevel(priority) {
        const levels = {
            low: 1,
            medium: 2,
            high: 3,
            urgent: 4
        };
        return levels[priority] || 2;
    }

    /**
     * Sort orders by priority
     * @param {Array} orders - Orders array
     * @returns {Array} Sorted orders
     */
    sortOrdersByPriority(orders) {
        return orders.sort((a, b) => {
            const priorityA = this.getPriorityLevel(a.priority);
            const priorityB = this.getPriorityLevel(b.priority);
            return priorityB - priorityA; // Higher priority first
        });
    }

    /**
     * Filter orders by date range
     * @param {Array} orders - Orders array
     * @param {string} dateFrom - Start date
     * @param {string} dateTo - End date
     * @returns {Array} Filtered orders
     */
    filterOrdersByDateRange(orders, dateFrom, dateTo) {
        if (!dateFrom && !dateTo) return orders;

        return orders.filter(order => {
            const orderDate = new Date(order.order_date);

            if (dateFrom && orderDate < new Date(dateFrom)) {
                return false;
            }

            if (dateTo && orderDate > new Date(dateTo)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Get orders summary
     * @param {Array} orders - Orders array
     * @returns {Object} Summary statistics
     */
    getOrdersSummary(orders) {
        const summary = {
            total: orders.length,
            totalAmount: 0,
            byStatus: {},
            byPaymentStatus: {},
            byPriority: {},
            avgOrderValue: 0
        };

        orders.forEach(order => {
            // Total amount
            summary.totalAmount += parseFloat(order.final_amount_eur || 0);

            // By status
            summary.byStatus[order.status] = (summary.byStatus[order.status] || 0) + 1;

            // By payment status
            summary.byPaymentStatus[order.payment_status] = (summary.byPaymentStatus[order.payment_status] || 0) + 1;

            // By priority
            summary.byPriority[order.priority] = (summary.byPriority[order.priority] || 0) + 1;
        });

        // Calculate average order value
        summary.avgOrderValue = summary.total > 0 ? summary.totalAmount / summary.total : 0;

        return summary;
    }
}

// Export singleton instance
export const orderService = new OrderService();
export default orderService; 