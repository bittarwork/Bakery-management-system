import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LocationHistory = sequelize.define('LocationHistory', {
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
    location: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'GPS coordinates with accuracy and speed'
    },
    recorded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    activity_type: {
        type: DataTypes.ENUM('moving', 'stopped', 'delivering', 'break'),
        defaultValue: 'moving'
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'orders',
            key: 'id'
        },
        comment: 'Associated order if delivering'
    },
    battery_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Mobile device battery level'
    },
    is_manual: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether location was manually entered'
    }
}, {
    tableName: 'location_history',
    timestamps: false,
    indexes: [
        { fields: ['distributor_id'] },
        { fields: ['recorded_at'] },
        { fields: ['distributor_id', 'recorded_at'] },
        { fields: ['order_id'] }
    ]
});

// Class methods
LocationHistory.getDistributorRoute = async function (distributorId, date) {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return await this.findAll({
        where: {
            distributor_id: distributorId,
            recorded_at: {
                [sequelize.Sequelize.Op.gte]: startDate,
                [sequelize.Sequelize.Op.lt]: endDate
            }
        },
        order: [['recorded_at', 'ASC']]
    });
};

LocationHistory.getLastKnownLocation = async function (distributorId) {
    return await this.findOne({
        where: { distributor_id: distributorId },
        order: [['recorded_at', 'DESC']]
    });
};

export default LocationHistory; 