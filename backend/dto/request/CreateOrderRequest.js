/**
 * Data Transfer Object for creating a new order
 */
export class CreateOrderRequest {
    constructor(data) {
        this.store_id = parseInt(data.store_id);
        this.order_date = data.order_date || new Date().toISOString().split('T')[0];
        this.delivery_date = data.delivery_date || null;
        this.total_amount = parseFloat(data.total_amount) || 0.00;
        this.discount_amount = parseFloat(data.discount_amount) || 0.00;
        this.final_amount = parseFloat(data.final_amount) || (this.total_amount - this.discount_amount);
        this.notes = data.notes || null;
        this.items = Array.isArray(data.items) ? data.items : [];
    }

    /**
     * Validate the request data
     * @returns {Object} validation result
     */
    validate() {
        const errors = [];

        if (!this.store_id || !Number.isInteger(this.store_id) || this.store_id <= 0) {
            errors.push('معرف المتجر مطلوب ويجب أن يكون رقماً صحيحاً موجباً');
        }

        if (this.total_amount < 0) {
            errors.push('إجمالي المبلغ لا يمكن أن يكون سالباً');
        }

        if (this.discount_amount < 0) {
            errors.push('مبلغ الخصم لا يمكن أن يكون سالباً');
        }

        if (this.discount_amount > this.total_amount) {
            errors.push('مبلغ الخصم لا يمكن أن يكون أكبر من إجمالي المبلغ');
        }

        if (this.final_amount < 0) {
            errors.push('المبلغ النهائي لا يمكن أن يكون سالباً');
        }

        if (this.delivery_date && this.order_date) {
            const orderDate = new Date(this.order_date);
            const deliveryDate = new Date(this.delivery_date);
            if (deliveryDate < orderDate) {
                errors.push('تاريخ التسليم لا يمكن أن يكون قبل تاريخ الطلب');
            }
        }

        if (this.notes && this.notes.length > 1000) {
            errors.push('الملاحظات يجب أن تكون أقل من 1000 حرف');
        }

        // Validate items
        if (this.items.length === 0) {
            errors.push('يجب إضافة منتج واحد على الأقل');
        } else {
            this.items.forEach((item, index) => {
                if (!item.product_id || !Number.isInteger(parseInt(item.product_id)) || parseInt(item.product_id) <= 0) {
                    errors.push(`معرف المنتج في العنصر ${index + 1} غير صحيح`);
                }
                if (!item.quantity || parseInt(item.quantity) <= 0) {
                    errors.push(`كمية المنتج في العنصر ${index + 1} يجب أن تكون أكبر من صفر`);
                }
                if (item.unit_price === undefined || parseFloat(item.unit_price) < 0) {
                    errors.push(`سعر الوحدة في العنصر ${index + 1} غير صحيح`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Convert to database model format
     * @returns {Object} model data
     */
    toModel() {
        return {
            store_id: this.store_id,
            order_date: this.order_date,
            delivery_date: this.delivery_date,
            total_amount: this.total_amount,
            discount_amount: this.discount_amount,
            final_amount: this.final_amount,
            notes: this.notes
        };
    }

    /**
     * Get order items in model format
     * @returns {Array} order items
     */
    getOrderItems() {
        return this.items.map(item => {
            const quantity = parseInt(item.quantity) || 1;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const totalPrice = quantity * unitPrice;
            const discountAmount = parseFloat(item.discount_amount) || 0;
            const finalPrice = Math.max(totalPrice - discountAmount, 0);

            return {
                product_id: parseInt(item.product_id),
                quantity: quantity,
                unit_price: unitPrice,
                total_price: totalPrice,
                discount_amount: discountAmount,
                final_price: finalPrice,
                gift_quantity: parseInt(item.gift_quantity) || 0,
                gift_reason: item.gift_reason || null,
                notes: item.notes || null
            };
        });
    }
} 