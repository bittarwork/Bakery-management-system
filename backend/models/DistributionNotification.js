import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DistributionNotification = sequelize.define('DistributionNotification', {
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
    notification_type: {
        type: DataTypes.ENUM('schedule_update', 'route_change', 'delay_alert', 'performance_alert', 'system_alert'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal'
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    action_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    action_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional notification data'
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'distribution_notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['distributor_id', 'is_read']
        },
        {
            fields: ['notification_type']
        },
        {
            fields: ['priority']
        },
        {
            fields: ['created_at']
        }
    ]
});

// Instance methods
DistributionNotification.prototype.markAsRead = async function () {
    this.is_read = true;
    this.read_at = new Date();
    await this.save();
    return this;
};

DistributionNotification.prototype.markAsUnread = async function () {
    this.is_read = false;
    this.read_at = null;
    await this.save();
    return this;
};

DistributionNotification.prototype.getNotificationInfo = function () {
    return {
        id: this.id,
        type: this.notification_type,
        title: this.title,
        message: this.message,
        priority: this.priority,
        is_read: this.is_read,
        action_required: this.action_required,
        action_url: this.action_url,
        metadata: this.metadata,
        created_at: this.created_at,
        read_at: this.read_at
    };
};

// Static methods
DistributionNotification.getUnreadNotifications = async function (distributorId = null) {
    const whereClause = {
        is_read: false
    };

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    return await DistributionNotification.findAll({
        where: whereClause,
        order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
};

DistributionNotification.getNotificationsByType = async function (distributorId, type) {
    return await DistributionNotification.findAll({
        where: {
            distributor_id: distributorId,
            notification_type: type
        },
        order: [['created_at', 'DESC']]
    });
};

DistributionNotification.getHighPriorityNotifications = async function (distributorId = null) {
    const whereClause = {
        priority: ['high', 'urgent']
    };

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    return await DistributionNotification.findAll({
        where: whereClause,
        order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
};

DistributionNotification.markAllAsRead = async function (distributorId) {
    return await DistributionNotification.update(
        {
            is_read: true,
            read_at: new Date()
        },
        {
            where: {
                distributor_id: distributorId,
                is_read: false
            }
        }
    );
};

DistributionNotification.createNotification = async function (notificationData) {
    const {
        distributor_id,
        notification_type,
        title,
        message,
        priority = 'normal',
        action_required = false,
        action_url = null,
        metadata = null
    } = notificationData;

    return await DistributionNotification.create({
        distributor_id,
        notification_type,
        title,
        message,
        priority,
        action_required,
        action_url,
        metadata
    });
};

// Predefined notification creators
DistributionNotification.createScheduleUpdateNotification = async function (distributorId, scheduleData) {
    return await DistributionNotification.createNotification({
        distributor_id: distributorId,
        notification_type: 'schedule_update',
        title: 'Schedule Updated',
        message: `Your distribution schedule has been updated for ${scheduleData.date}. Please check your new route.`,
        priority: 'normal',
        action_required: true,
        action_url: `/distribution/schedule/${scheduleData.date}`,
        metadata: scheduleData
    });
};

DistributionNotification.createRouteChangeNotification = async function (distributorId, routeData) {
    return await DistributionNotification.createNotification({
        distributor_id: distributorId,
        notification_type: 'route_change',
        title: 'Route Changed',
        message: `Your route has been optimized. New route includes ${routeData.store_count} stores.`,
        priority: 'high',
        action_required: true,
        action_url: `/distribution/route/${routeData.trip_id}`,
        metadata: routeData
    });
};

DistributionNotification.createDelayAlertNotification = async function (distributorId, delayData) {
    return await DistributionNotification.createNotification({
        distributor_id: distributorId,
        notification_type: 'delay_alert',
        title: 'Delivery Delay Alert',
        message: `You are running ${delayData.delay_minutes} minutes behind schedule. Please expedite your deliveries.`,
        priority: 'urgent',
        action_required: true,
        action_url: `/distribution/schedule/today`,
        metadata: delayData
    });
};

DistributionNotification.createPerformanceAlertNotification = async function (distributorId, performanceData) {
    return await DistributionNotification.createNotification({
        distributor_id: distributorId,
        notification_type: 'performance_alert',
        title: 'Performance Alert',
        message: `Your performance score is ${performanceData.score}%. Please review your delivery efficiency.`,
        priority: 'high',
        action_required: false,
        action_url: `/distribution/performance`,
        metadata: performanceData
    });
};

DistributionNotification.createSystemAlertNotification = async function (distributorId, systemData) {
    return await DistributionNotification.createNotification({
        distributor_id: distributorId,
        notification_type: 'system_alert',
        title: 'System Alert',
        message: systemData.message,
        priority: systemData.priority || 'normal',
        action_required: systemData.action_required || false,
        action_url: systemData.action_url || null,
        metadata: systemData
    });
};

DistributionNotification.cleanOldNotifications = async function (daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await DistributionNotification.destroy({
        where: {
            created_at: {
                [sequelize.Sequelize.Op.lt]: cutoffDate
            },
            is_read: true
        }
    });

    return deletedCount;
};

export default DistributionNotification;