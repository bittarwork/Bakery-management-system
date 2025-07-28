/**
 * Data Transfer Object for Order Creation Request
 * Validates and structures order creation data
 */
export class CreateOrderRequest {
    constructor(data) {
        this.store_id = data.store_id;
        this.items = data.items || [];
        this.notes = data.notes || '';
        this.delivery_date = data.delivery_date || null;
        this.currency = data.currency || 'EUR';
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

        // Validate currency
        const validCurrencies = ['EUR', 'SYP'];
        if (this.currency && !validCurrencies.includes(this.currency)) {
            errors.push({
                field: 'currency',
                message: 'Currency must be EUR or SYP'
            });
        }

        // Validate delivery_date
        if (this.delivery_date) {
            const deliveryDate = new Date(this.delivery_date);
            if (isNaN(deliveryDate.getTime())) {
                errors.push({
                    field: 'delivery_date',
                    message: 'Delivery date must be a valid date'
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
} 