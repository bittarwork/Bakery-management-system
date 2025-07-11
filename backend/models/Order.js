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
    store_name: {
        type: DataTypes.STRING(255),
        allowNull: false
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
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        validate: {
            isIn: {
                args: [['low', 'medium', 'high', 'urgent']],
                msg: 'أولوية الطلب غير صحيحة'
            }
        }
    },
    total_amount_eur: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'إجمالي المبلغ باليورو لا يمكن أن يكون سالباً'
            },
            isDecimal: {
                msg: 'إجمالي المبلغ باليورو يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    total_amount_syp: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'إجمالي المبلغ بالليرة لا يمكن أن يكون سالباً'
            },
            isDecimal: {
                msg: 'إجمالي المبلغ بالليرة يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    discount_amount_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'مبلغ الخصم باليورو لا يمكن أن يكون سالباً'
            }
        }
    },
    discount_amount_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'مبلغ الخصم بالليرة لا يمكن أن يكون سالباً'
            }
        }
    },
    final_amount_eur: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'المبلغ النهائي باليورو لا يمكن أن يكون سالباً'
            }
        }
    },
    final_amount_syp: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'المبلغ النهائي بالليرة لا يمكن أن يكون سالباً'
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
    total_items: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'عدد العناصر في الطلب'
    },
    total_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'إجمالي الكمية في الطلب'
    },
    commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        }
    },
    commission_amount_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    commission_amount_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00
    },
    delivery_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'ملاحظات التوصيل'
    },
    distributor_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'ملاحظات الموزع'
    },
    special_instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'تعليمات خاصة'
    },
    delivery_time_preference: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'توقيت التوصيل المفضل'
    },
    assigned_distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'distributors',
            key: 'id'
        }
    },
    assigned_distributor_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'distribution_trips',
            key: 'id'
        }
    },
    visit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'store_visits',
            key: 'id'
        }
    },
    actual_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'تاريخ التوصيل الفعلي'
    },
    delivery_attempted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    delivery_success: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    delivery_problems: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'مشاكل التوصيل'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    created_by_name: {
        type: DataTypes.STRING(255),
        allowNull: true
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
            fields: ['assigned_distributor_id']
        },
        {
            fields: ['trip_id']
        },
        {
            fields: ['visit_id']
        },
        {
            fields: ['priority']
        },
        {
            fields: ['order_number'],
            unique: true
        }
    ],
    validate: {
        finalAmountCalculationEur() {
            const total = parseFloat(this.total_amount_eur) || 0;
            const discount = parseFloat(this.discount_amount_eur) || 0;
            const calculated = total - discount;

            if (Math.abs(calculated - parseFloat(this.final_amount_eur)) > 0.01) {
                throw new Error('المبلغ النهائي باليورو غير صحيح');
            }
        },
        finalAmountCalculationSyp() {
            const total = parseFloat(this.total_amount_syp) || 0;
            const discount = parseFloat(this.discount_amount_syp) || 0;
            const calculated = total - discount;

            if (Math.abs(calculated - parseFloat(this.final_amount_syp)) > 0.01) {
                throw new Error('المبلغ النهائي بالليرة غير صحيح');
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
Order.prototype.calculateTotalEur = function () {
    const total = parseFloat(this.total_amount_eur) || 0;
    const discount = parseFloat(this.discount_amount_eur) || 0;
    this.final_amount_eur = Math.round((total - discount) * 100) / 100;
    return this.final_amount_eur;
};

Order.prototype.calculateTotalSyp = function () {
    const total = parseFloat(this.total_amount_syp) || 0;
    const discount = parseFloat(this.discount_amount_syp) || 0;
    this.final_amount_syp = Math.round((total - discount) * 100) / 100;
    return this.final_amount_syp;
};

Order.prototype.calculateTotals = function () {
    this.calculateTotalEur();
    this.calculateTotalSyp();
    return this;
};

Order.prototype.applyDiscountEur = function (discountAmount) {
    this.discount_amount_eur = Math.max(0, parseFloat(discountAmount) || 0);
    this.calculateTotalEur();
    return this;
};

Order.prototype.applyDiscountSyp = function (discountAmount) {
    this.discount_amount_syp = Math.max(0, parseFloat(discountAmount) || 0);
    this.calculateTotalSyp();
    return this;
};

Order.prototype.calculateCommission = function () {
    const rate = parseFloat(this.commission_rate) || 0;
    this.commission_amount_eur = (this.final_amount_eur * rate) / 100;
    this.commission_amount_syp = (this.final_amount_syp * rate) / 100;
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

Order.prototype.assignToDistributor = async function (distributorId, distributorName, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.assigned_distributor_id = distributorId;
    this.assigned_distributor_name = distributorName;
    await this.save(options);
    return this;
};

Order.prototype.assignToTrip = async function (tripId, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.trip_id = tripId;
    await this.save(options);
    return this;
};

Order.prototype.assignToVisit = async function (visitId, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.visit_id = visitId;
    await this.save(options);
    return this;
};

Order.prototype.markDelivered = async function (success = true, problems = null, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.delivery_attempted = true;
    this.delivery_success = success;
    this.actual_delivery_date = new Date();

    if (problems) {
        this.delivery_problems = problems;
    }

    if (success) {
        this.status = ORDER_STATUS.DELIVERED;
    } else {
        this.status = ORDER_STATUS.DELIVERY_FAILED;
    }

    await this.save(options);
    return this;
};

Order.prototype.updateItemsStats = async function (itemsCount, totalQuantity, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.total_items = itemsCount;
    this.total_quantity = totalQuantity;
    await this.save(options);
    return this;
};

Order.prototype.isUrgent = function () {
    return this.priority === 'urgent';
};

Order.prototype.isHighPriority = function () {
    return ['high', 'urgent'].includes(this.priority);
};

Order.prototype.isDelivered = function () {
    return this.delivery_success === true;
};

Order.prototype.isDeliveryFailed = function () {
    return this.delivery_attempted === true && this.delivery_success === false;
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
            [sequelize.fn('SUM', sequelize.col('final_amount_eur')), 'total_amount_eur'],
            [sequelize.fn('SUM', sequelize.col('final_amount_syp')), 'total_amount_syp']
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
        total_amount_eur: parseFloat(row.dataValues.total_amount_eur) || 0,
        total_amount_syp: parseFloat(row.dataValues.total_amount_syp) || 0
    }));
};

Order.findByDistributor = async function (distributorId, dateFrom = null, dateTo = null) {
    const whereClause = { assigned_distributor_id: distributorId };

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

Order.findByTrip = async function (tripId) {
    return await Order.findAll({
        where: { trip_id: tripId },
        order: [['created_at', 'DESC']]
    });
};

Order.findByPriority = async function (priority) {
    return await Order.findAll({
        where: { priority: priority },
        order: [['order_date', 'DESC'], ['created_at', 'DESC']]
    });
};

Order.getUrgentOrders = async function () {
    return await Order.findAll({
        where: {
            priority: 'urgent',
            status: {
                [sequelize.Sequelize.Op.notIn]: [ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED]
            }
        },
        order: [['order_date', 'ASC'], ['created_at', 'ASC']]
    });
};

Order.getOrdersForDelivery = async function (dateFrom = null, dateTo = null) {
    const whereClause = {
        status: {
            [sequelize.Sequelize.Op.in]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY]
        }
    };

    if (dateFrom || dateTo) {
        whereClause.delivery_date = {};
        if (dateFrom) {
            whereClause.delivery_date[sequelize.Sequelize.Op.gte] = dateFrom;
        }
        if (dateTo) {
            whereClause.delivery_date[sequelize.Sequelize.Op.lte] = dateTo;
        }
    }

    return await Order.findAll({
        where: whereClause,
        order: [['priority', 'DESC'], ['delivery_date', 'ASC']]
    });
};

Order.getOrderStatistics = async function (period = 'month') {
    const { Op } = require('sequelize');

    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            dateFilter = {
                order_date: {
                    [Op.eq]: now.toISOString().split('T')[0]
                }
            };
            break;
        case 'week':
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = {
                order_date: {
                    [Op.gte]: weekStart.toISOString().split('T')[0]
                }
            };
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = {
                order_date: {
                    [Op.gte]: monthStart.toISOString().split('T')[0]
                }
            };
            break;
    }

    const stats = await Order.findAll({
        where: dateFilter,
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('final_amount_eur')), 'total_amount_eur'],
            [sequelize.fn('SUM', sequelize.col('final_amount_syp')), 'total_amount_syp'],
            [sequelize.fn('SUM', sequelize.col('total_items')), 'total_items'],
            [sequelize.fn('SUM', sequelize.col('total_quantity')), 'total_quantity']
        ],
        group: ['status'],
        raw: true
    });

    return stats;
};

Order.searchOrders = async function (searchTerm, filters = {}) {
    const { Op } = require('sequelize');

    let whereClause = {};

    // Search in order_number, store_name, and notes
    if (searchTerm) {
        whereClause[Op.or] = [
            { order_number: { [Op.like]: `%${searchTerm}%` } },
            { store_name: { [Op.like]: `%${searchTerm}%` } },
            { delivery_notes: { [Op.like]: `%${searchTerm}%` } }
        ];
    }

    // Apply filters
    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.priority) {
        whereClause.priority = filters.priority;
    }

    if (filters.assigned_distributor_id) {
        whereClause.assigned_distributor_id = filters.assigned_distributor_id;
    }

    if (filters.store_id) {
        whereClause.store_id = filters.store_id;
    }

    if (filters.date_from && filters.date_to) {
        whereClause.order_date = {
            [Op.between]: [filters.date_from, filters.date_to]
        };
    }

    return await Order.findAll({
        where: whereClause,
        order: [['order_date', 'DESC'], ['created_at', 'DESC']]
    });
};

export default Order; 