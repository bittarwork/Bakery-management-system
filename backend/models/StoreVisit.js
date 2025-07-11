import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StoreVisit = sequelize.define('StoreVisit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'distribution_trips',
            key: 'id'
        }
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    store_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    visit_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'ترتيب زيارة المحل في الرحلة'
    },
    planned_arrival_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actual_arrival_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    planned_departure_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actual_departure_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    visit_status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'failed'),
        defaultValue: 'scheduled',
        validate: {
            isIn: {
                args: [['scheduled', 'in_progress', 'completed', 'cancelled', 'failed']],
                msg: 'حالة الزيارة غير صحيحة'
            }
        }
    },
    arrival_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'إحداثيات موقع الوصول GPS'
    },
    departure_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'إحداثيات موقع المغادرة GPS'
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'orders',
            key: 'id'
        },
        comment: 'الطلب المرتبط بهذه الزيارة'
    },
    order_value_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        comment: 'قيمة الطلب باليورو'
    },
    order_value_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00,
        comment: 'قيمة الطلب بالليرة السورية'
    },
    payment_collected_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        comment: 'المبلغ المحصل باليورو'
    },
    payment_collected_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00,
        comment: 'المبلغ المحصل بالليرة السورية'
    },
    delivery_successful: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'هل تم التوصيل بنجاح'
    },
    payment_collected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'هل تم تحصيل المدفوعة'
    },
    problems_encountered: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'المشاكل التي واجهت الموزع في هذه الزيارة'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'store_visits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['trip_id']
        },
        {
            fields: ['store_id']
        },
        {
            fields: ['visit_status']
        },
        {
            fields: ['order_id']
        },
        {
            fields: ['trip_id', 'visit_order'],
            unique: true
        }
    ]
});

// Instance methods
StoreVisit.prototype.calculateVisitDuration = function () {
    if (this.actual_arrival_time && this.actual_departure_time) {
        const diffMs = new Date(this.actual_departure_time) - new Date(this.actual_arrival_time);
        return Math.round(diffMs / (1000 * 60)); // minutes
    }
    return null;
};

StoreVisit.prototype.calculateDelay = function () {
    if (this.planned_arrival_time && this.actual_arrival_time) {
        const diffMs = new Date(this.actual_arrival_time) - new Date(this.planned_arrival_time);
        return Math.round(diffMs / (1000 * 60)); // minutes (positive = late, negative = early)
    }
    return null;
};

StoreVisit.prototype.updateStatus = async function (newStatus, transaction = null) {
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'failed'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('حالة الزيارة غير صحيحة');
    }

    const options = transaction ? { transaction } : {};
    this.visit_status = newStatus;

    // Update timestamps based on status
    const now = new Date();
    if (newStatus === 'in_progress' && !this.actual_arrival_time) {
        this.actual_arrival_time = now;
    } else if (['completed', 'cancelled', 'failed'].includes(newStatus) && !this.actual_departure_time) {
        this.actual_departure_time = now;
    }

    await this.save(options);
    return this;
};

StoreVisit.prototype.markDeliveryComplete = async function (deliverySuccess = true, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.delivery_successful = deliverySuccess;
    this.visit_status = deliverySuccess ? 'completed' : 'failed';

    if (!this.actual_departure_time) {
        this.actual_departure_time = new Date();
    }

    await this.save(options);
    return this;
};

StoreVisit.prototype.recordPayment = async function (amountEur = 0, amountSyp = 0, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.payment_collected_eur = amountEur;
    this.payment_collected_syp = amountSyp;
    this.payment_collected = (amountEur > 0 || amountSyp > 0);

    await this.save(options);
    return this;
};

StoreVisit.prototype.addProblem = async function (problemDescription, transaction = null) {
    const options = transaction ? { transaction } : {};

    const problems = this.problems_encountered || [];
    problems.push({
        timestamp: new Date(),
        description: problemDescription
    });

    this.problems_encountered = problems;
    await this.save(options);
    return this;
};

// Class methods
StoreVisit.getVisitsByTrip = async function (tripId) {
    return await this.findAll({
        where: { trip_id: tripId },
        order: [['visit_order', 'ASC']]
    });
};

StoreVisit.getVisitsByStore = async function (storeId, limit = 10) {
    return await this.findAll({
        where: { store_id: storeId },
        order: [['created_at', 'DESC']],
        limit: limit
    });
};

StoreVisit.getPendingVisits = async function () {
    return await this.findAll({
        where: {
            visit_status: ['scheduled', 'in_progress']
        },
        order: [['planned_arrival_time', 'ASC']]
    });
};

StoreVisit.getVisitStatistics = async function (period = 'month') {
    const { Op } = require('sequelize');

    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
            dateFilter = {
                created_at: {
                    [Op.gte]: todayStart,
                    [Op.lt]: todayEnd
                }
            };
            break;
        case 'week':
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = {
                created_at: {
                    [Op.gte]: weekStart
                }
            };
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = {
                created_at: {
                    [Op.gte]: monthStart
                }
            };
            break;
    }

    const stats = await this.findAll({
        where: dateFilter,
        attributes: [
            'visit_status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('payment_collected_eur')), 'total_collected_eur'],
            [sequelize.fn('SUM', sequelize.col('payment_collected_syp')), 'total_collected_syp'],
            [sequelize.fn('AVG', sequelize.literal('CASE WHEN actual_arrival_time IS NOT NULL AND actual_departure_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, actual_arrival_time, actual_departure_time) END')), 'avg_visit_duration']
        ],
        group: ['visit_status'],
        raw: true
    });

    return stats;
};

StoreVisit.getSuccessRate = async function (storeId = null, period = 'month') {
    const { Op } = require('sequelize');

    let whereClause = {};

    if (storeId) {
        whereClause.store_id = storeId;
    }

    // Add date filter
    const now = new Date();
    if (period === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        whereClause.created_at = { [Op.gte]: monthStart };
    }

    const totalVisits = await this.count({ where: whereClause });
    const successfulVisits = await this.count({
        where: {
            ...whereClause,
            delivery_successful: true
        }
    });

    const successRate = totalVisits > 0 ? (successfulVisits / totalVisits) * 100 : 0;

    return {
        total_visits: totalVisits,
        successful_visits: successfulVisits,
        success_rate: Math.round(successRate * 100) / 100
    };
};

export default StoreVisit; 