import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const UserPreferences = sequelize.define('UserPreferences', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    language: {
        type: DataTypes.ENUM('ar', 'en', 'fr', 'nl'),
        defaultValue: 'ar',
        allowNull: false,
        validate: {
            isIn: {
                args: [['ar', 'en', 'fr', 'nl']],
                msg: 'اللغة المحددة غير مدعومة'
            }
        }
    },
    theme: {
        type: DataTypes.ENUM('light', 'dark', 'auto'),
        defaultValue: 'light',
        allowNull: false
    },
    timezone: {
        type: DataTypes.STRING(50),
        defaultValue: 'Europe/Brussels',
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'EUR',
        allowNull: false,
        validate: {
            len: {
                args: [3, 3],
                msg: 'رمز العملة يجب أن يكون 3 أحرف'
            }
        }
    },
    date_format: {
        type: DataTypes.ENUM('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'),
        defaultValue: 'DD/MM/YYYY',
        allowNull: false
    },
    time_format: {
        type: DataTypes.ENUM('12h', '24h'),
        defaultValue: '24h',
        allowNull: false
    },
    notifications: {
        type: DataTypes.JSON,
        defaultValue: {
            email: true,
            push: true,
            sms: false,
            orders: true,
            payments: true,
            system: true
        }
    },
    dashboard_layout: {
        type: DataTypes.JSON,
        defaultValue: {
            widgets: ['orders', 'products', 'payments', 'reports'],
            columns: 2,
            compact: false
        }
    },
    display_preferences: {
        type: DataTypes.JSON,
        defaultValue: {
            items_per_page: 20,
            show_images: true,
            show_descriptions: true,
            default_view: 'table'
        }
    },
    accessibility: {
        type: DataTypes.JSON,
        defaultValue: {
            high_contrast: false,
            large_text: false,
            screen_reader: false,
            keyboard_navigation: false
        }
    },
    privacy_settings: {
        type: DataTypes.JSON,
        defaultValue: {
            share_activity: false,
            analytics: true,
            marketing: false
        }
    },
    auto_logout: {
        type: DataTypes.INTEGER,
        defaultValue: 480, // 8 hours in minutes
        validate: {
            min: {
                args: [30],
                msg: 'مدة الجلسة يجب أن تكون 30 دقيقة على الأقل'
            },
            max: {
                args: [1440],
                msg: 'مدة الجلسة يجب أن تكون 24 ساعة كحد أقصى'
            }
        }
    }
}, {
    tableName: 'user_preferences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['user_id']
        },
        {
            fields: ['language']
        }
    ]
});

// Instance methods
UserPreferences.prototype.updateNotifications = function (settings) {
    this.notifications = { ...this.notifications, ...settings };
    return this.save();
};

UserPreferences.prototype.updateDashboardLayout = function (layout) {
    this.dashboard_layout = { ...this.dashboard_layout, ...layout };
    return this.save();
};

UserPreferences.prototype.updateDisplayPreferences = function (preferences) {
    this.display_preferences = { ...this.display_preferences, ...preferences };
    return this.save();
};

UserPreferences.prototype.updateAccessibility = function (settings) {
    this.accessibility = { ...this.accessibility, ...settings };
    return this.save();
};

UserPreferences.prototype.updatePrivacySettings = function (settings) {
    this.privacy_settings = { ...this.privacy_settings, ...settings };
    return this.save();
};

UserPreferences.prototype.getFormattedPreferences = function () {
    return {
        general: {
            language: this.language,
            theme: this.theme,
            timezone: this.timezone,
            currency: this.currency,
            date_format: this.date_format,
            time_format: this.time_format,
            auto_logout: this.auto_logout
        },
        notifications: this.notifications,
        dashboard: this.dashboard_layout,
        display: this.display_preferences,
        accessibility: this.accessibility,
        privacy: this.privacy_settings
    };
};

// Class methods
UserPreferences.findByUserId = async function (userId) {
    return await UserPreferences.findOne({
        where: { user_id: userId }
    });
};

UserPreferences.createDefaultForUser = async function (userId) {
    return await UserPreferences.create({
        user_id: userId
    });
};

UserPreferences.getOrCreateForUser = async function (userId) {
    let preferences = await UserPreferences.findByUserId(userId);
    if (!preferences) {
        preferences = await UserPreferences.createDefaultForUser(userId);
    }
    return preferences;
};

export default UserPreferences; 