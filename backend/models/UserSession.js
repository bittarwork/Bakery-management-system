import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const UserSession = sequelize.define('UserSession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    session_token: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    device_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'معلومات الجهاز: نوع المتصفح، نظام التشغيل'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        validate: {
            isIP: {
                msg: 'عنوان IP غير صحيح'
            }
        }
    },
    location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'الموقع الجغرافي: المدينة، البلد'
    },
    login_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    last_activity: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    logout_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    logout_reason: {
        type: DataTypes.ENUM('manual', 'timeout', 'forced', 'security'),
        allowNull: true
    }
}, {
    tableName: 'user_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['session_token']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['expires_at']
        },
        {
            fields: ['last_activity']
        }
    ]
});

// Instance methods
UserSession.prototype.isExpired = function () {
    return new Date() > this.expires_at;
};

UserSession.prototype.extend = function (hours = 24) {
    this.expires_at = new Date(Date.now() + (hours * 60 * 60 * 1000));
    this.last_activity = new Date();
    return this.save();
};

UserSession.prototype.terminate = function (reason = 'manual') {
    this.is_active = false;
    this.logout_time = new Date();
    this.logout_reason = reason;
    return this.save();
};

// Class methods
UserSession.cleanupExpired = async function () {
    const now = new Date();
    return await UserSession.update(
        {
            is_active: false,
            logout_time: now,
            logout_reason: 'timeout'
        },
        {
            where: {
                expires_at: { [Op.lt]: now },
                is_active: true
            }
        }
    );
};

UserSession.findActiveByToken = async function (token) {
    return await UserSession.findOne({
        where: {
            session_token: token,
            is_active: true
        },
        include: [{
            model: User,
            as: 'user'
        }]
    });
};

UserSession.findUserActiveSessions = async function (userId) {
    return await UserSession.findAll({
        where: {
            user_id: userId,
            is_active: true
        },
        order: [['last_activity', 'DESC']]
    });
};

export default UserSession; 