import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DistributionTrip = sequelize.define('DistributionTrip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    trip_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Unique trip number (auto-generated)',
        defaultValue: () => {
            const now = new Date();
            const date = now.toISOString().split('T')[0].replace(/-/g, '');
            const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `TRIP-${date}-${time}-${random}`;
        }
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    trip_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    trip_status: {
        type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'planned'
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    total_distance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Total distance in kilometers'
    },
    total_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total duration in minutes'
    },
    fuel_consumption: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Fuel consumption in liters'
    },
    vehicle_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'vehicles',
            key: 'id'
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'distribution_trips',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['distributor_id', 'trip_date']
        },
        {
            fields: ['trip_status']
        },
        {
            fields: ['trip_date']
        }
    ]
});

// Instance methods
DistributionTrip.prototype.startTrip = async function () {
    this.trip_status = 'in_progress';
    this.start_time = new Date();
    await this.save();
    return this;
};

DistributionTrip.prototype.completeTrip = async function (endData = {}) {
    this.trip_status = 'completed';
    this.end_time = new Date();

    if (endData.total_distance) {
        this.total_distance = endData.total_distance;
    }
    if (endData.total_duration) {
        this.total_duration = endData.total_duration;
    }
    if (endData.fuel_consumption) {
        this.fuel_consumption = endData.fuel_consumption;
    }
    if (endData.notes) {
        this.notes = endData.notes;
    }

    await this.save();
    return this;
};

DistributionTrip.prototype.cancelTrip = async function (reason = '') {
    this.trip_status = 'cancelled';
    if (reason) {
        this.notes = this.notes ? `${this.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
    }
    await this.save();
    return this;
};

DistributionTrip.prototype.getTripDuration = function () {
    if (this.start_time && this.end_time) {
        const diffMs = new Date(this.end_time) - new Date(this.start_time);
        return Math.round(diffMs / (1000 * 60)); // Return minutes
    }
    return null;
};

DistributionTrip.prototype.getTripEfficiency = function () {
    if (this.total_distance > 0 && this.total_duration > 0) {
        return (this.total_distance / this.total_duration) * 60; // km/h
    }
    return 0;
};

// Static methods
DistributionTrip.getTodayTrips = async function (distributorId = null) {
    const whereClause = {
        trip_date: new Date().toISOString().split('T')[0]
    };

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    return await DistributionTrip.findAll({
        where: whereClause,
        order: [['start_time', 'ASC']]
    });
};

DistributionTrip.getActiveTrips = async function () {
    return await DistributionTrip.findAll({
        where: {
            trip_status: 'in_progress'
        },
        order: [['start_time', 'ASC']]
    });
};

DistributionTrip.getDistributorTrips = async function (distributorId, startDate = null, endDate = null) {
    const whereClause = {
        distributor_id: distributorId
    };

    if (startDate && endDate) {
        whereClause.trip_date = {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
        };
    }

    return await DistributionTrip.findAll({
        where: whereClause,
        order: [['trip_date', 'DESC'], ['start_time', 'ASC']]
    });
};

DistributionTrip.getTripStatistics = async function (distributorId = null, startDate = null, endDate = null) {
    const whereClause = {};

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    if (startDate && endDate) {
        whereClause.trip_date = {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
        };
    }

    const trips = await DistributionTrip.findAll({
        where: whereClause,
        attributes: [
            'trip_status',
            [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'count'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('total_distance')), 'total_distance'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('total_duration')), 'total_duration'],
            [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('fuel_consumption')), 'total_fuel']
        ],
        group: ['trip_status']
    });

    return trips;
};

export default DistributionTrip;