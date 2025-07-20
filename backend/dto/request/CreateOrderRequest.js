/**
 * Data Transfer Object for Order Creation Request
 * Validates and structures order creation data
 */
export class CreateOrderRequest {
    constructor(data) {
        this.store_id = data.store_id;
        this.items = data.items || [];
        this.notes = data.notes || '';
        this.priority = data.priority || 'normal';
        this.scheduled_delivery_date = data.scheduled_delivery_date || null;
    }

    /**
     * Validates the order creation request
     * @returns {Object} validation result with isValid boolean and errors array
     */
    validate() {
        const errors = [];

        // Validate store_id
        if (!this.store_id) {
            errors.push({
                field: 'store_id',
                message: 'Store ID is required'
            });
        } else if (isNaN(parseInt(this.store_id)) || parseInt(this.store_id) <= 0) {
            errors.push({
                field: 'store_id',
                message: 'Store ID must be a positive number'
            });
        }

        // Validate items
        if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
            errors.push({
                field: 'items',
                message: 'At least one item is required'
            });
        } else {
            // Validate each item
            this.items.forEach((item, index) => {
                if (!item.product_id) {
                    errors.push({
                        field: `items[${index}].product_id`,
                        message: `Product ID is required for item ${index + 1}`
                    });
                } else if (isNaN(parseInt(item.product_id)) || parseInt(item.product_id) <= 0) {
                    errors.push({
                        field: `items[${index}].product_id`,
                        message: `Product ID must be a positive number for item ${index + 1}`
                    });
                }

                if (!item.quantity) {
                    errors.push({
                        field: `items[${index}].quantity`,
                        message: `Quantity is required for item ${index + 1}`
                    });
                } else if (isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
                    errors.push({
                        field: `items[${index}].quantity`,
                        message: `Quantity must be a positive number for item ${index + 1}`
                    });
                }
            });
        }

        // Validate priority
        const validPriorities = ['low', 'normal', 'high', 'urgent'];
        if (this.priority && !validPriorities.includes(this.priority)) {
            errors.push({
                field: 'priority',
                message: 'Priority must be one of: low, normal, high, urgent'
            });
        }

        // Validate scheduled_delivery_date
        if (this.scheduled_delivery_date) {
            const deliveryDate = new Date(this.scheduled_delivery_date);
            if (isNaN(deliveryDate.getTime())) {
                errors.push({
                    field: 'scheduled_delivery_date',
                    message: 'Scheduled delivery date must be a valid date'
                });
            } else {
                // Set delivery date to start of day for comparison
                const deliveryDateStart = new Date(deliveryDate);
                deliveryDateStart.setHours(0, 0, 0, 0);

                // Set today to start of day for comparison
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                if (deliveryDateStart < todayStart) {
                    errors.push({
                        field: 'scheduled_delivery_date',
                        message: 'Scheduled delivery date cannot be in the past'
                    });
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
} 