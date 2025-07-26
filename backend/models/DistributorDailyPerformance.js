import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DistributorDailyPerformance = sequelize.define('DistributorDailyPerformance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    work_started_at: {
        type: DataTypes.TIME,
        allowNull: true
    },
    work_ended_at: {
        type: DataTypes.TIME,
        allowNull: true
    },
    total_work_hours: {
        type: DataTypes.DECIMAL(4, 2),
        defaultValue: 0.00
    },
    total_orders_assigned: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_orders_delivered: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_orders_failed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_distance_km: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    total_revenue_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    total_revenue_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    commission_earned_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    commission_earned_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    fuel_cost_eur: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00,
        comment: 'Estimated fuel cost for the day'
    },
    vehicle_expenses_eur: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00,
        comment: 'Other vehicle expenses'
    },
    average_delivery_time_minutes: {
        type: DataTypes.DECIMAL(6, 2),
        defaultValue: 0.00
    },
    customer_ratings: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Customer feedback and ratings'
    },
    issues_reported: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Issues and problems during the day'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    efficiency_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: 'Calculated efficiency score (0-100)'
    }
}, {
    tableName: 'distributor_daily_performance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['distributor_id', 'date'] },
        { fields: ['date'] },
        { fields: ['efficiency_score'] }
    ]
});

// Instance methods
DistributorDailyPerformance.prototype.calculateEfficiencyScore = function () {
    const deliveryRate = this.total_orders_assigned > 0 
        ? (this.total_orders_delivered / this.total_orders_assigned) * 100 
        : 0;
    
    const timeEfficiency = this.total_work_hours > 0 && this.total_orders_delivered > 0
        ? Math.min(100, (this.total_orders_delivered / this.total_work_hours) * 10)
        : 0;
    
    const score = (deliveryRate * 0.7) + (timeEfficiency * 0.3);
    return Math.min(100, Math.max(0, score));
};

// Class methods
DistributorDailyPerformance.getPerformanceReport = async function (distributorId, startDate, endDate) {
    return await this.findAll({
        where: {
            distributor_id: distributorId,
            date: {
                [sequelize.Sequelize.Op.between]: [startDate, endDate]
            }
        },
        order: [['date', 'ASC']]
    });
};

DistributorDailyPerformance.getTopPerformers = async function (date, limit = 10) {
    return await this.findAll({
        where: { date },
        order: [['efficiency_score', 'DESC']],
        limit,
        include: [{
            model: sequelize.models.User,
            as: 'distributor',
            attributes: ['id', 'full_name', 'phone']
        }]
    });
};

export default DistributorDailyPerformance; 