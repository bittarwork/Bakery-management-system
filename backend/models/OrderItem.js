import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'معرف الطلب مطلوب'
            }
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'معرف المنتج مطلوب'
            }
        }
    },
    product_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: 1,
                msg: 'الكمية يجب أن تكون أكبر من صفر'
            },
            isInt: {
                msg: 'الكمية يجب أن تكون رقماً صحيحاً'
            }
        }
    },
    unit_price_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'سعر الوحدة باليورو لا يمكن أن يكون سالباً'
            },
            isDecimal: {
                msg: 'سعر الوحدة باليورو يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    unit_price_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'سعر الوحدة بالليرة لا يمكن أن يكون سالباً'
            },
            isDecimal: {
                msg: 'سعر الوحدة بالليرة يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    total_price_eur: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'إجمالي السعر باليورو لا يمكن أن يكون سالباً'
            }
        }
    },
    total_price_syp: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'إجمالي السعر بالليرة لا يمكن أن يكون سالباً'
            }
        }
    },
    discount_amount_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'مبلغ الخصم باليورو لا يمكن أن يكون سالباً'
            }
        }
    },
    discount_amount_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'مبلغ الخصم بالليرة لا يمكن أن يكون سالباً'
            }
        }
    },
    final_price_eur: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'السعر النهائي باليورو لا يمكن أن يكون سالباً'
            }
        }
    },
    final_price_syp: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'السعر النهائي بالليرة لا يمكن أن يكون سالباً'
            }
        }
    },
    unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'وحدة القياس (قطعة، كيلو، علبة، إلخ)'
    },
    product_category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'فئة المنتج'
    },
    product_barcode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'باركود المنتج'
    },
    delivered_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'الكمية المسلمة لا يمكن أن تكون سالبة'
            }
        }
    },
    returned_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'الكمية المسترجعة لا يمكن أن تكون سالبة'
            }
        }
    },
    delivery_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'ملاحظات التوصيل'
    },
    return_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'سبب الإرجاع'
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['order_id']
        },
        {
            fields: ['product_id']
        },
        {
            fields: ['order_id', 'product_id'],
            unique: true
        }
    ],
    validate: {
        totalPriceCalculationEur() {
            const calculated = parseFloat(this.quantity) * parseFloat(this.unit_price_eur);
            const total = parseFloat(this.total_price_eur);

            if (Math.abs(calculated - total) > 0.01) {
                throw new Error('إجمالي السعر باليورو غير صحيح');
            }
        },
        totalPriceCalculationSyp() {
            const calculated = parseFloat(this.quantity) * parseFloat(this.unit_price_syp);
            const total = parseFloat(this.total_price_syp);

            if (Math.abs(calculated - total) > 0.01) {
                throw new Error('إجمالي السعر بالليرة غير صحيح');
            }
        },
        finalPriceCalculationEur() {
            const total = parseFloat(this.total_price_eur) || 0;
            const discount = parseFloat(this.discount_amount_eur) || 0;
            const calculated = total - discount;

            if (Math.abs(calculated - parseFloat(this.final_price_eur)) > 0.01) {
                throw new Error('السعر النهائي باليورو غير صحيح');
            }
        },
        finalPriceCalculationSyp() {
            const total = parseFloat(this.total_price_syp) || 0;
            const discount = parseFloat(this.discount_amount_syp) || 0;
            const calculated = total - discount;

            if (Math.abs(calculated - parseFloat(this.final_price_syp)) > 0.01) {
                throw new Error('السعر النهائي بالليرة غير صحيح');
            }
        },
        deliveryQuantityValidation() {
            const delivered = parseInt(this.delivered_quantity) || 0;
            const returned = parseInt(this.returned_quantity) || 0;
            const ordered = parseInt(this.quantity) || 0;

            if (delivered + returned > ordered) {
                throw new Error('الكمية المسلمة والمسترجعة لا يمكن أن تتجاوز الكمية المطلوبة');
            }
        }
    }
});

// Instance methods
OrderItem.prototype.calculateTotalPriceEur = function () {
    this.total_price_eur = Math.round(parseFloat(this.quantity) * parseFloat(this.unit_price_eur) * 100) / 100;
    this.calculateFinalPriceEur();
    return this.total_price_eur;
};

OrderItem.prototype.calculateTotalPriceSyp = function () {
    this.total_price_syp = Math.round(parseFloat(this.quantity) * parseFloat(this.unit_price_syp) * 100) / 100;
    this.calculateFinalPriceSyp();
    return this.total_price_syp;
};

OrderItem.prototype.calculateTotalPrices = function () {
    this.calculateTotalPriceEur();
    this.calculateTotalPriceSyp();
    return this;
};

OrderItem.prototype.calculateFinalPriceEur = function () {
    const total = parseFloat(this.total_price_eur) || 0;
    const discount = parseFloat(this.discount_amount_eur) || 0;
    this.final_price_eur = Math.round((total - discount) * 100) / 100;
    return this.final_price_eur;
};

OrderItem.prototype.calculateFinalPriceSyp = function () {
    const total = parseFloat(this.total_price_syp) || 0;
    const discount = parseFloat(this.discount_amount_syp) || 0;
    this.final_price_syp = Math.round((total - discount) * 100) / 100;
    return this.final_price_syp;
};

OrderItem.prototype.calculateFinalPrices = function () {
    this.calculateFinalPriceEur();
    this.calculateFinalPriceSyp();
    return this;
};

OrderItem.prototype.applyDiscountEur = function (discountAmount) {
    this.discount_amount_eur = Math.max(0, parseFloat(discountAmount) || 0);
    this.calculateFinalPriceEur();
    return this;
};

OrderItem.prototype.applyDiscountSyp = function (discountAmount) {
    this.discount_amount_syp = Math.max(0, parseFloat(discountAmount) || 0);
    this.calculateFinalPriceSyp();
    return this;
};

OrderItem.prototype.updateQuantity = function (newQuantity) {
    this.quantity = Math.max(1, parseInt(newQuantity) || 1);
    this.calculateTotalPrices();
    return this;
};

OrderItem.prototype.updateUnitPrices = function (newUnitPriceEur, newUnitPriceSyp) {
    this.unit_price_eur = Math.max(0, parseFloat(newUnitPriceEur) || 0);
    this.unit_price_syp = Math.max(0, parseFloat(newUnitPriceSyp) || 0);
    this.calculateTotalPrices();
    return this;
};

OrderItem.prototype.markAsDelivered = function (deliveredQuantity = null) {
    this.delivered_quantity = deliveredQuantity !== null ?
        Math.max(0, parseInt(deliveredQuantity)) :
        parseInt(this.quantity);
    return this;
};

OrderItem.prototype.markAsReturned = function (returnedQuantity, reason = null) {
    this.returned_quantity = Math.max(0, parseInt(returnedQuantity) || 0);
    this.return_reason = reason;
    return this;
};

OrderItem.prototype.getDeliveryStatus = function () {
    const ordered = parseInt(this.quantity) || 0;
    const delivered = parseInt(this.delivered_quantity) || 0;
    const returned = parseInt(this.returned_quantity) || 0;

    if (delivered === 0 && returned === 0) {
        return 'pending';
    } else if (delivered === ordered && returned === 0) {
        return 'delivered';
    } else if (delivered + returned === ordered) {
        return 'completed';
    } else {
        return 'partial';
    }
};

OrderItem.prototype.getDiscountPercentageEur = function () {
    if (parseFloat(this.total_price_eur) === 0) return 0;

    const discountPercentage = (parseFloat(this.discount_amount_eur) / parseFloat(this.total_price_eur)) * 100;
    return Math.round(discountPercentage * 100) / 100;
};

OrderItem.prototype.getDiscountPercentageSyp = function () {
    if (parseFloat(this.total_price_syp) === 0) return 0;

    const discountPercentage = (parseFloat(this.discount_amount_syp) / parseFloat(this.total_price_syp)) * 100;
    return Math.round(discountPercentage * 100) / 100;
};

OrderItem.prototype.isFullyDelivered = function () {
    return parseInt(this.delivered_quantity) === parseInt(this.quantity);
};

OrderItem.prototype.isPartiallyDelivered = function () {
    const delivered = parseInt(this.delivered_quantity) || 0;
    const ordered = parseInt(this.quantity) || 0;
    return delivered > 0 && delivered < ordered;
};

OrderItem.prototype.hasReturns = function () {
    return parseInt(this.returned_quantity) > 0;
};

OrderItem.prototype.getRemainingQuantity = function () {
    const ordered = parseInt(this.quantity) || 0;
    const delivered = parseInt(this.delivered_quantity) || 0;
    const returned = parseInt(this.returned_quantity) || 0;
    return Math.max(0, ordered - delivered - returned);
};

// Class methods
OrderItem.findByOrder = async function (orderId) {
    return await OrderItem.findAll({
        where: {
            order_id: orderId
        },
        order: [['created_at', 'ASC']]
    });
};

OrderItem.findByProduct = async function (productId, dateFrom = null, dateTo = null) {
    const whereClause = { product_id: productId };

    // If date range is provided, we need to join with orders table
    if (dateFrom || dateTo) {
        const { Order } = require('./index.js');

        const orderWhere = {};
        if (dateFrom || dateTo) {
            orderWhere.order_date = {};
            if (dateFrom) {
                orderWhere.order_date[sequelize.Sequelize.Op.gte] = dateFrom;
            }
            if (dateTo) {
                orderWhere.order_date[sequelize.Sequelize.Op.lte] = dateTo;
            }
        }

        return await OrderItem.findAll({
            where: whereClause,
            include: [{
                model: Order,
                where: orderWhere,
                attributes: ['id', 'order_date', 'status']
            }],
            order: [['created_at', 'DESC']]
        });
    }

    return await OrderItem.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
    });
};

OrderItem.getTotalQuantityByProduct = async function (productId, dateFrom = null, dateTo = null) {
    const whereClause = { product_id: productId };

    if (dateFrom || dateTo) {
        const { Order } = require('./index.js');

        const orderWhere = {};
        if (dateFrom || dateTo) {
            orderWhere.order_date = {};
            if (dateFrom) {
                orderWhere.order_date[sequelize.Sequelize.Op.gte] = dateFrom;
            }
            if (dateTo) {
                orderWhere.order_date[sequelize.Sequelize.Op.lte] = dateTo;
            }
        }

        const result = await OrderItem.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'total_quantity'],
                [sequelize.fn('SUM', sequelize.col('OrderItem.gift_quantity')), 'total_gift_quantity'],
                [sequelize.fn('SUM', sequelize.col('OrderItem.final_price')), 'total_amount']
            ],
            where: whereClause,
            include: [{
                model: Order,
                where: orderWhere,
                attributes: []
            }]
        });

        return {
            total_quantity: parseInt(result?.dataValues?.total_quantity) || 0,
            total_gift_quantity: parseInt(result?.dataValues?.total_gift_quantity) || 0,
            total_amount: parseFloat(result?.dataValues?.total_amount) || 0
        };
    }

    const result = await OrderItem.findOne({
        attributes: [
            [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
            [sequelize.fn('SUM', sequelize.col('gift_quantity')), 'total_gift_quantity'],
            [sequelize.fn('SUM', sequelize.col('final_price')), 'total_amount']
        ],
        where: whereClause
    });

    return {
        total_quantity: parseInt(result?.dataValues?.total_quantity) || 0,
        total_gift_quantity: parseInt(result?.dataValues?.total_gift_quantity) || 0,
        total_amount: parseFloat(result?.dataValues?.total_amount) || 0
    };
};

OrderItem.getMostOrderedProducts = async function (limit = 10, dateFrom = null, dateTo = null) {
    const whereClause = {};

    if (dateFrom || dateTo) {
        const { Order } = require('./index.js');

        const orderWhere = {};
        if (dateFrom || dateTo) {
            orderWhere.order_date = {};
            if (dateFrom) {
                orderWhere.order_date[sequelize.Sequelize.Op.gte] = dateFrom;
            }
            if (dateTo) {
                orderWhere.order_date[sequelize.Sequelize.Op.lte] = dateTo;
            }
        }

        return await OrderItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'total_quantity'],
                [sequelize.fn('SUM', sequelize.col('OrderItem.gift_quantity')), 'total_gift_quantity'],
                [sequelize.fn('SUM', sequelize.col('OrderItem.final_price')), 'total_amount'],
                [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'order_count']
            ],
            where: whereClause,
            include: [{
                model: Order,
                where: orderWhere,
                attributes: []
            }],
            group: ['product_id'],
            order: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'DESC']],
            limit
        });
    }

    return await OrderItem.findAll({
        attributes: [
            'product_id',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
            [sequelize.fn('SUM', sequelize.col('gift_quantity')), 'total_gift_quantity'],
            [sequelize.fn('SUM', sequelize.col('final_price')), 'total_amount'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'order_count']
        ],
        where: whereClause,
        group: ['product_id'],
        order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
        limit
    });
};

export default OrderItem; 