import { apiService } from './apiService';

/**
 * Refund Service
 * Handles refunds and returns for orders
 */
class RefundService {
    constructor() {
        this.baseEndpoint = '/refunds';
    }

    /**
     * Create a refund request
     * @param {Object} refundData - Refund request data
     * @returns {Promise} Refund creation result
     */
    async createRefund(refundData) {
        try {
            const data = {
                order_id: refundData.order_id,
                refund_type: refundData.refund_type || 'full', // 'full', 'partial', 'item'
                refund_reason: refundData.refund_reason || 'customer_request',
                refund_amount_eur: refundData.refund_amount_eur || null,
                refund_amount_syp: refundData.refund_amount_syp || null,
                currency: refundData.currency || 'EUR',
                refund_method: refundData.refund_method || 'original_payment', // 'original_payment', 'bank_transfer', 'cash', 'store_credit'
                notes: refundData.notes || null,
                customer_bank_details: refundData.customer_bank_details || null,
                items: refundData.items || null, // For partial refunds
                requested_by: refundData.requested_by || null,
                customer_id: refundData.customer_id || null,
                customer_name: refundData.customer_name || null,
                customer_email: refundData.customer_email || null,
                customer_phone: refundData.customer_phone || null,
                refund_date: refundData.refund_date || new Date().toISOString(),
                expected_processing_time: refundData.expected_processing_time || 5, // days
                ...refundData
            };

            const response = await apiService.post(`${this.baseEndpoint}/create`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to create refund: ${error.message}`);
        }
    }

    /**
     * Get all refunds with filtering
     * @param {Object} params - Query parameters
     * @returns {Promise} Refunds list
     */
    async getRefunds(params = {}) {
        try {
            const queryParams = {
                page: params.page || 1,
                limit: params.limit || 10,
                status: params.status || null,
                refund_type: params.refund_type || null,
                refund_method: params.refund_method || null,
                currency: params.currency || null,
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                order_id: params.order_id || null,
                customer_id: params.customer_id || null,
                amount_min: params.amount_min || null,
                amount_max: params.amount_max || null,
                search: params.search || '',
                sortBy: params.sortBy || 'created_at',
                sortOrder: params.sortOrder || 'DESC',
                ...params
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
            throw new Error(`Failed to get refunds: ${error.message}`);
        }
    }

    /**
     * Get refund by ID
     * @param {number} refundId - Refund ID
     * @returns {Promise} Refund details
     */
    async getRefund(refundId) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${refundId}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get refund: ${error.message}`);
        }
    }

    /**
     * Update refund status
     * @param {number} refundId - Refund ID
     * @param {string} status - New status
     * @param {Object} additionalData - Additional data
     * @returns {Promise} Update result
     */
    async updateRefundStatus(refundId, status, additionalData = {}) {
        try {
            const data = {
                status: status,
                processed_by: additionalData.processed_by || null,
                processing_notes: additionalData.processing_notes || null,
                processing_date: additionalData.processing_date || new Date().toISOString(),
                actual_refund_amount_eur: additionalData.actual_refund_amount_eur || null,
                actual_refund_amount_syp: additionalData.actual_refund_amount_syp || null,
                transaction_reference: additionalData.transaction_reference || null,
                ...additionalData
            };

            const response = await apiService.put(`${this.baseEndpoint}/${refundId}/status`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to update refund status: ${error.message}`);
        }
    }

    /**
     * Process refund
     * @param {number} refundId - Refund ID
     * @param {Object} processingData - Processing data
     * @returns {Promise} Processing result
     */
    async processRefund(refundId, processingData) {
        try {
            const data = {
                processing_method: processingData.processing_method || 'manual',
                transaction_reference: processingData.transaction_reference || null,
                bank_reference: processingData.bank_reference || null,
                processing_fee: processingData.processing_fee || 0,
                actual_refund_amount_eur: processingData.actual_refund_amount_eur || null,
                actual_refund_amount_syp: processingData.actual_refund_amount_syp || null,
                processing_notes: processingData.processing_notes || null,
                processed_by: processingData.processed_by || null,
                ...processingData
            };

            const response = await apiService.post(`${this.baseEndpoint}/${refundId}/process`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to process refund: ${error.message}`);
        }
    }

    /**
     * Calculate refund amount
     * @param {Object} refundData - Refund calculation data
     * @returns {Promise} Refund calculation result
     */
    async calculateRefund(refundData) {
        try {
            const data = {
                order_id: refundData.order_id,
                refund_type: refundData.refund_type || 'full',
                items: refundData.items || null,
                deduction_reason: refundData.deduction_reason || null,
                deduction_amount: refundData.deduction_amount || 0,
                processing_fee: refundData.processing_fee || 0,
                currency: refundData.currency || 'EUR',
                ...refundData
            };

            const response = await apiService.post(`${this.baseEndpoint}/calculate`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to calculate refund: ${error.message}`);
        }
    }

    /**
     * Get refund statistics
     * @param {Object} params - Query parameters
     * @returns {Promise} Refund statistics
     */
    async getRefundStatistics(params = {}) {
        try {
            const queryParams = {
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                currency: params.currency || null,
                refund_type: params.refund_type || null,
                group_by: params.group_by || 'month', // 'day', 'week', 'month', 'year'
                ...params
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
            throw new Error(`Failed to get refund statistics: ${error.message}`);
        }
    }

    /**
     * Get refund reasons
     * @returns {Promise} Refund reasons
     */
    async getRefundReasons() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/reasons`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get refund reasons: ${error.message}`);
        }
    }

    /**
     * Add refund reason
     * @param {Object} reasonData - Reason data
     * @returns {Promise} Add result
     */
    async addRefundReason(reasonData) {
        try {
            const data = {
                reason_code: reasonData.reason_code,
                reason_name: reasonData.reason_name,
                description: reasonData.description || null,
                is_active: reasonData.is_active !== undefined ? reasonData.is_active : true,
                requires_approval: reasonData.requires_approval !== undefined ? reasonData.requires_approval : false,
                auto_approve_threshold: reasonData.auto_approve_threshold || null,
                ...reasonData
            };

            const response = await apiService.post(`${this.baseEndpoint}/reasons`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to add refund reason: ${error.message}`);
        }
    }

    /**
     * Get refund approval workflow
     * @param {number} refundId - Refund ID
     * @returns {Promise} Approval workflow
     */
    async getRefundApprovalWorkflow(refundId) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${refundId}/approval-workflow`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get approval workflow: ${error.message}`);
        }
    }

    /**
     * Approve refund
     * @param {number} refundId - Refund ID
     * @param {Object} approvalData - Approval data
     * @returns {Promise} Approval result
     */
    async approveRefund(refundId, approvalData) {
        try {
            const data = {
                approved_by: approvalData.approved_by,
                approval_notes: approvalData.approval_notes || null,
                approved_amount_eur: approvalData.approved_amount_eur || null,
                approved_amount_syp: approvalData.approved_amount_syp || null,
                approval_date: approvalData.approval_date || new Date().toISOString(),
                ...approvalData
            };

            const response = await apiService.post(`${this.baseEndpoint}/${refundId}/approve`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to approve refund: ${error.message}`);
        }
    }

    /**
     * Reject refund
     * @param {number} refundId - Refund ID
     * @param {Object} rejectionData - Rejection data
     * @returns {Promise} Rejection result
     */
    async rejectRefund(refundId, rejectionData) {
        try {
            const data = {
                rejected_by: rejectionData.rejected_by,
                rejection_reason: rejectionData.rejection_reason,
                rejection_notes: rejectionData.rejection_notes || null,
                rejection_date: rejectionData.rejection_date || new Date().toISOString(),
                ...rejectionData
            };

            const response = await apiService.post(`${this.baseEndpoint}/${refundId}/reject`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to reject refund: ${error.message}`);
        }
    }

    /**
     * Get refund history
     * @param {number} refundId - Refund ID
     * @returns {Promise} Refund history
     */
    async getRefundHistory(refundId) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${refundId}/history`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get refund history: ${error.message}`);
        }
    }

    /**
     * Export refunds
     * @param {Object} params - Export parameters
     * @returns {Promise} Export result
     */
    async exportRefunds(params = {}) {
        try {
            const queryParams = {
                format: params.format || 'csv', // 'csv', 'excel', 'pdf'
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                status: params.status || null,
                currency: params.currency || null,
                include_items: params.include_items || false,
                ...params
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
            throw new Error(`Failed to export refunds: ${error.message}`);
        }
    }

    /**
     * Get refund methods
     * @returns {Promise} Refund methods
     */
    async getRefundMethods() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/methods`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get refund methods: ${error.message}`);
        }
    }

    /**
     * Validate refund request
     * @param {Object} refundData - Refund data to validate
     * @returns {Promise} Validation result
     */
    async validateRefundRequest(refundData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/validate`, refundData);
            return response;
        } catch (error) {
            throw new Error(`Failed to validate refund request: ${error.message}`);
        }
    }

    /**
     * Get refund compliance report
     * @param {Object} params - Report parameters
     * @returns {Promise} Compliance report
     */
    async getRefundComplianceReport(params = {}) {
        try {
            const queryParams = {
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                report_type: params.report_type || 'summary',
                currency: params.currency || null,
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/compliance-report`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get compliance report: ${error.message}`);
        }
    }

    /**
     * Get refund analytics
     * @param {Object} params - Analytics parameters
     * @returns {Promise} Refund analytics
     */
    async getRefundAnalytics(params = {}) {
        try {
            const queryParams = {
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                analytics_type: params.analytics_type || 'trends',
                currency: params.currency || null,
                group_by: params.group_by || 'month',
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/analytics`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get refund analytics: ${error.message}`);
        }
    }
}

export default new RefundService(); 