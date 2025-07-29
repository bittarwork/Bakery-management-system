import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LocationTracking = sequelize.define('LocationTracking', {
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
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
        validate: {
            min: -90,
            max: 90
        }
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
        validate: {
            min: -180,
            max: 180
        }
    },
    accuracy: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'GPS accuracy in meters'
    },
    speed: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Speed in km/h'
    },
    heading: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Direction in degrees (0-360)',
        validate: {
            min: 0,
            max: 360
        }
    },
    altitude: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Altitude in meters'
    },
    battery_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Device battery level (0-100)',
        validate: {
            min: 0,
            max: 100
        }
    },
    is_moving: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    activity_type: {
        type: DataTypes.ENUM('still', 'walking', 'running', 'driving', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'location_tracking',
    timestamps: false, // We use our own timestamp field
    indexes: [
        {
            fields: ['distributor_id', 'timestamp']
        },
        {
            fields: ['timestamp']
        },
        {
            fields: ['latitude', 'longitude']
        }
    ]
});

// Instance methods
LocationTracking.prototype.getLocationInfo = function () {
    return {
        latitude: parseFloat(this.latitude),
        longitude: parseFloat(this.longitude),
        accuracy: this.accuracy ? parseFloat(this.accuracy) : null,
        speed: this.speed ? parseFloat(this.speed) : null,
        heading: this.heading,
        altitude: this.altitude ? parseFloat(this.altitude) : null,
        battery_level: this.battery_level,
        is_moving: this.is_moving,
        activity_type: this.activity_type,
        timestamp: this.timestamp
    };
};

LocationTracking.prototype.calculateDistance = function (otherLocation) {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = parseFloat(this.latitude) * Math.PI / 180;
    const lat2 = parseFloat(otherLocation.latitude) * Math.PI / 180;
    const deltaLat = (parseFloat(otherLocation.latitude) - parseFloat(this.latitude)) * Math.PI / 180;
    const deltaLon = (parseFloat(otherLocation.longitude) - parseFloat(this.longitude)) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
};

LocationTracking.prototype.getSpeedInKmh = function () {
    return this.speed ? parseFloat(this.speed) : 0;
};

LocationTracking.prototype.getBatteryStatus = function () {
    if (!this.battery_level) return 'unknown';
    if (this.battery_level <= 10) return 'critical';
    if (this.battery_level <= 20) return 'low';
    if (this.battery_level <= 50) return 'medium';
    return 'good';
};

// Static methods
LocationTracking.getLatestLocation = async function (distributorId) {
    return await LocationTracking.findOne({
        where: { distributor_id: distributorId },
        order: [['timestamp', 'DESC']]
    });
};

LocationTracking.getLocationHistory = async function (distributorId, startTime = null, endTime = null, limit = 100) {
    const whereClause = {
        distributor_id: distributorId
    };

    if (startTime && endTime) {
        whereClause.timestamp = {
            [sequelize.Sequelize.Op.between]: [startTime, endTime]
        };
    }

    return await LocationTracking.findAll({
        where: whereClause,
        order: [['timestamp', 'DESC']],
        limit: limit
    });
};

LocationTracking.getAllActiveLocations = async function () {
    // Get the latest location for each distributor
    const latestLocations = await sequelize.query(`
        SELECT lt1.*
        FROM location_tracking lt1
        INNER JOIN (
            SELECT distributor_id, MAX(timestamp) as max_timestamp
            FROM location_tracking
            GROUP BY distributor_id
        ) lt2 ON lt1.distributor_id = lt2.distributor_id 
                AND lt1.timestamp = lt2.max_timestamp
        WHERE lt1.timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY lt1.timestamp DESC
    `, {
        type: sequelize.QueryTypes.SELECT,
        model: LocationTracking
    });

    return latestLocations;
};

LocationTracking.getDistributorRoute = async function (distributorId, startTime, endTime) {
    return await LocationTracking.findAll({
        where: {
            distributor_id: distributorId,
            timestamp: {
                [sequelize.Sequelize.Op.between]: [startTime, endTime]
            }
        },
        order: [['timestamp', 'ASC']]
    });
};

LocationTracking.calculateTotalDistance = async function (distributorId, startTime, endTime) {
    const locations = await LocationTracking.getDistributorRoute(distributorId, startTime, endTime);

    let totalDistance = 0;

    for (let i = 1; i < locations.length; i++) {
        const distance = locations[i - 1].calculateDistance(locations[i]);
        totalDistance += distance;
    }

    return totalDistance;
};

LocationTracking.getLocationStatistics = async function (distributorId, startTime, endTime) {
    const locations = await LocationTracking.getDistributorRoute(distributorId, startTime, endTime);

    if (locations.length === 0) {
        return {
            total_points: 0,
            total_distance: 0,
            average_speed: 0,
            max_speed: 0,
            moving_time: 0,
            stationary_time: 0
        };
    }

    let totalDistance = 0;
    let totalSpeed = 0;
    let maxSpeed = 0;
    let movingTime = 0;
    let stationaryTime = 0;

    for (let i = 1; i < locations.length; i++) {
        const distance = locations[i - 1].calculateDistance(locations[i]);
        totalDistance += distance;

        const timeDiff = (new Date(locations[i].timestamp) - new Date(locations[i - 1].timestamp)) / (1000 * 60); // minutes

        if (locations[i].is_moving) {
            movingTime += timeDiff;
        } else {
            stationaryTime += timeDiff;
        }

        if (locations[i].speed) {
            const speed = parseFloat(locations[i].speed);
            totalSpeed += speed;
            if (speed > maxSpeed) {
                maxSpeed = speed;
            }
        }
    }

    const averageSpeed = locations.length > 1 ? totalSpeed / (locations.length - 1) : 0;

    return {
        total_points: locations.length,
        total_distance: Math.round(totalDistance * 100) / 100,
        average_speed: Math.round(averageSpeed * 100) / 100,
        max_speed: Math.round(maxSpeed * 100) / 100,
        moving_time: Math.round(movingTime),
        stationary_time: Math.round(stationaryTime)
    };
};

LocationTracking.cleanOldRecords = async function (daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await LocationTracking.destroy({
        where: {
            timestamp: {
                [sequelize.Sequelize.Op.lt]: cutoffDate
            }
        }
    });

    return deletedCount;
};

export default LocationTracking;