import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DailyDistributionSchedule = sequelize.define('DailyDistributionSchedule', {
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
    schedule_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    visit_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Order of visit in the route (1, 2, 3, ...)'
    },
    planned_arrival_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    planned_departure_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    actual_arrival_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actual_departure_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    visit_status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'failed'),
        allowNull: false,
        defaultValue: 'scheduled'
    },
    order_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of order IDs for this store visit'
    },
    estimated_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
        comment: 'Estimated duration in minutes'
    },
    actual_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Actual duration in minutes'
    },
    distance_from_previous: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Distance from previous store in km'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'daily_distribution_schedule',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['distributor_id', 'schedule_date']
        },
        {
            fields: ['store_id', 'schedule_date']
        },
        {
            fields: ['visit_status']
        },
        {
            fields: ['distributor_id', 'schedule_date', 'visit_order']
        }
    ]
});

// Instance methods
DailyDistributionSchedule.prototype.startVisit = async function () {
    this.visit_status = 'in_progress';
    this.actual_arrival_time = new Date();
    await this.save();
    return this;
};

DailyDistributionSchedule.prototype.completeVisit = async function (completionData = {}) {
    this.visit_status = 'completed';
    this.actual_departure_time = new Date();

    // Calculate actual duration
    if (this.actual_arrival_time && this.actual_departure_time) {
        const diffMs = new Date(this.actual_departure_time) - new Date(this.actual_arrival_time);
        this.actual_duration = Math.round(diffMs / (1000 * 60)); // minutes
    }

    if (completionData.notes) {
        this.notes = this.notes ? `${this.notes}\n${completionData.notes}` : completionData.notes;
    }

    await this.save();
    return this;
};

DailyDistributionSchedule.prototype.cancelVisit = async function (reason = '') {
    this.visit_status = 'cancelled';
    if (reason) {
        this.notes = this.notes ? `${this.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
    }
    await this.save();
    return this;
};

DailyDistributionSchedule.prototype.failVisit = async function (reason = '') {
    this.visit_status = 'failed';
    if (reason) {
        this.notes = this.notes ? `${this.notes}\nFailed: ${reason}` : `Failed: ${reason}`;
    }
    await this.save();
    return this;
};

DailyDistributionSchedule.prototype.calculateDelay = function () {
    if (this.planned_arrival_time && this.actual_arrival_time) {
        const plannedTime = new Date(`2000-01-01T${this.planned_arrival_time}`);
        const actualTime = new Date(this.actual_arrival_time);
        const actualTimeOnly = new Date(`2000-01-01T${actualTime.toTimeString().slice(0, 8)}`);

        const diffMs = actualTimeOnly - plannedTime;
        return Math.round(diffMs / (1000 * 60)); // minutes (positive = late, negative = early)
    }
    return null;
};

DailyDistributionSchedule.prototype.getVisitDuration = function () {
    if (this.actual_arrival_time && this.actual_departure_time) {
        const diffMs = new Date(this.actual_departure_time) - new Date(this.actual_arrival_time);
        return Math.round(diffMs / (1000 * 60)); // minutes
    }
    return this.actual_duration || null;
};

// Static methods
DailyDistributionSchedule.getTodaySchedule = async function (distributorId = null) {
    const whereClause = {
        schedule_date: new Date().toISOString().split('T')[0]
    };

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    return await DailyDistributionSchedule.findAll({
        where: whereClause,
        order: [['visit_order', 'ASC']]
    });
};

DailyDistributionSchedule.getDistributorSchedule = async function (distributorId, date = null) {
    const whereClause = {
        distributor_id: distributorId
    };

    if (date) {
        whereClause.schedule_date = date;
    }

    return await DailyDistributionSchedule.findAll({
        where: whereClause,
        order: [['schedule_date', 'DESC'], ['visit_order', 'ASC']]
    });
};

DailyDistributionSchedule.getStoreSchedule = async function (storeId, date = null) {
    const whereClause = {
        store_id: storeId
    };

    if (date) {
        whereClause.schedule_date = date;
    }

    return await DailyDistributionSchedule.findAll({
        where: whereClause,
        order: [['schedule_date', 'DESC'], ['visit_order', 'ASC']]
    });
};

DailyDistributionSchedule.getScheduleStatistics = async function (distributorId = null, date = null) {
    const whereClause = {};

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    if (date) {
        whereClause.schedule_date = date;
    }

    const schedules = await DailyDistributionSchedule.findAll({
        where: whereClause,
        attributes: [
            'visit_status',
            [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'count'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('estimated_duration')), 'total_estimated_duration'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('actual_duration')), 'total_actual_duration'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('distance_from_previous')), 'total_distance']
        ],
        group: ['visit_status']
    });

    return schedules;
};

DailyDistributionSchedule.generateSchedule = async function (distributorId, date, storesData) {
    // This method will be used to generate a new schedule for a distributor
    // storesData should be an array of objects with store_id, estimated_duration, order_ids

    const scheduleItems = [];

    for (let i = 0; i < storesData.length; i++) {
        const storeData = storesData[i];
        const scheduleItem = {
            distributor_id: distributorId,
            schedule_date: date,
            store_id: storeData.store_id,
            visit_order: i + 1,
            estimated_duration: storeData.estimated_duration || 15,
            order_ids: storeData.order_ids || [],
            distance_from_previous: storeData.distance_from_previous || 0,
            notes: storeData.notes || null
        };

        scheduleItems.push(scheduleItem);
    }

    // Clear existing schedule for this distributor and date
    await DailyDistributionSchedule.destroy({
        where: {
            distributor_id: distributorId,
            schedule_date: date
        }
    });

    // Create new schedule items
    const createdSchedules = await DailyDistributionSchedule.bulkCreate(scheduleItems);

    return createdSchedules;
};

export default DailyDistributionSchedule;