import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DistributionPerformance = sequelize.define('DistributionPerformance', {
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
    performance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    total_trips: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    completed_trips: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_orders: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    completed_orders: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_distance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total working time in minutes'
    },
    fuel_consumption: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    on_time_deliveries: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    late_deliveries: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    customer_satisfaction: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Average rating 0-5'
    },
    efficiency_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Efficiency percentage'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'distribution_performance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['distributor_id', 'performance_date']
        },
        {
            fields: ['performance_date']
        },
        {
            fields: ['efficiency_score']
        }
    ]
});

// Instance methods
DistributionPerformance.prototype.calculateCompletionRate = function () {
    if (this.total_trips === 0) return 0;
    return Math.round((this.completed_trips / this.total_trips) * 100);
};

DistributionPerformance.prototype.calculateOrderCompletionRate = function () {
    if (this.total_orders === 0) return 0;
    return Math.round((this.completed_orders / this.total_orders) * 100);
};

DistributionPerformance.prototype.calculateOnTimeRate = function () {
    const totalDeliveries = this.on_time_deliveries + this.late_deliveries;
    if (totalDeliveries === 0) return 0;
    return Math.round((this.on_time_deliveries / totalDeliveries) * 100);
};

DistributionPerformance.prototype.calculateAverageSpeed = function () {
    if (this.total_duration === 0) return 0;
    const hours = this.total_duration / 60;
    return Math.round((this.total_distance / hours) * 100) / 100; // km/h
};

DistributionPerformance.prototype.calculateFuelEfficiency = function () {
    if (this.fuel_consumption === 0) return 0;
    return Math.round((this.total_distance / this.fuel_consumption) * 100) / 100; // km/l
};

DistributionPerformance.prototype.getPerformanceGrade = function () {
    const efficiency = this.efficiency_score;
    if (efficiency >= 90) return 'A+';
    if (efficiency >= 80) return 'A';
    if (efficiency >= 70) return 'B+';
    if (efficiency >= 60) return 'B';
    if (efficiency >= 50) return 'C+';
    if (efficiency >= 40) return 'C';
    return 'D';
};

DistributionPerformance.prototype.getPerformanceSummary = function () {
    return {
        date: this.performance_date,
        distributor_id: this.distributor_id,
        completion_rate: this.calculateCompletionRate(),
        order_completion_rate: this.calculateOrderCompletionRate(),
        on_time_rate: this.calculateOnTimeRate(),
        average_speed: this.calculateAverageSpeed(),
        fuel_efficiency: this.calculateFuelEfficiency(),
        performance_grade: this.getPerformanceGrade(),
        customer_satisfaction: parseFloat(this.customer_satisfaction),
        efficiency_score: parseFloat(this.efficiency_score),
        total_distance: parseFloat(this.total_distance),
        total_duration: this.total_duration,
        fuel_consumption: parseFloat(this.fuel_consumption)
    };
};

// Static methods
DistributionPerformance.getDistributorPerformance = async function (distributorId, startDate = null, endDate = null) {
    const whereClause = {
        distributor_id: distributorId
    };

    if (startDate && endDate) {
        whereClause.performance_date = {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
        };
    }

    return await DistributionPerformance.findAll({
        where: whereClause,
        order: [['performance_date', 'DESC']]
    });
};

DistributionPerformance.getTodayPerformance = async function (distributorId = null) {
    const whereClause = {
        performance_date: new Date().toISOString().split('T')[0]
    };

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    return await DistributionPerformance.findAll({
        where: whereClause,
        order: [['efficiency_score', 'DESC']]
    });
};

DistributionPerformance.getPerformanceLeaderboard = async function (date = null, limit = 10) {
    const whereClause = {};

    if (date) {
        whereClause.performance_date = date;
    }

    return await DistributionPerformance.findAll({
        where: whereClause,
        order: [['efficiency_score', 'DESC'], ['completed_orders', 'DESC']],
        limit: limit
    });
};

DistributionPerformance.getPerformanceStatistics = async function (startDate = null, endDate = null) {
    const whereClause = {};

    if (startDate && endDate) {
        whereClause.performance_date = {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
        };
    }

    const stats = await DistributionPerformance.findAll({
        where: whereClause,
        attributes: [
            [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'total_records'],
            [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('efficiency_score')), 'avg_efficiency'],
            [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('customer_satisfaction')), 'avg_satisfaction'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('total_distance')), 'total_distance'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('total_duration')), 'total_duration'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('fuel_consumption')), 'total_fuel'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('completed_orders')), 'total_completed_orders'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('on_time_deliveries')), 'total_on_time_deliveries']
        ]
    });

    return stats[0] || {
        total_records: 0,
        avg_efficiency: 0,
        avg_satisfaction: 0,
        total_distance: 0,
        total_duration: 0,
        total_fuel: 0,
        total_completed_orders: 0,
        total_on_time_deliveries: 0
    };
};

DistributionPerformance.updateOrCreatePerformance = async function (distributorId, date, performanceData) {
    const [performance, created] = await DistributionPerformance.findOrCreate({
        where: {
            distributor_id: distributorId,
            performance_date: date
        },
        defaults: {
            distributor_id: distributorId,
            performance_date: date,
            ...performanceData
        }
    });

    if (!created) {
        // Update existing record
        await performance.update(performanceData);
    }

    return performance;
};

DistributionPerformance.calculateDailyPerformance = async function (distributorId, date) {
    // This method calculates performance metrics for a specific day
    // It should be called at the end of each day to update performance records

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get trips for the day
    const trips = await sequelize.models.DistributionTrip.findAll({
        where: {
            distributor_id: distributorId,
            trip_date: date
        }
    });

    // Get schedule for the day
    const schedule = await sequelize.models.DailyDistributionSchedule.findAll({
        where: {
            distributor_id: distributorId,
            schedule_date: date
        }
    });

    // Get orders for the day
    const orders = await sequelize.models.Order.findAll({
        where: {
            assigned_distributor_id: distributorId,
            delivery_date: date
        }
    });

    // Calculate metrics
    const totalTrips = trips.length;
    const completedTrips = trips.filter(trip => trip.trip_status === 'completed').length;
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    const totalDistance = trips.reduce((sum, trip) => sum + parseFloat(trip.total_distance || 0), 0);
    const totalDuration = trips.reduce((sum, trip) => sum + (trip.total_duration || 0), 0);
    const fuelConsumption = trips.reduce((sum, trip) => sum + parseFloat(trip.fuel_consumption || 0), 0);

    const onTimeDeliveries = schedule.filter(visit => visit.visit_status === 'completed' && visit.calculateDelay() <= 0).length;
    const lateDeliveries = schedule.filter(visit => visit.visit_status === 'completed' && visit.calculateDelay() > 0).length;

    // Calculate efficiency score (simplified formula)
    const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
    const onTimeRate = (onTimeDeliveries + lateDeliveries) > 0 ? (onTimeDeliveries / (onTimeDeliveries + lateDeliveries)) * 100 : 0;
    const efficiencyScore = (completionRate * 0.4) + (onTimeRate * 0.4) + (20); // Base 20 points

    const performanceData = {
        total_trips: totalTrips,
        completed_trips: completedTrips,
        total_orders: totalOrders,
        completed_orders: completedOrders,
        total_distance: totalDistance,
        total_duration: totalDuration,
        fuel_consumption: fuelConsumption,
        on_time_deliveries: onTimeDeliveries,
        late_deliveries: lateDeliveries,
        efficiency_score: Math.min(100, Math.round(efficiencyScore)),
        customer_satisfaction: 0.00 // Will be updated when customer ratings are available
    };

    return await DistributionPerformance.updateOrCreatePerformance(distributorId, date, performanceData);
};

export default DistributionPerformance;