import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DistributionSettings = sequelize.define('DistributionSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    setting_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    setting_value: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    setting_type: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
        allowNull: false,
        defaultValue: 'string'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_system: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'System settings cannot be modified by users'
    }
}, {
    tableName: 'distribution_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['setting_key']
        },
        {
            fields: ['setting_type']
        }
    ]
});

// Instance methods
DistributionSettings.prototype.getValue = function () {
    switch (this.setting_type) {
        case 'number':
            return parseFloat(this.setting_value) || 0;
        case 'boolean':
            return this.setting_value === 'true' || this.setting_value === '1';
        case 'json':
            try {
                return JSON.parse(this.setting_value);
            } catch (error) {
                return null;
            }
        default:
            return this.setting_value;
    }
};

DistributionSettings.prototype.setValue = function (value) {
    switch (this.setting_type) {
        case 'number':
            this.setting_value = parseFloat(value).toString();
            break;
        case 'boolean':
            this.setting_value = value ? 'true' : 'false';
            break;
        case 'json':
            this.setting_value = JSON.stringify(value);
            break;
        default:
            this.setting_value = value.toString();
    }
};

// Static methods
DistributionSettings.getSetting = async function (key, defaultValue = null) {
    const setting = await DistributionSettings.findOne({
        where: { setting_key: key }
    });

    if (!setting) {
        return defaultValue;
    }

    return setting.getValue();
};

DistributionSettings.setSetting = async function (key, value, type = 'string', description = null) {
    const [setting, created] = await DistributionSettings.findOrCreate({
        where: { setting_key: key },
        defaults: {
            setting_key: key,
            setting_value: value.toString(),
            setting_type: type,
            description: description
        }
    });

    if (!created) {
        setting.setValue(value);
        if (description) {
            setting.description = description;
        }
        await setting.save();
    }

    return setting;
};

DistributionSettings.getSystemSettings = async function () {
    const settings = await DistributionSettings.findAll({
        where: { is_system: true },
        order: [['setting_key', 'ASC']]
    });

    const result = {};
    settings.forEach(setting => {
        result[setting.setting_key] = setting.getValue();
    });

    return result;
};

DistributionSettings.getAllSettings = async function () {
    const settings = await DistributionSettings.findAll({
        order: [['setting_key', 'ASC']]
    });

    const result = {};
    settings.forEach(setting => {
        result[setting.setting_key] = {
            value: setting.getValue(),
            type: setting.setting_type,
            description: setting.description,
            is_system: setting.is_system
        };
    });

    return result;
};

DistributionSettings.initializeDefaultSettings = async function () {
    const defaultSettings = [
        {
            key: 'default_visit_duration',
            value: 15,
            type: 'number',
            description: 'Default visit duration in minutes',
            is_system: true
        },
        {
            key: 'max_daily_distance',
            value: 200,
            type: 'number',
            description: 'Maximum daily distance in kilometers',
            is_system: true
        },
        {
            key: 'max_daily_orders',
            value: 50,
            type: 'number',
            description: 'Maximum orders per distributor per day',
            is_system: true
        },
        {
            key: 'route_optimization_enabled',
            value: true,
            type: 'boolean',
            description: 'Enable automatic route optimization',
            is_system: true
        },
        {
            key: 'real_time_tracking_enabled',
            value: true,
            type: 'boolean',
            description: 'Enable real-time location tracking',
            is_system: true
        },
        {
            key: 'location_update_interval',
            value: 30,
            type: 'number',
            description: 'Location update interval in seconds',
            is_system: true
        },
        {
            key: 'performance_alert_threshold',
            value: 80,
            type: 'number',
            description: 'Performance alert threshold percentage',
            is_system: true
        },
        {
            key: 'google_maps_api_key',
            value: '',
            type: 'string',
            description: 'Google Maps API key for route optimization',
            is_system: true
        },
        {
            key: 'default_working_hours',
            value: { start: '08:00', end: '18:00' },
            type: 'json',
            description: 'Default working hours for distributors',
            is_system: true
        },
        {
            key: 'break_time_minutes',
            value: 60,
            type: 'number',
            description: 'Total break time in minutes per day',
            is_system: true
        }
    ];

    for (const setting of defaultSettings) {
        await DistributionSettings.setSetting(
            setting.key,
            setting.value,
            setting.type,
            setting.description
        );
    }

    console.log('✅ Default distribution settings initialized');
};

// Helper methods for specific settings
DistributionSettings.getWorkingHours = async function () {
    const hours = await DistributionSettings.getSetting('default_working_hours', { start: '08:00', end: '18:00' });
    return typeof hours === 'string' ? JSON.parse(hours) : hours;
};

DistributionSettings.isRouteOptimizationEnabled = async function () {
    return await DistributionSettings.getSetting('route_optimization_enabled', true);
};

DistributionSettings.isRealTimeTrackingEnabled = async function () {
    return await DistributionSettings.getSetting('real_time_tracking_enabled', true);
};

DistributionSettings.getLocationUpdateInterval = async function () {
    return await DistributionSettings.getSetting('location_update_interval', 30);
};

DistributionSettings.getMaxDailyDistance = async function () {
    return await DistributionSettings.getSetting('max_daily_distance', 200);
};

DistributionSettings.getMaxDailyOrders = async function () {
    return await DistributionSettings.getSetting('max_daily_orders', 50);
};

DistributionSettings.getGoogleMapsApiKey = async function () {
    return await DistributionSettings.getSetting('google_maps_api_key', '');
};

export default DistributionSettings;