import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TempDeliverySchedule = sequelize.define('TempDeliverySchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_number: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    store_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    scheduled_time_start: {
        type: DataTypes.TIME,
        allowNull: false
    },
    scheduled_time_end: {
        type: DataTypes.TIME,
        allowNull: true
    },
    time_slot: {
        type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'custom'),
        allowNull: true
    },
    delivery_type: {
        type: DataTypes.ENUM('standard', 'express', 'scheduled', 'pickup'),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'delivered', 'missed', 'rescheduled', 'cancelled'),
        allowNull: true
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: true
    },
    delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    contact_person: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    special_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'delivery_schedules',
    timestamps: false, // The current table might not have created_at/updated_at
});

export default TempDeliverySchedule; 