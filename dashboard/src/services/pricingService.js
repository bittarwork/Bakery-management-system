/**
 * Enhanced Pricing Service
 * Handles dynamic pricing, price history, and bulk price updates
 * Phase 6 - Complete Order Management
 */

import apiService from './apiService';

class PricingService {
    /**
     * Get all pricing rules with pagination and filtering
     */
    async getPricingRules(params = {}) {
        const {
            page = 1,
            limit = 10,
            is_active,
            rule_type,
            search
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        if (is_active !== undefined) {
            queryParams.append('is_active', is_active.toString());
        }
        if (rule_type) {
            queryParams.append('rule_type', rule_type);
        }
        if (search) {
            queryParams.append('search', search);
        }

        return await apiService.get(`/pricing/rules?${queryParams}`);
    }

    /**
     * Create new pricing rule
     */
    async createPricingRule(ruleData) {
        return await apiService.post('/pricing/rules', ruleData);
    }

    /**
     * Update pricing rule
     */
    async updatePricingRule(ruleId, ruleData) {
        return await apiService.put(`/pricing/rules/${ruleId}`, ruleData);
    }

    /**
     * Delete pricing rule
     */
    async deletePricingRule(ruleId) {
        return await apiService.delete(`/pricing/rules/${ruleId}`);
    }

    /**
     * Calculate dynamic price for a product
     */
    async calculateDynamicPrice(productData) {
        return await apiService.post('/pricing/calculate', productData);
    }

    /**
     * Bulk calculate prices for multiple products
     */
    async calculateBulkPrices(productsData) {
        return await apiService.post('/pricing/calculate-bulk', {
            products_data: productsData
        });
    }

    /**
     * Bulk update product prices
     */
    async bulkUpdatePrices(updateData) {
        return await apiService.post('/pricing/bulk-update', updateData);
    }

    /**
     * Get bulk operations history
     */
    async getBulkOperations(params = {}) {
        const {
            page = 1,
            limit = 10,
            operation_type,
            date_from,
            date_to
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        if (operation_type) {
            queryParams.append('operation_type', operation_type);
        }
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }

        return await apiService.get(`/pricing/bulk-operations?${queryParams}`);
    }

    /**
     * Get price history
     */
    async getPriceHistory(params = {}) {
        const {
            product_id,
            page = 1,
            limit = 10,
            date_from,
            date_to,
            change_type
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        if (product_id) {
            queryParams.append('product_id', product_id.toString());
        }
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }
        if (change_type) {
            queryParams.append('change_type', change_type);
        }

        return await apiService.get(`/pricing/history?${queryParams}`);
    }

    /**
     * Get pricing statistics
     */
    async getPricingStatistics(params = {}) {
        const { date_from, date_to } = params;

        const queryParams = new URLSearchParams();
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }

        return await apiService.get(`/pricing/statistics?${queryParams}`);
    }

    /**
     * Get product pricing overview
     */
    async getProductsPricingOverview(params = {}) {
        const { category, price_range, search } = params;

        const queryParams = new URLSearchParams();
        if (category) {
            queryParams.append('category', category);
        }
        if (price_range) {
            queryParams.append('price_range', price_range);
        }
        if (search) {
            queryParams.append('search', search);
        }

        return await apiService.get(`/pricing/products-overview?${queryParams}`);
    }

    /**
     * Helper method to format pricing rule conditions for display
     */
    formatRuleConditions(conditions) {
        if (!conditions || typeof conditions !== 'object') {
            return 'بدون شروط';
        }

        const conditionTexts = [];

        if (conditions.min_quantity) {
            conditionTexts.push(`الكمية الدنيا: ${conditions.min_quantity}`);
        }
        if (conditions.max_quantity) {
            conditionTexts.push(`الكمية العليا: ${conditions.max_quantity}`);
        }
        if (conditions.min_order_amount) {
            conditionTexts.push(`قيمة الطلب الدنيا: €${conditions.min_order_amount}`);
        }
        if (conditions.customer_type) {
            conditionTexts.push(`نوع العميل: ${conditions.customer_type}`);
        }
        if (conditions.season) {
            conditionTexts.push(`الموسم: ${conditions.season}`);
        }
        if (conditions.weekdays && Array.isArray(conditions.weekdays)) {
            const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const selectedDays = conditions.weekdays.map(day => dayNames[day]).join(', ');
            conditionTexts.push(`أيام الأسبوع: ${selectedDays}`);
        }

        return conditionTexts.length > 0 ? conditionTexts.join(' | ') : 'بدون شروط';
    }

    /**
     * Helper method to format pricing rule actions for display
     */
    formatRuleAction(action, ruleType) {
        if (!action || typeof action !== 'object') {
            return 'بدون إجراء';
        }

        switch (ruleType) {
            case 'percentage':
                if (action.discount_percentage) {
                    return `خصم ${action.discount_percentage}%`;
                }
                if (action.increase_percentage) {
                    return `زيادة ${action.increase_percentage}%`;
                }
                break;

            case 'fixed':
                if (action.discount_amount) {
                    return `خصم €${action.discount_amount}`;
                }
                if (action.increase_amount) {
                    return `زيادة €${action.increase_amount}`;
                }
                if (action.fixed_price) {
                    return `سعر ثابت €${action.fixed_price}`;
                }
                break;

            case 'tiered':
                if (action.tiers && Array.isArray(action.tiers)) {
                    return `تسعير متدرج (${action.tiers.length} مستوى)`;
                }
                break;

            case 'seasonal':
                return 'تسعير موسمي';
        }

        return 'إجراء مخصص';
    }

    /**
     * Helper method to get price change direction and color
     */
    getPriceChangeInfo(oldPrice, newPrice) {
        const diff = newPrice - oldPrice;
        const percentage = oldPrice > 0 ? Math.round((diff / oldPrice) * 100 * 100) / 100 : 0;

        if (diff > 0) {
            return {
                direction: 'increase',
                color: 'text-red-600',
                icon: '↗',
                text: `زيادة €${diff.toFixed(2)} (+${percentage}%)`,
                bgColor: 'bg-red-50'
            };
        } else if (diff < 0) {
            return {
                direction: 'decrease',
                color: 'text-green-600',
                icon: '↘',
                text: `انخفاض €${Math.abs(diff).toFixed(2)} (${percentage}%)`,
                bgColor: 'bg-green-50'
            };
        } else {
            return {
                direction: 'no_change',
                color: 'text-gray-600',
                icon: '→',
                text: 'بدون تغيير',
                bgColor: 'bg-gray-50'
            };
        }
    }

    /**
     * Helper method to format bulk operation status
     */
    getBulkOperationStatus(operation) {
        const successRate = operation.total_items > 0 ?
            (operation.successful_items / operation.total_items) * 100 : 0;

        if (successRate === 100) {
            return {
                status: 'success',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                text: 'مكتمل بنجاح'
            };
        } else if (successRate > 50) {
            return {
                status: 'partial',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                text: 'مكتمل جزئياً'
            };
        } else if (successRate > 0) {
            return {
                status: 'failed_partial',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                text: 'فشل معظم العناصر'
            };
        } else {
            return {
                status: 'failed',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                text: 'فشل كامل'
            };
        }
    }

    /**
     * Validate pricing rule data
     */
    validatePricingRule(ruleData) {
        const errors = [];

        if (!ruleData.name || ruleData.name.trim().length === 0) {
            errors.push('اسم القاعدة مطلوب');
        }

        if (!ruleData.rule_type) {
            errors.push('نوع القاعدة مطلوب');
        }

        if (!ruleData.conditions || Object.keys(ruleData.conditions).length === 0) {
            errors.push('يجب تحديد شرط واحد على الأقل');
        }

        if (!ruleData.action || Object.keys(ruleData.action).length === 0) {
            errors.push('يجب تحديد إجراء واحد على الأقل');
        }

        if (ruleData.start_date && ruleData.end_date) {
            if (new Date(ruleData.start_date) >= new Date(ruleData.end_date)) {
                errors.push('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
            }
        }

        return errors;
    }

    /**
     * Generate pricing rule preview text
     */
    generateRulePreview(ruleData) {
        const conditions = this.formatRuleConditions(ruleData.conditions);
        const action = this.formatRuleAction(ruleData.action, ruleData.rule_type);

        return `${ruleData.name}: عند ${conditions} → ${action}`;
    }
}

export default new PricingService(); 