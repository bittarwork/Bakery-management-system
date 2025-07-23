import apiService from './apiService.js';

/**
 * Auto-Scheduling Service
 * Handles AI-powered scheduling drafts and admin review functionality
 */
class AutoSchedulingService {
    constructor() {
        this.baseEndpoint = '/auto-scheduling';
    }

    /**
     * Get pending scheduling drafts for admin review
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getPendingReviews(params = {}) {
        try {
            const queryParams = {
                page: params.page || 1,
                limit: params.limit || 10,
                status: params.status || 'pending_review'
            };

            const response = await apiService.get(`${this.baseEndpoint}/pending-reviews`, queryParams);
            return response;
        } catch (error) {
            console.error('Error fetching pending reviews:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب المسودات المعلقة',
                data: null
            };
        }
    }

    /**
     * Get scheduling draft details by ID
     * @param {number} draftId - Draft ID
     * @returns {Promise} API response
     */
    async getSchedulingDraft(draftId) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/drafts/${draftId}`);
            return response;
        } catch (error) {
            console.error('Error fetching scheduling draft:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب تفاصيل مسودة الجدولة',
                data: null
            };
        }
    }

    /**
     * Approve scheduling draft with optional modifications
     * @param {number} draftId - Draft ID
     * @param {Object} approvalData - Approval data
     * @returns {Promise} API response
     */
    async approveSchedulingDraft(draftId, approvalData = {}) {
        try {
            const {
                modifications = null,
                admin_notes = '',
                create_distribution_trip = true
            } = approvalData;

            const response = await apiService.post(`${this.baseEndpoint}/drafts/${draftId}/approve`, {
                modifications,
                admin_notes,
                create_distribution_trip
            });

            return response;
        } catch (error) {
            console.error('Error approving scheduling draft:', error);
            return {
                success: false,
                message: error.message || 'خطأ في إعتماد مسودة الجدولة',
                data: null
            };
        }
    }

    /**
     * Reject scheduling draft
     * @param {number} draftId - Draft ID
     * @param {string} reason - Rejection reason
     * @param {boolean} reassignToManual - Whether to reassign to manual scheduling
     * @returns {Promise} API response
     */
    async rejectSchedulingDraft(draftId, reason, reassignToManual = false) {
        try {
            if (!reason) {
                throw new Error('سبب الرفض مطلوب');
            }

            const response = await apiService.post(`${this.baseEndpoint}/drafts/${draftId}/reject`, {
                reason,
                reassign_to_manual: reassignToManual
            });

            return response;
        } catch (error) {
            console.error('Error rejecting scheduling draft:', error);
            return {
                success: false,
                message: error.message || 'خطأ في رفض مسودة الجدولة',
                data: null
            };
        }
    }

    /**
     * Get scheduling statistics for dashboard
     * @param {string} period - Period (today, week, month)
     * @returns {Promise} API response
     */
    async getSchedulingStatistics(period = 'month') {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/statistics`, { period });
            return response;
        } catch (error) {
            console.error('Error fetching scheduling statistics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات الجدولة',
                data: null
            };
        }
    }

    /**
     * Trigger manual scheduling for an order
     * @param {number} orderId - Order ID
     * @returns {Promise} API response
     */
    async triggerManualScheduling(orderId) {
        try {
            if (!orderId) {
                throw new Error('معرف الطلب مطلوب');
            }

            const response = await apiService.post(`${this.baseEndpoint}/manual-schedule`, {
                order_id: orderId
            });

            return response;
        } catch (error) {
            console.error('Error triggering manual scheduling:', error);
            return {
                success: false,
                message: error.message || 'خطأ في إنشاء الجدولة اليدوية',
                data: null
            };
        }
    }

    /**
     * Format draft data for display
     * @param {Object} draft - Draft data
     * @returns {Object} Formatted draft data
     */
    formatDraftForDisplay(draft) {
        return {
            ...draft,
            confidence_score_display: `${draft.confidence_score}%`,
            confidence_level: this.getConfidenceLevel(draft.confidence_score),
            confidence_color: this.getConfidenceColor(draft.confidence_score),
            status_display: this.getStatusDisplayName(draft.status),
            status_color: this.getStatusColor(draft.status),
            reasoning_text: this.formatReasoningText(draft.reasoning),
            formatted_date: new Date(draft.suggested_delivery_date).toLocaleDateString('ar-SA'),
            formatted_created_at: new Date(draft.created_at).toLocaleDateString('ar-SA'),
            formatted_amount_eur: new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'EUR'
            }).format(draft.total_amount_eur || 0),
            formatted_amount_syp: new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SYP'
            }).format(draft.total_amount_syp || 0)
        };
    }

    /**
     * Get confidence level based on score
     * @param {number} score - Confidence score
     * @returns {string} Confidence level
     */
    getConfidenceLevel(score) {
        if (score >= 90) return 'ممتاز';
        if (score >= 80) return 'جيد جداً';
        if (score >= 70) return 'جيد';
        if (score >= 60) return 'مقبول';
        return 'منخفض';
    }

    /**
     * Get confidence color based on score
     * @param {number} score - Confidence score
     * @returns {string} Color class
     */
    getConfidenceColor(score) {
        if (score >= 90) return 'green';
        if (score >= 80) return 'blue';
        if (score >= 70) return 'yellow';
        if (score >= 60) return 'orange';
        return 'red';
    }

    /**
     * Get status display name
     * @param {string} status - Status code
     * @returns {string} Display name
     */
    getStatusDisplayName(status) {
        const statusMap = {
            'pending_review': 'في انتظار المراجعة',
            'reviewed': 'تمت المراجعة',
            'approved': 'معتمد',
            'rejected': 'مرفوض',
            'modified': 'معتمد مع تعديلات'
        };
        return statusMap[status] || status;
    }

    /**
     * Get status color
     * @param {string} status - Status code
     * @returns {string} Color class
     */
    getStatusColor(status) {
        const colorMap = {
            'pending_review': 'yellow',
            'reviewed': 'blue',
            'approved': 'green',
            'rejected': 'red',
            'modified': 'purple'
        };
        return colorMap[status] || 'gray';
    }

    /**
     * Format reasoning text for display
     * @param {Object} reasoning - Reasoning object
     * @returns {string} Formatted text
     */
    formatReasoningText(reasoning) {
        if (!reasoning || !reasoning.main_factors) {
            return 'تحليل النظام الذكي';
        }

        const factors = reasoning.main_factors;
        if (Array.isArray(factors) && factors.length > 0) {
            return factors.join('، ');
        }

        return 'تحليل النظام الذكي';
    }

    /**
     * Get status options for filters
     * @returns {Array} Status options
     */
    getStatusOptions() {
        return [
            { value: '', label: 'جميع الحالات' },
            { value: 'pending_review', label: 'في انتظار المراجعة', color: 'yellow' },
            { value: 'approved', label: 'معتمد', color: 'green' },
            { value: 'modified', label: 'معتمد مع تعديلات', color: 'purple' },
            { value: 'rejected', label: 'مرفوض', color: 'red' }
        ];
    }

    /**
     * Get priority options
     * @returns {Array} Priority options
     */
    getPriorityOptions() {
        return [
            { value: 'low', label: 'منخفضة', color: 'gray' },
            { value: 'normal', label: 'عادية', color: 'blue' },
            { value: 'high', label: 'عالية', color: 'orange' },
            { value: 'urgent', label: 'عاجل', color: 'red' }
        ];
    }

    /**
     * Get priority display name
     * @param {string} priority - Priority code
     * @returns {string} Display name
     */
    getPriorityDisplayName(priority) {
        const priorityOptions = this.getPriorityOptions();
        const priorityOption = priorityOptions.find(option => option.value === priority);
        return priorityOption ? priorityOption.label : priority;
    }

    /**
     * Get priority color
     * @param {string} priority - Priority code
     * @returns {string} Color class
     */
    getPriorityColor(priority) {
        const priorityOptions = this.getPriorityOptions();
        const priorityOption = priorityOptions.find(option => option.value === priority);
        return priorityOption ? priorityOption.color : 'gray';
    }

    /**
     * Validate modification data
     * @param {Object} modifications - Modification data
     * @returns {Object} Validation result
     */
    validateModifications(modifications) {
        const errors = [];

        if (modifications.distributor_id && !Number.isInteger(modifications.distributor_id)) {
            errors.push('معرف الموزع يجب أن يكون رقم صحيح');
        }

        if (modifications.delivery_date) {
            const deliveryDate = new Date(modifications.delivery_date);
            const today = new Date();
            if (deliveryDate < today) {
                errors.push('تاريخ التسليم لا يمكن أن يكون في الماضي');
            }
        }

        if (modifications.priority && !['low', 'normal', 'high', 'urgent'].includes(modifications.priority)) {
            errors.push('الأولوية غير صحيحة');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Create and export service instance
const autoSchedulingService = new AutoSchedulingService();
export default autoSchedulingService; 