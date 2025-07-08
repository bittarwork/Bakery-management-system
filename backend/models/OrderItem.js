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
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: 0,
                msg: 'سعر الوحدة لا يمكن أن يكون سالباً'
            },
            isDecimal: {
                msg: 'سعر الوحدة يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: 0,
                msg: 'إجمالي السعر لا يمكن أن يكون سالباً'
            }
        }
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'مبلغ الخصم لا يمكن أن يكون سالباً'
            }
        }
    },
    final_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: 0,
                msg: 'السعر النهائي لا يمكن أن يكون سالباً'
            }
        }
    },
    gift_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'كمية الهدايا لا يمكن أن تكون سالبة'
            }
        }
    },
    gift_reason: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'سبب الهدية (وفاء، عميل مميز، إلخ)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
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
        totalPriceCalculation() {
            const calculated = parseFloat(this.quantity) * parseFloat(this.unit_price);
            const total = parseFloat(this.total_price);

            if (Math.abs(calculated - total) > 0.01) {
                throw new Error('إجمالي السعر غير صحيح');
            }
        },
        finalPriceCalculation() {
            const total = parseFloat(this.total_price) || 0;
            const discount = parseFloat(this.discount_amount) || 0;
            const calculated = total - discount;

            if (Math.abs(calculated - parseFloat(this.final_price)) > 0.01) {
                throw new Error('السعر النهائي غير صحيح');
            }
        }
    }
});

// Instance methods
OrderItem.prototype.calculateTotalPrice = function () {
    this.total_price = Math.round(parseFloat(this.quantity) * parseFloat(this.unit_price) * 100) / 100;
    this.calculateFinalPrice();
    return this.total_price;
};

OrderItem.prototype.calculateFinalPrice = function () {
    const total = parseFloat(this.total_price) || 0;
    const discount = parseFloat(this.discount_amount) || 0;
    this.final_price = Math.round((total - discount) * 100) / 100;
    return this.final_price;
};

OrderItem.prototype.applyDiscount = function (discountAmount) {
    this.discount_amount = Math.max(0, parseFloat(discountAmount) || 0);
    this.calculateFinalPrice();
    return this;
};

OrderItem.prototype.applyGift = function (giftQuantity, reason = null) {
    this.gift_quantity = Math.max(0, parseInt(giftQuantity) || 0);
    this.gift_reason = reason || 'هدية';
    return this;
};

OrderItem.prototype.updateQuantity = function (newQuantity) {
    this.quantity = Math.max(1, parseInt(newQuantity) || 1);
    this.calculateTotalPrice();
    return this;
};

OrderItem.prototype.updateUnitPrice = function (newUnitPrice) {
    this.unit_price = Math.max(0, parseFloat(newUnitPrice) || 0);
    this.calculateTotalPrice();
    return this;
};

OrderItem.prototype.getTotalQuantity = function () {
    return parseInt(this.quantity) + parseInt(this.gift_quantity);
};

OrderItem.prototype.hasGift = function () {
    return parseInt(this.gift_quantity) > 0;
};

OrderItem.prototype.getDiscountPercentage = function () {
    if (parseFloat(this.total_price) === 0) return 0;

    const discountPercentage = (parseFloat(this.discount_amount) / parseFloat(this.total_price)) * 100;
    return Math.round(discountPercentage * 100) / 100;
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