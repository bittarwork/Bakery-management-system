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
    currency: {
        type: DataTypes.ENUM('EUR', 'SYP'),
        allowNull: false,
        defaultValue: 'EUR'
    },
    status: {
        type: DataTypes.ENUM('draft', 'confirmed', 'in_progress', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
        allowNull: false,
        defaultValue: 'pending'
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    special_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    customer_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    customer_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    customer_email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_by_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // Simple distributor assignment
    assigned_distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
            fields: ['assigned_distributor_id']
        },
        {
            fields: ['order_number'],
            unique: true
        }
    ]
});

// Simple instance methods
Order.prototype.updateStatus = async function (newStatus, transaction = null) {
    const validStatuses = ['draft', 'confirmed', 'in_progress', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Order status is invalid');
    }

    const options = transaction ? { transaction } : {};
    this.status = newStatus;
    await this.save(options);

    return this;
};

Order.prototype.updatePaymentStatus = async function (newStatus, transaction = null) {
    const validStatuses = ['pending', 'partial', 'paid', 'overdue'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Payment status is invalid');
    }

    const options = transaction ? { transaction } : {};
    this.payment_status = newStatus;
    await this.save(options);

    return this;
};

Order.prototype.assignDistributor = async function (distributorId, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.assigned_distributor_id = distributorId;
    await this.save(options);

    return this;
};

Order.prototype.unassignDistributor = async function (transaction = null) {
    const options = transaction ? { transaction } : {};
    this.assigned_distributor_id = null;
    await this.save(options);

    return this;
};

Order.prototype.getStatusInfo = function () {
    const statusMap = {
        draft: { label: 'Draft', color: 'gray', icon: '📝' },
        confirmed: { label: 'Confirmed', color: 'blue', icon: '✅' },
        in_progress: { label: 'In Progress', color: 'orange', icon: '🚛' },
        delivered: { label: 'Delivered', color: 'green', icon: '📦' },
        cancelled: { label: 'Cancelled', color: 'red', icon: '❌' }
    };

    return statusMap[this.status] || { label: this.status, color: 'gray', icon: '❓' };
};

Order.prototype.getPaymentStatusInfo = function () {
    const statusMap = {
        pending: { label: 'Pending', color: 'orange', icon: '⏳' },
        paid: { label: 'Paid', color: 'green', icon: '✅' }
    };

    return statusMap[this.payment_status] || { label: this.payment_status, color: 'gray', icon: '❓' };
};

Order.prototype.getTotalAmount = function () {
    if (this.currency === 'EUR') {
        return parseFloat(this.final_amount_eur) || 0;
    } else {
        return parseFloat(this.final_amount_syp) || 0;
    }
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

Order.prototype.canEdit = function () {
    return this.status === 'draft';
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

Order.findByDistributor = async function (distributorId, options = {}) {
    const whereClause = { assigned_distributor_id: distributorId };

    if (options.status) {
        whereClause.status = options.status;
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
        confirmedOrders,
        inProgressOrders,
        deliveredOrders,
        cancelledOrders,
        totalAmountEur,
        totalAmountSyp,
        pendingPayments,
        paidPayments
    ] = await Promise.all([
        this.count({ where: whereClause }),
        this.count({ where: { ...whereClause, status: 'draft' } }),
        this.count({ where: { ...whereClause, status: 'confirmed' } }),
        this.count({ where: { ...whereClause, status: 'in_progress' } }),
        this.count({ where: { ...whereClause, status: 'delivered' } }),
        this.count({ where: { ...whereClause, status: 'cancelled' } }),
        this.sum('final_amount_eur', { where: whereClause }),
        this.sum('final_amount_syp', { where: whereClause }),
        this.count({ where: { ...whereClause, payment_status: 'pending' } }),
        this.count({ where: { ...whereClause, payment_status: 'paid' } })
    ]);

    return {
        total_orders: totalOrders,
        draft_orders: draftOrders,
        confirmed_orders: confirmedOrders,
        in_progress_orders: inProgressOrders,
        delivered_orders: deliveredOrders,
        cancelled_orders: cancelledOrders,
        total_amount_eur: totalAmountEur || 0,
        total_amount_syp: totalAmountSyp || 0,
        pending_payments: pendingPayments,
        paid_payments: paidPayments,
        average_order_value_eur: totalOrders > 0 ? (totalAmountEur || 0) / totalOrders : 0,
        average_order_value_syp: totalOrders > 0 ? (totalAmountSyp || 0) / totalOrders : 0
    };
};

export default Order; 