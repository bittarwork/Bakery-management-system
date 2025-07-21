import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DeliveryTracking = sequelize.define('DeliveryTracking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    delivery_schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'delivery_schedules',
            key: 'id'
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
    tracking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('not_started', 'en_route', 'arrived', 'delivering', 'completed', 'failed'),
        defaultValue: 'not_started'
    },

    // Location tracking
    current_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Current GPS coordinates with timestamp'
    },
    start_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Starting point coordinates'
    },
    delivery_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Delivery destination coordinates'
    },

    // Time tracking
    estimated_arrival: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actual_arrival: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivery_start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivery_completion_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Delivery proof and documentation
    delivery_proof: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Photos, signatures, and other proof of delivery'
    },
    delivery_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    customer_signature: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photo_urls: {
        type: DataTypes.JSON,
        allowNull: true
    },

    // Issues and delays
    issues_encountered: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of issues with descriptions and timestamps'
    },
    delay_reasons: {
        type: DataTypes.JSON,
        allowNull: true
    },
    delay_duration_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    // Update settings
    last_update: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    update_frequency: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        comment: 'Update frequency in minutes'
    }
}, {
    tableName: 'delivery_tracking',
    timestamps: false,
    indexes: [
        { fields: ['delivery_schedule_id'] },
        { fields: ['distributor_id'] },
        { fields: ['tracking_date'] },
        { fields: ['status'] },
        { fields: ['distributor_id', 'tracking_date'] },
        { fields: ['delivery_schedule_id', 'status'] }
    ]
});

// Instance methods
DeliveryTracking.prototype.updateLocation = async function (location) {
    this.current_location = {
        ...location,
        timestamp: new Date()
    };
    this.last_update = new Date();

    await this.save();
    return this;
};

DeliveryTracking.prototype.updateStatus = async function (newStatus, additionalData = {}) {
    const validTransitions = {
        'not_started': ['en_route'],
        'en_route': ['arrived', 'failed'],
        'arrived': ['delivering', 'failed'],
        'delivering': ['completed', 'failed'],
        'completed': [],
        'failed': ['en_route'] // Allow retry
    };

    if (!validTransitions[this.status]?.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    const now = new Date();
    this.status = newStatus;
    this.last_update = now;

    // Update timestamps based on status
    switch (newStatus) {
        case 'en_route':
            if (!this.start_time) {
                this.start_time = now;
            }
            break;
        case 'arrived':
            this.actual_arrival = now;
            break;
        case 'delivering':
            this.delivery_start_time = now;
            break;
        case 'completed':
            this.delivery_completion_time = now;
            break;
    }

    // Merge additional data
    Object.assign(this, additionalData);

    await this.save();
    return this;
};

DeliveryTracking.prototype.addIssue = async function (issue) {
    const issues = this.issues_encountered || [];
    issues.push({
        ...issue,
        timestamp: new Date(),
        id: Date.now()
    });

    this.issues_encountered = issues;
    await this.save();
    return this;
};

DeliveryTracking.prototype.calculateDelay = function () {
    if (!this.estimated_arrival || !this.actual_arrival) {
        return 0;
    }

    const delay = (new Date(this.actual_arrival) - new Date(this.estimated_arrival)) / (1000 * 60);
    return Math.max(0, delay);
};

DeliveryTracking.prototype.getDurationMinutes = function () {
    if (!this.delivery_start_time || !this.delivery_completion_time) {
        return null;
    }

    return (new Date(this.delivery_completion_time) - new Date(this.delivery_start_time)) / (1000 * 60);
};

DeliveryTracking.prototype.getProgressPercentage = function () {
    const statusProgress = {
        'not_started': 0,
        'en_route': 25,
        'arrived': 50,
        'delivering': 75,
        'completed': 100,
        'failed': 0
    };

    return statusProgress[this.status] || 0;
};

// Class methods
DeliveryTracking.findByDeliverySchedule = async function (deliveryScheduleId) {
    return await this.findOne({
        where: { delivery_schedule_id: deliveryScheduleId }
    });
};

DeliveryTracking.findByDistributor = async function (distributorId, date = null) {
    const whereClause = { distributor_id: distributorId };

    if (date) {
        whereClause.tracking_date = date;
    }

    return await this.findAll({
        where: whereClause,
        order: [['tracking_date', 'DESC'], ['last_update', 'DESC']]
    });
};

DeliveryTracking.findActiveDeliveries = async function (distributorId = null) {
    const whereClause = {
        status: ['en_route', 'arrived', 'delivering']
    };

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    return await this.findAll({
        where: whereClause,
        order: [['last_update', 'DESC']]
    });
};

DeliveryTracking.createFromSchedule = async function (deliverySchedule, distributorId) {
    return await this.create({
        delivery_schedule_id: deliverySchedule.id,
        distributor_id: distributorId,
        tracking_date: deliverySchedule.scheduled_date,
        estimated_arrival: new Date(`${deliverySchedule.scheduled_date} ${deliverySchedule.scheduled_time_start}`),
        status: 'not_started'
    });
};

DeliveryTracking.getLiveTracking = async function (date, distributorId = null) {
    const whereClause = {
        tracking_date: date,
        status: ['en_route', 'arrived', 'delivering']
    };

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    const trackings = await this.findAll({
        where: whereClause,
        include: [
            {
                model: sequelize.models.DeliverySchedule,
                as: 'schedule',
                include: [
                    { model: sequelize.models.Order, as: 'order' },
                    { model: sequelize.models.User, as: 'distributor' }
                ]
            }
        ],
        order: [['last_update', 'DESC']]
    });

    return trackings.map(tracking => ({
        ...tracking.toJSON(),
        progress_percentage: tracking.getProgressPercentage(),
        delay_minutes: tracking.calculateDelay(),
        duration_minutes: tracking.getDurationMinutes()
    }));
};

export default DeliveryTracking; 