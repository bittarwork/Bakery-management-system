import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DistributionTrip = sequelize.define('DistributionTrip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    trip_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'رقم الرحلة مطلوب'
            }
        }
    },
    trip_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'تاريخ الرحلة مطلوب'
            },
            isDate: {
                msg: 'تاريخ الرحلة غير صحيح'
            }
        }
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'distributors',
            key: 'id'
        }
    },
    distributor_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    vehicle_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'معلومات المركبة المستخدمة في الرحلة'
    },
    route_plan: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'خطة المسار والمحلات المخطط لزيارتها'
    },
    planned_start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actual_start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    planned_end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actual_end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    total_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_stores: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completed_stores: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_amount_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    total_amount_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00
    },
    collected_amount_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    collected_amount_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00
    },
    fuel_cost_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    fuel_cost_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    other_expenses_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    other_expenses_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    distance_covered: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00,
        comment: 'المسافة المقطوعة بالكيلومتر'
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
        validate: {
            isIn: {
                args: [['pending', 'in_progress', 'completed', 'cancelled']],
                msg: 'حالة الرحلة غير صحيحة'
            }
        }
    },
    completion_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        },
        comment: 'نسبة إكمال الرحلة (نسبة مئوية)'
    },
    collection_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        },
        comment: 'نسبة التحصيل (نسبة مئوية)'
    },
    gps_tracking_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    start_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'إحداثيات نقطة البداية'
    },
    end_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'إحداثيات نقطة النهاية'
    },
    problems_encountered: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'المشاكل التي واجهت الموزع'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    tableName: 'distribution_trips',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['trip_date']
        },
        {
            fields: ['distributor_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['trip_number'],
            unique: true
        }
    ]
});

// Instance methods
DistributionTrip.prototype.calculateDuration = function () {
    if (this.actual_start_time && this.actual_end_time) {
        const diffMs = new Date(this.actual_end_time) - new Date(this.actual_start_time);
        return Math.round(diffMs / (1000 * 60)); // minutes
    }
    return null;
};

DistributionTrip.prototype.updateStatus = async function (newStatus, transaction = null) {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('حالة الرحلة غير صحيحة');
    }

    const options = transaction ? { transaction } : {};
    this.status = newStatus;

    // Update timestamps based on status
    const now = new Date();
    if (newStatus === 'in_progress' && !this.actual_start_time) {
        this.actual_start_time = now;
    } else if (newStatus === 'completed' && !this.actual_end_time) {
        this.actual_end_time = now;
    }

    await this.save(options);
    return this;
};

DistributionTrip.prototype.calculateRates = function () {
    // Calculate completion rate
    if (this.total_stores > 0) {
        this.completion_rate = (this.completed_stores / this.total_stores) * 100;
    }

    // Calculate collection rate
    if (this.total_amount_eur > 0 || this.total_amount_syp > 0) {
        const totalEurEquivalent = this.total_amount_eur + (this.total_amount_syp / 1800);
        const collectedEurEquivalent = this.collected_amount_eur + (this.collected_amount_syp / 1800);
        this.collection_rate = totalEurEquivalent > 0 ? (collectedEurEquivalent / totalEurEquivalent) * 100 : 0;
    }

    return this;
};

// Class methods
DistributionTrip.getActiveTrips = async function () {
    return await this.findAll({
        where: {
            status: ['pending', 'in_progress']
        },
        order: [['trip_date', 'ASC'], ['planned_start_time', 'ASC']]
    });
};

DistributionTrip.getTripsByDistributor = async function (distributorId, limit = 10) {
    return await this.findAll({
        where: { distributor_id: distributorId },
        order: [['trip_date', 'DESC']],
        limit: limit
    });
};

DistributionTrip.getTripStatistics = async function (period = 'month') {
    const { Op } = require('sequelize');

    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            dateFilter = {
                trip_date: {
                    [Op.eq]: now.toISOString().split('T')[0]
                }
            };
            break;
        case 'week':
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = {
                trip_date: {
                    [Op.gte]: weekStart.toISOString().split('T')[0]
                }
            };
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = {
                trip_date: {
                    [Op.gte]: monthStart.toISOString().split('T')[0]
                }
            };
            break;
    }

    const trips = await this.findAll({
        where: dateFilter,
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('AVG', sequelize.col('completion_rate')), 'avg_completion'],
            [sequelize.fn('AVG', sequelize.col('collection_rate')), 'avg_collection'],
            [sequelize.fn('SUM', sequelize.col('collected_amount_eur')), 'total_collected_eur'],
            [sequelize.fn('SUM', sequelize.col('collected_amount_syp')), 'total_collected_syp']
        ],
        group: ['status'],
        raw: true
    });

    return trips;
};

export default DistributionTrip; 