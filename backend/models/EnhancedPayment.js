import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnhancedPayment = sequelize.define('EnhancedPayment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    payment_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },

    payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    // Related entities (without foreign keys)
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    store_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    distributor_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    // Payment amounts
    amount_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    amount_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    currency: {
        type: DataTypes.ENUM('EUR', 'SYP', 'MIXED'),
        allowNull: false,
        defaultValue: 'EUR'
    },

    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        comment: 'Exchange rate used for SYP to EUR conversion'
    },

    // Payment details
    payment_method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'check', 'credit_card', 'mobile_payment', 'crypto'),
        allowNull: false,
        defaultValue: 'cash'
    },

    payment_type: {
        type: DataTypes.ENUM('order_payment', 'credit_payment', 'advance_payment', 'refund', 'commission'),
        allowNull: false,
        defaultValue: 'order_payment'
    },

    reference_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Bank transfer reference, check number, etc.'
    },

    // Status and verification
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    },

    verification_status: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected', 'under_review'),
        allowNull: false,
        defaultValue: 'pending'
    },

    verification_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    verified_by_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Additional information
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    receipt_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL to receipt image'
    },

    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'External transaction ID'
    },

    // GPS and location
    payment_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'GPS coordinates where payment was made'
    },

    // Audit information
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    created_by_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    updated_by_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    // Commission tracking
    commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        }
    },

    commission_amount_eur: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    commission_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    commission_paid_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'enhanced_payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    hooks: {
        beforeCreate: (payment) => {
            // Generate payment reference if not provided
            if (!payment.payment_reference) {
                const timestamp = Date.now().toString();
                const random = Math.random().toString(36).substr(2, 5);
                payment.payment_reference = `PAY-${timestamp}-${random}`.toUpperCase();
            }

            // Convert currency if needed
            if (payment.currency === 'SYP' && payment.amount_eur === 0) {
                payment.amount_eur = payment.amount_syp / 15000;
            } else if (payment.currency === 'EUR' && payment.amount_syp === 0) {
                payment.amount_syp = payment.amount_eur * 15000;
            }
        },

        beforeUpdate: (payment) => {
            // Update conversion rates if amount changed
            if (payment.changed('amount_eur')) {
                payment.amount_syp = payment.amount_eur * 15000;
            } else if (payment.changed('amount_syp')) {
                payment.amount_eur = payment.amount_syp / 15000;
            }
        }
    }
});

// Instance methods
EnhancedPayment.prototype.complete = function () {
    this.status = 'completed';
    return this.save();
};

EnhancedPayment.prototype.cancel = function (reason = null) {
    this.status = 'cancelled';
    if (reason) {
        this.description = (this.description || '') + `\nCancelled: ${reason}`;
    }
    return this.save();
};

EnhancedPayment.prototype.verify = function (verifiedBy, verifiedByName, notes = null) {
    this.verification_status = 'verified';
    this.verified_by = verifiedBy;
    this.verified_by_name = verifiedByName;
    this.verified_at = new Date();
    if (notes) {
        this.verification_notes = notes;
    }
    return this.save();
};

EnhancedPayment.prototype.reject = function (verifiedBy, verifiedByName, reason) {
    this.verification_status = 'rejected';
    this.verified_by = verifiedBy;
    this.verified_by_name = verifiedByName;
    this.verified_at = new Date();
    this.verification_notes = reason;
    return this.save();
};

EnhancedPayment.prototype.refund = function (reason = null) {
    this.status = 'refunded';
    if (reason) {
        this.description = (this.description || '') + `\nRefunded: ${reason}`;
    }
    return this.save();
};

EnhancedPayment.prototype.getTotalInEur = function () {
    const eurAmount = parseFloat(this.amount_eur) || 0;
    const sypAmount = parseFloat(this.amount_syp) || 0;
    const exchangeRate = parseFloat(this.exchange_rate) || 15000;
    return eurAmount + (sypAmount / exchangeRate);
};

EnhancedPayment.prototype.getTotalInSyp = function () {
    const eurAmount = parseFloat(this.amount_eur) || 0;
    const sypAmount = parseFloat(this.amount_syp) || 0;
    const exchangeRate = parseFloat(this.exchange_rate) || 15000;
    return sypAmount + (eurAmount * exchangeRate);
};

EnhancedPayment.prototype.payCommission = function () {
    this.commission_paid = true;
    this.commission_paid_at = new Date();
    return this.save();
};

EnhancedPayment.prototype.isOverdue = function (daysPastDue = 30) {
    const paymentDate = new Date(this.payment_date);
    const dueDate = new Date(paymentDate.getTime() + (daysPastDue * 24 * 60 * 60 * 1000));
    return new Date() > dueDate && this.status === 'pending';
};

EnhancedPayment.prototype.getDaysOverdue = function () {
    if (!this.isOverdue()) return 0;
    const paymentDate = new Date(this.payment_date);
    const today = new Date();
    return Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));
};

// Static methods
EnhancedPayment.getByStore = async function (storeId, limit = 100) {
    return await this.findAll({
        where: { store_id: storeId },
        order: [['payment_date', 'DESC']],
        limit
    });
};

EnhancedPayment.getByDistributor = async function (distributorId, limit = 100) {
    return await this.findAll({
        where: { distributor_id: distributorId },
        order: [['payment_date', 'DESC']],
        limit
    });
};

EnhancedPayment.getByStatus = async function (status) {
    return await this.findAll({
        where: { status },
        order: [['payment_date', 'DESC']]
    });
};

EnhancedPayment.getByVerificationStatus = async function (verificationStatus) {
    return await this.findAll({
        where: { verification_status: verificationStatus },
        order: [['payment_date', 'DESC']]
    });
};

EnhancedPayment.getByDateRange = async function (startDate, endDate, filters = {}) {
    const where = {
        payment_date: {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
        }
    };

    if (filters.store_id) where.store_id = filters.store_id;
    if (filters.distributor_id) where.distributor_id = filters.distributor_id;
    if (filters.status) where.status = filters.status;
    if (filters.payment_method) where.payment_method = filters.payment_method;
    if (filters.currency) where.currency = filters.currency;

    return await this.findAll({
        where,
        order: [['payment_date', 'DESC']]
    });
};

EnhancedPayment.getPendingVerifications = async function () {
    return await this.findAll({
        where: { verification_status: 'pending' },
        order: [['payment_date', 'ASC']]
    });
};

EnhancedPayment.getOverduePayments = async function (daysPastDue = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysPastDue);

    return await this.findAll({
        where: {
            status: 'pending',
            payment_date: {
                [sequelize.Sequelize.Op.lt]: cutoffDate
            }
        },
        order: [['payment_date', 'ASC']]
    });
};

EnhancedPayment.getStatistics = async function (filters = {}) {
    let where = {};

    if (filters.store_id) where.store_id = filters.store_id;
    if (filters.distributor_id) where.distributor_id = filters.distributor_id;
    if (filters.date_range) {
        where.payment_date = {
            [sequelize.Sequelize.Op.between]: [filters.date_range.start, filters.date_range.end]
        };
    }

    const payments = await this.findAll({ where });

    const stats = {
        total_payments: payments.length,
        completed_payments: payments.filter(p => p.status === 'completed').length,
        pending_payments: payments.filter(p => p.status === 'pending').length,
        cancelled_payments: payments.filter(p => p.status === 'cancelled').length,
        verified_payments: payments.filter(p => p.verification_status === 'verified').length,
        rejected_payments: payments.filter(p => p.verification_status === 'rejected').length,
        total_amount_eur: payments.reduce((sum, p) => sum + p.getTotalInEur(), 0),
        total_amount_syp: payments.reduce((sum, p) => sum + p.getTotalInSyp(), 0),
        total_commission_eur: payments.reduce((sum, p) => sum + (parseFloat(p.commission_amount_eur) || 0), 0),
        paid_commissions: payments.filter(p => p.commission_paid).length,
        overdue_payments: payments.filter(p => p.isOverdue()).length,
        avg_payment_amount_eur: payments.length > 0 ? payments.reduce((sum, p) => sum + p.getTotalInEur(), 0) / payments.length : 0
    };

    // Payment method breakdown
    stats.by_payment_method = {};
    payments.forEach(p => {
        stats.by_payment_method[p.payment_method] = (stats.by_payment_method[p.payment_method] || 0) + 1;
    });

    // Currency breakdown
    stats.by_currency = {};
    payments.forEach(p => {
        stats.by_currency[p.currency] = (stats.by_currency[p.currency] || 0) + 1;
    });

    return stats;
};

EnhancedPayment.getTopPayingStores = async function (limit = 10, dateRange = null) {
    let where = {};
    if (dateRange) {
        where.payment_date = {
            [sequelize.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        };
    }

    const payments = await this.findAll({
        where,
        attributes: [
            'store_id',
            'store_name',
            [sequelize.fn('SUM', sequelize.col('amount_eur')), 'total_eur'],
            [sequelize.fn('SUM', sequelize.col('amount_syp')), 'total_syp'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'payment_count']
        ],
        group: ['store_id', 'store_name'],
        order: [[sequelize.fn('SUM', sequelize.col('amount_eur')), 'DESC']],
        limit
    });

    return payments;
};

EnhancedPayment.getDistributorCommissions = async function (distributorId = null, dateRange = null) {
    let where = { commission_rate: { [sequelize.Sequelize.Op.gt]: 0 } };

    if (distributorId) where.distributor_id = distributorId;
    if (dateRange) {
        where.payment_date = {
            [sequelize.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        };
    }

    const payments = await this.findAll({
        where,
        attributes: [
            'distributor_id',
            'distributor_name',
            [sequelize.fn('SUM', sequelize.col('commission_amount_eur')), 'total_commission'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'payment_count'],
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN commission_paid = true THEN commission_amount_eur ELSE 0 END')), 'paid_commission']
        ],
        group: ['distributor_id', 'distributor_name'],
        order: [[sequelize.fn('SUM', sequelize.col('commission_amount_eur')), 'DESC']]
    });

    return payments;
};

EnhancedPayment.getCurrencyConversionReport = async function (dateRange = null) {
    let where = {};
    if (dateRange) {
        where.payment_date = {
            [sequelize.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        };
    }

    const payments = await this.findAll({
        where,
        attributes: [
            'currency',
            'exchange_rate',
            [sequelize.fn('SUM', sequelize.col('amount_eur')), 'total_eur'],
            [sequelize.fn('SUM', sequelize.col('amount_syp')), 'total_syp'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'payment_count'],
            [sequelize.fn('AVG', sequelize.col('exchange_rate')), 'avg_exchange_rate']
        ],
        group: ['currency'],
        order: [['currency', 'ASC']]
    });

    return payments;
};

export default EnhancedPayment; 