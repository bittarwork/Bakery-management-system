import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'رقم الطلب مطلوب'
            }
        }
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'معرف المتجر مطلوب'
            }
        }
    },
    order_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
            notNull: {
                msg: 'تاريخ الطلب مطلوب'
            },
            isDate: {
                msg: 'تاريخ الطلب غير صحيح'
            }
        }
    },
    delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'تاريخ التسليم غير صحيح'
            }
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'إجمالي المبلغ لا يمكن أن يكون سالباً'
            },
            isDecimal: {
                msg: 'إجمالي المبلغ يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'مبلغ الخصم لا يمكن أن يكون سالباً'
            }
        }
    },
    final_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'المبلغ النهائي لا يمكن أن يكون سالباً'
            }
        }
    },
    status: {
        type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
        defaultValue: ORDER_STATUS.DRAFT,
        validate: {
            isIn: {
                args: [Object.values(ORDER_STATUS)],
                msg: 'حالة الطلب غير صحيحة'
            }
        }
    },
    payment_status: {
        type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
        defaultValue: PAYMENT_STATUS.PENDING,
        validate: {
            isIn: {
                args: [Object.values(PAYMENT_STATUS)],
                msg: 'حالة الدفع غير صحيحة'
            }
        }
    },
    gift_applied: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'الهدايا المطبقة على الطلب'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['store_id']
        },
        {
            fields: ['order_date']
        },
        {
            fields: ['status']
        },
        {
            fields: ['payment_status']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['order_number'],
            unique: true
        }
    ],
    validate: {
        finalAmountCalculation() {
            const total = parseFloat(this.total_amount) || 0;
            const discount = parseFloat(this.discount_amount) || 0;
            const calculated = total - discount;

            if (Math.abs(calculated - parseFloat(this.final_amount)) > 0.01) {
                throw new Error('المبلغ النهائي غير صحيح');
            }
        },
        deliveryDateValidation() {
            if (this.delivery_date && this.order_date) {
                const orderDate = new Date(this.order_date);
                const deliveryDate = new Date(this.delivery_date);

                if (deliveryDate < orderDate) {
                    throw new Error('تاريخ التسليم لا يمكن أن يكون قبل تاريخ الطلب');
                }
            }
        }
    }
});

// Instance methods
Order.prototype.calculateTotal = function () {
    const total = parseFloat(this.total_amount) || 0;
    const discount = parseFloat(this.discount_amount) || 0;
    this.final_amount = Math.round((total - discount) * 100) / 100;
    return this.final_amount;
};

Order.prototype.applyDiscount = function (discountAmount) {
    this.discount_amount = Math.max(0, parseFloat(discountAmount) || 0);
    this.calculateTotal();
    return this;
};

Order.prototype.updateStatus = async function (newStatus, transaction = null) {
    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
        throw new Error('حالة الطلب غير صحيحة');
    }

    const options = transaction ? { transaction } : {};
    this.status = newStatus;
    await this.save(options);

    return this;
};

Order.prototype.updatePaymentStatus = async function (newPaymentStatus, transaction = null) {
    if (!Object.values(PAYMENT_STATUS).includes(newPaymentStatus)) {
        throw new Error('حالة الدفع غير صحيحة');
    }

    const options = transaction ? { transaction } : {};
    this.payment_status = newPaymentStatus;
    await this.save(options);

    return this;
};

Order.prototype.canBeModified = function () {
    return [ORDER_STATUS.DRAFT, ORDER_STATUS.CONFIRMED].includes(this.status);
};

Order.prototype.canBeCancelled = function () {
    return [ORDER_STATUS.DRAFT, ORDER_STATUS.CONFIRMED].includes(this.status);
};

// Class methods
Order.generateOrderNumber = function (storeId, date = null) {
    const orderDate = date ? new Date(date) : new Date();
    const year = orderDate.getFullYear().toString().substr(-2);
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const day = String(orderDate.getDate()).padStart(2, '0');
    const storeIdPadded = String(storeId).padStart(3, '0');
    const timestamp = Date.now().toString().substr(-4);

    return `ORD${year}${month}${day}${storeIdPadded}${timestamp}`;
};

Order.findByStore = async function (storeId, dateFrom = null, dateTo = null) {
    const whereClause = { store_id: storeId };

    if (dateFrom || dateTo) {
        whereClause.order_date = {};
        if (dateFrom) {
            whereClause.order_date[sequelize.Sequelize.Op.gte] = dateFrom;
        }
        if (dateTo) {
            whereClause.order_date[sequelize.Sequelize.Op.lte] = dateTo;
        }
    }

    return await Order.findAll({
        where: whereClause,
        order: [['order_date', 'DESC'], ['created_at', 'DESC']]
    });
};

Order.findByDate = async function (date) {
    return await Order.findAll({
        where: {
            order_date: date
        },
        order: [['created_at', 'DESC']]
    });
};

Order.findByStatus = async function (status) {
    return await Order.findAll({
        where: {
            status: status
        },
        order: [['order_date', 'DESC'], ['created_at', 'DESC']]
    });
};

Order.getTotalsByDate = async function (dateFrom, dateTo = null) {
    const endDate = dateTo || dateFrom;

    const result = await Order.findAll({
        attributes: [
            [sequelize.fn('DATE', sequelize.col('order_date')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders'],
            [sequelize.fn('SUM', sequelize.col('final_amount')), 'total_amount']
        ],
        where: {
            order_date: {
                [sequelize.Sequelize.Op.between]: [dateFrom, endDate]
            },
            status: {
                [sequelize.Sequelize.Op.ne]: ORDER_STATUS.CANCELLED
            }
        },
        group: [sequelize.fn('DATE', sequelize.col('order_date'))],
        order: [[sequelize.fn('DATE', sequelize.col('order_date')), 'ASC']]
    });

    return result.map(row => ({
        date: row.dataValues.date,
        total_orders: parseInt(row.dataValues.total_orders) || 0,
        total_amount: parseFloat(row.dataValues.total_amount) || 0
    }));
};

export default Order; 