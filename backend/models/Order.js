import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    store_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    order_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    total_amount_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_amount_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    discount_amount_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    discount_amount_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    final_amount_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    final_amount_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_cost_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_cost_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    commission_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    commission_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal'
    },
    scheduled_delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    currency: {
        type: DataTypes.ENUM('EUR', 'SYP', 'MIXED'),
        allowNull: false,
        defaultValue: 'EUR'
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending', 'confirmed', 'prepared', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
        allowNull: false,
        defaultValue: 'pending'
    },
    gift_applied: {
        type: DataTypes.JSON,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_by_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // Distributor assignment fields
    assigned_distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the order was assigned to distributor'
    },
    delivery_started_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When distributor started delivery'
    },
    delivery_completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When delivery was completed'
    },
    delivery_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Delivery notes from distributor'
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
    ]
});

// Instance methods
Order.prototype.updateStatus = async function (newStatus, transaction = null) {
    const validStatuses = ['draft', 'pending', 'confirmed', 'prepared', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('حالة الطلب غير صحيحة');
    }

    const options = transaction ? { transaction } : {};
    this.status = newStatus;
    await this.save(options);

    return this;
};

Order.prototype.updatePaymentStatus = async function (newStatus, transaction = null) {
    const validStatuses = ['pending', 'partial', 'paid', 'overdue'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('حالة الدفع غير صحيحة');
    }

    const options = transaction ? { transaction } : {};
    this.payment_status = newStatus;
    await this.save(options);

    return this;
};

Order.prototype.getStatusInfo = function () {
    const statusMap = {
        draft: { label: 'مسودة', color: 'gray', icon: '📝' },
        pending: { label: 'معلق', color: 'yellow', icon: '⏳' },
        confirmed: { label: 'مؤكد', color: 'blue', icon: '✅' },
        prepared: { label: 'جاهز', color: 'orange', icon: '📦' },
        delivered: { label: 'تم التسليم', color: 'green', icon: '🚚' },
        cancelled: { label: 'ملغى', color: 'red', icon: '❌' }
    };

    return statusMap[this.status] || { label: this.status, color: 'gray', icon: '❓' };
};

Order.prototype.getPaymentStatusInfo = function () {
    const statusMap = {
        pending: { label: 'معلق', color: 'gray', icon: '⏳' },
        partial: { label: 'جزئي', color: 'yellow', icon: '💰' },
        paid: { label: 'مدفوع', color: 'green', icon: '✅' },
        overdue: { label: 'متأخر', color: 'red', icon: '⚠️' }
    };

    return statusMap[this.payment_status] || { label: this.payment_status, color: 'gray', icon: '❓' };
};

Order.prototype.getTotalAmount = function () {
    const amountEur = parseFloat(this.final_amount_eur) || 0;
    const amountSyp = parseFloat(this.final_amount_syp) || 0;
    const exchangeRate = parseFloat(this.exchange_rate) || 1800;

    return amountEur + (amountSyp / exchangeRate);
};

Order.prototype.calculateDiscount = function () {
    const totalEur = parseFloat(this.total_amount_eur) || 0;
    const totalSyp = parseFloat(this.total_amount_syp) || 0;
    const discountEur = parseFloat(this.discount_amount_eur) || 0;
    const discountSyp = parseFloat(this.discount_amount_syp) || 0;

    return {
        discount_percentage_eur: totalEur > 0 ? (discountEur / totalEur) * 100 : 0,
        discount_percentage_syp: totalSyp > 0 ? (discountSyp / totalSyp) * 100 : 0
    };
};

Order.prototype.isDelivered = function () {
    return this.status === 'delivered';
};

Order.prototype.isPaid = function () {
    return this.payment_status === 'paid';
};

Order.prototype.canCancel = function () {
    return !['delivered', 'cancelled'].includes(this.status);
};

// Static methods
Order.findByStore = async function (storeId, options = {}) {
    const whereClause = { store_id: storeId };

    if (options.status) {
        whereClause.status = options.status;
    }

    if (options.dateFrom && options.dateTo) {
        whereClause.order_date = {
            [sequelize.Sequelize.Op.between]: [options.dateFrom, options.dateTo]
        };
    }

    return await this.findAll({
        where: whereClause,
        order: [['order_date', 'DESC']],
        limit: options.limit || 100
    });
};

Order.findByStatus = async function (status, options = {}) {
    const whereClause = { status };

    if (options.storeId) {
        whereClause.store_id = options.storeId;
    }

    return await this.findAll({
        where: whereClause,
        order: [['order_date', 'DESC']],
        limit: options.limit || 100
    });
};

Order.generateOrderNumber = async function () {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Get the count of orders for today
    const todayStart = new Date(year, today.getMonth(), today.getDate());
    const todayEnd = new Date(year, today.getMonth(), today.getDate() + 1);

    const todayOrdersCount = await this.count({
        where: {
            created_at: {
                [sequelize.Sequelize.Op.gte]: todayStart,
                [sequelize.Sequelize.Op.lt]: todayEnd
            }
        }
    });

    // Format: ORD-YYYYMMDD-XXXX (e.g., ORD-20241201-0001)
    const sequenceNumber = String(todayOrdersCount + 1).padStart(4, '0');
    return `ORD-${year}${month}${day}-${sequenceNumber}`;
};

Order.getStatistics = async function (dateFrom = null, dateTo = null) {
    let whereClause = {};

    if (dateFrom && dateTo) {
        whereClause.order_date = {
            [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
        };
    }

    const [
        totalOrders,
        draftOrders,
        pendingOrders,
        confirmedOrders,
        preparedOrders,
        deliveredOrders,
        cancelledOrders,
        totalAmountEur,
        totalAmountSyp,
        pendingPayments,
        partialPayments,
        paidPayments,
        overduePayments
    ] = await Promise.all([
        this.count({ where: whereClause }),
        this.count({ where: { ...whereClause, status: 'draft' } }),
        this.count({ where: { ...whereClause, status: 'pending' } }),
        this.count({ where: { ...whereClause, status: 'confirmed' } }),
        this.count({ where: { ...whereClause, status: 'prepared' } }),
        this.count({ where: { ...whereClause, status: 'delivered' } }),
        this.count({ where: { ...whereClause, status: 'cancelled' } }),
        this.sum('final_amount_eur', { where: whereClause }),
        this.sum('final_amount_syp', { where: whereClause }),
        this.count({ where: { ...whereClause, payment_status: 'pending' } }),
        this.count({ where: { ...whereClause, payment_status: 'partial' } }),
        this.count({ where: { ...whereClause, payment_status: 'paid' } }),
        this.count({ where: { ...whereClause, payment_status: 'overdue' } })
    ]);

    return {
        total_orders: totalOrders,
        draft_orders: draftOrders,
        pending_orders: pendingOrders,
        confirmed_orders: confirmedOrders,
        prepared_orders: preparedOrders,
        delivered_orders: deliveredOrders,
        cancelled_orders: cancelledOrders,
        total_amount_eur: totalAmountEur || 0,
        total_amount_syp: totalAmountSyp || 0,
        pending_payments: pendingPayments,
        partial_payments: partialPayments,
        paid_payments: paidPayments,
        overdue_payments: overduePayments,
        average_order_value_eur: totalOrders > 0 ? (totalAmountEur || 0) / totalOrders : 0,
        average_order_value_syp: totalOrders > 0 ? (totalAmountSyp || 0) / totalOrders : 0
    };
};

export default Order; 