import apiService from './apiService.js';

/**
 * Order Service
 * Manages order-related API operations for Phase 6 features
 */
class OrderService {
    constructor() {
        this.baseEndpoint = '/orders';
    }

    /**
     * Get all orders with enhanced filtering and pagination
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
                sortOrder: params.sortOrder || 'DESC',
                currency: params.currency || null,
            };

            // Remove null/empty values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null || queryParams[key] === '') {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(this.baseEndpoint, queryParams);

            // Enhanced data processing
            if (response.success && response.data) {
                // Ensure customer data is properly formatted
                if (response.data.orders) {
                    response.data.orders = response.data.orders.map(order => ({
                        ...order,
                        // Enhanced customer data
                        customer_name: order.customer_name || order.customer?.name || order.store?.contact_person || null,
                        customer_phone: order.customer_phone || order.customer?.phone || order.store?.phone || null,
                        customer_email: order.customer_email || order.customer?.email || order.store?.email || null,
                        // Enhanced amount handling
                        display_amount: this.formatOrderAmount(order),
                        // Enhanced status info
                        status_label: this.getStatusLabel(order.status),
                        payment_status_label: this.getPaymentStatusLabel(order.payment_status),
                        priority_label: this.getPriorityLabel(order.priority),
                    }));
                }
            }

            return response;
        } catch (error) {
            console.error('Error fetching orders:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب الطلبات',
                data: null
            };
        }
    }

    /**
     * Get single order by ID with enhanced details
     * @param {number} id - Order ID
     * @returns {Promise} API response
     */
    async getOrder(id) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${id}`);

            if (response.success && response.data) {
                // Enhanced order data processing
                response.data = {
                    ...response.data,
                    customer_name: response.data.customer_name || response.data.customer?.name || response.data.store?.contact_person || null,
                    customer_phone: response.data.customer_phone || response.data.customer?.phone || response.data.store?.phone || null,
                    customer_email: response.data.customer_email || response.data.customer?.email || response.data.store?.email || null,
                    display_amount: this.formatOrderAmount(response.data),
                    status_label: this.getStatusLabel(response.data.status),
                    payment_status_label: this.getPaymentStatusLabel(response.data.payment_status),
                    priority_label: this.getPriorityLabel(response.data.priority),
                };
            }

            return response;
        } catch (error) {
            console.error('Error fetching order:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب تفاصيل الطلب',
                data: null
            };
        }
    }

    /**
     * Create new order with customer data
     * @param {Object} orderData - Order data including customer info
     * @returns {Promise} API response
     */
    async createOrder(orderData) {
        try {
            console.log('[OrderService] Creating order with data:', JSON.stringify(orderData, null, 2));

            // Enhanced order data validation and formatting
            const formattedData = {
                ...orderData,
                // Ensure customer data is included
                customer_name: orderData.customer_name || orderData.customer?.name || null,
                customer_phone: orderData.customer_phone || orderData.customer?.phone || null,
                customer_email: orderData.customer_email || orderData.customer?.email || null,
                // Enhanced currency handling
                currency: orderData.currency || 'EUR',
                // Default values
                priority: orderData.priority || 'normal',
                status: orderData.status || 'draft',
                payment_status: orderData.payment_status || 'pending',
            };

            console.log('[OrderService] Formatted data:', JSON.stringify(formattedData, null, 2));
            const response = await apiService.post(this.baseEndpoint, formattedData);
            return response;
        } catch (error) {
            console.error('Error creating order:', error);
            if (error.response?.data) {
                console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
            }
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'خطأ في إنشاء الطلب',
                data: null
            };
        }
    }

    /**
     * Update order with enhanced customer data
     * @param {number} id - Order ID
     * @param {Object} orderData - Updated order data
     * @returns {Promise} API response
     */
    async updateOrder(id, orderData) {
        try {
            const response = await apiService.put(`${this.baseEndpoint}/${id}`, orderData);
            return response;
        } catch (error) {
            console.error('Error updating order:', error);
            return {
                success: false,
                message: error.message || 'خطأ في تحديث الطلب',
                data: null
            };
        }
    }

    /**
     * Delete order (only draft orders can be deleted)
     * @param {number} id - Order ID
     * @returns {Promise} API response
     */
    async deleteOrder(id) {
        try {
            // First check the order status to provide better error messages
            const orderResponse = await this.getOrder(id);

            if (orderResponse.success && orderResponse.data) {
                const order = orderResponse.data;

                // Check if order can be deleted (only draft orders)
                if (order.status !== 'draft') {
                    return {
                        success: false,
                        message: 'لا يمكن حذف الطلب بعد تأكيده. يمكن حذف الطلبات المسودة فقط.',
                        data: null
                    };
                }
            }

            const response = await apiService.delete(`${this.baseEndpoint}/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting order:', error);

            // Handle specific error codes
            if (error.response?.status === 400) {
                return {
                    success: false,
                    message: 'لا يمكن حذف الطلب بعد تأكيده. يمكن حذف الطلبات المسودة فقط.',
                    data: null
                };
            } else if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'الطلب غير موجود',
                    data: null
                };
            } else if (error.response?.status === 403) {
                return {
                    success: false,
                    message: 'غير مصرح لك بحذف هذا الطلب',
                    data: null
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || error.message || 'خطأ في حذف الطلب',
                data: null
            };
        }
    }

    /**
     * Bulk operations for orders (Phase 6 feature)
     * @param {Array} orderIds - Array of order IDs
     * @param {string} action - Action to perform (update_status, assign_distributor, update_priority, delete)
     * @param {Object} actionData - Data for the action
     * @returns {Promise} API response
     */
    async bulkOrderOperation(orderIds, action, actionData = {}) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/bulk`, {
                order_ids: orderIds,
                action: action,
                data: actionData
            });
            return response;
        } catch (error) {
            console.error('Error performing bulk operation:', error);
            return {
                success: false,
                message: error.message || 'خطأ في تنفيذ العملية المجمعة',
                data: null
            };
        }
    }

    /**
     * Update multiple order statuses
     * @param {Array} orderIds - Array of order IDs
     * @param {string} status - New status
     * @returns {Promise} API response
     */
    async bulkUpdateStatus(orderIds, status) {
        return this.bulkOrderOperation(orderIds, 'update_status', { status });
    }

    /**
     * Assign distributor to multiple orders
     * @param {Array} orderIds - Array of order IDs
     * @param {number} distributorId - Distributor ID
     * @returns {Promise} API response
     */
    async bulkAssignDistributor(orderIds, distributorId) {
        return this.bulkOrderOperation(orderIds, 'assign_distributor', { distributor_id: distributorId });
    }

    /**
     * Update multiple order priorities
     * @param {Array} orderIds - Array of order IDs
     * @param {string} priority - New priority
     * @returns {Promise} API response
     */
    async bulkUpdatePriority(orderIds, priority) {
        return this.bulkOrderOperation(orderIds, 'update_priority', { priority });
    }

    /**
     * Delete multiple orders
     * @param {Array} orderIds - Array of order IDs
     * @returns {Promise} API response
     */
    async bulkDeleteOrders(orderIds) {
        return this.bulkOrderOperation(orderIds, 'delete');
    }

    /**
     * Get order statistics with enhanced metrics
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getOrderStatistics(params = {}) {
        try {
            const queryParams = {
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                store_id: params.store_id || null,
                currency: params.currency || null,
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
            console.error('Error fetching order statistics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات الطلبات',
                data: null
            };
        }
    }

    /**
     * Export orders data (Phase 6 feature)
     * @param {Object} filters - Export filters
     * @param {string} format - Export format (json, csv, excel)
     * @returns {Promise} API response
     */
    async exportOrders(filters = {}, format = 'json') {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/export`, {
                ...filters,
                format: format
            });
            return response;
        } catch (error) {
            console.error('Error exporting orders:', error);
            return {
                success: false,
                message: error.message || 'خطأ في تصدير الطلبات',
                data: null
            };
        }
    }

    /**
     * Get exchange rates for multi-currency support (Phase 6 feature)
     * @returns {Promise} API response
     */
    async getExchangeRates() {
        try {
            const response = await apiService.get('/exchange-rates');
            return response;
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب أسعار الصرف',
                data: { EUR_to_SYP: 15000, SYP_to_EUR: 0.0000667 } // Fallback rates
            };
        }
    }

    /**
     * Calculate dynamic pricing (Phase 6 feature)
     * @param {Object} pricingData - Pricing calculation data
     * @returns {Promise} API response
     */
    async calculateDynamicPricing(pricingData) {
        try {
            const response = await apiService.post('/pricing/calculate', pricingData);
            return response;
        } catch (error) {
            console.error('Error calculating dynamic pricing:', error);
            return {
                success: false,
                message: error.message || 'خطأ في حساب التسعير الديناميكي',
                data: null
            };
        }
    }

    /**
     * Manage customer data (Phase 6 feature)
     * @param {Object} customerData - Customer information
     * @returns {Promise} API response
     */
    async saveCustomerData(customerData) {
        try {
            const response = await apiService.post('/customers', customerData);
            return response;
        } catch (error) {
            console.error('Error saving customer data:', error);
            return {
                success: false,
                message: error.message || 'خطأ في حفظ بيانات العميل',
                data: null
            };
        }
    }

    /**
     * Get customer suggestions based on input
     * @param {string} query - Search query
     * @returns {Promise} API response
     */
    async searchCustomers(query) {
        try {
            const response = await apiService.get('/customers/search', { q: query });
            return response;
        } catch (error) {
            console.error('Error searching customers:', error);
            return {
                success: false,
                message: error.message || 'خطأ في البحث عن العملاء',
                data: []
            };
        }
    }

    // Helper methods for data formatting
    formatOrderAmount(order) {
        const amountEur = parseFloat(order.final_amount_eur || order.total_amount_eur || 0);
        const amountSyp = parseFloat(order.final_amount_syp || order.total_amount_syp || 0);
        const currency = order.currency || 'EUR';

        if (currency === 'MIXED' && amountEur > 0 && amountSyp > 0) {
            return `€${amountEur.toFixed(2)} + ${amountSyp.toLocaleString()} ل.س`;
        }

        if (currency === 'EUR' || amountEur > 0) {
            return `€${amountEur.toLocaleString()}`;
        } else {
            return `${amountSyp.toLocaleString()} ل.س`;
        }
    }

    getStatusLabel(status) {
        const labels = {
            draft: 'مسودة',
            pending: 'معلق',
            confirmed: 'مؤكد',
            processing: 'قيد التحضير',
            ready: 'جاهز',
            delivered: 'مُسلم',
            cancelled: 'ملغي',
            returned: 'مرتد',
        };
        return labels[status] || status;
    }

    getPaymentStatusLabel(status) {
        const labels = {
            pending: 'معلق',
            paid: 'مدفوع',
            partial: 'جزئي',
            failed: 'فاشل',
            overdue: 'متأخر',
            refunded: 'مرتد',
        };
        return labels[status] || status;
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'منخفض',
            normal: 'متوسط',
            high: 'عالي',
            urgent: 'عاجل',
        };
        return labels[priority] || priority;
    }

    /**
     * Get orders summary for dashboard
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
            avgOrderValue: 0,
        };

        orders.forEach(order => {
            // Total amount (prioritize EUR, fallback to SYP converted)
            const amountEur = parseFloat(order.final_amount_eur || order.total_amount_eur || 0);
            const amountSyp = parseFloat(order.final_amount_syp || order.total_amount_syp || 0);
            summary.totalAmount += amountEur > 0 ? amountEur : (amountSyp / 15000); // Simple conversion

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

    // Helper methods for UI components (needed by OrderDetailsPage)

    /**
     * Get order status options
     * @returns {Array} Status options
     */
    getStatusOptions() {
        return [
            { value: 'draft', label: 'مسودة', color: 'gray' },
            { value: 'pending', label: 'معلق', color: 'yellow' },
            { value: 'confirmed', label: 'مؤكد', color: 'blue' },
            { value: 'processing', label: 'قيد التحضير', color: 'purple' },
            { value: 'ready', label: 'جاهز', color: 'indigo' },
            { value: 'delivered', label: 'مُسلم', color: 'green' },
            { value: 'cancelled', label: 'ملغي', color: 'red' },
        ];
    }

    /**
     * Get payment status options
     * @returns {Array} Payment status options
     */
    getPaymentStatusOptions() {
        return [
            { value: 'pending', label: 'معلق', color: 'gray' },
            { value: 'paid', label: 'مدفوع', color: 'green' },
            { value: 'partial', label: 'جزئي', color: 'yellow' },
            { value: 'failed', label: 'فاشل', color: 'red' },
            { value: 'overdue', label: 'متأخر', color: 'orange' },
        ];
    }

    /**
     * Get priority options
     * @returns {Array} Priority options
     */
    getPriorityOptions() {
        return [
            { value: 'low', label: 'منخفض', color: 'green' },
            { value: 'normal', label: 'متوسط', color: 'blue' },
            { value: 'high', label: 'عالي', color: 'orange' },
            { value: 'urgent', label: 'عاجل', color: 'red' },
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

    // Additional methods needed by OrderDetailsPage

    /**
     * Update order status (legacy compatibility)
     * @param {number} id - Order ID
     * @param {string} status - New status
     * @returns {Promise} API response
     */
    async updateOrderStatus(id, status) {
        return this.updateOrder(id, { status });
    }

    /**
     * Update payment status (legacy compatibility)
     * @param {number} id - Order ID
     * @param {string} payment_status - New payment status
     * @returns {Promise} API response
     */
    async updatePaymentStatus(id, payment_status) {
        return this.updateOrder(id, { payment_status });
    }

    /**
     * Update order priority (legacy compatibility)
     * @param {number} id - Order ID
     * @param {string} priority - New priority
     * @returns {Promise} API response
     */
    async updateOrderPriority(id, priority) {
        return this.updateOrder(id, { priority });
    }
}

// Export singleton instance
const orderService = new OrderService();
export default orderService; 