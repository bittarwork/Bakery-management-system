import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DeliveryCapacity = sequelize.define('DeliveryCapacity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    capacity_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: 'unique_date_slot'
    },
    time_slot: {
        type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'all_day'),
        allowNull: false,
        unique: 'unique_date_slot'
    },
    max_deliveries: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
            min: { args: 1, msg: 'الحد الأقصى للتسليم يجب أن يكون أكبر من صفر' }
        }
    },
    current_bookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: { args: 0, msg: 'الحجوزات الحالية لا يمكن أن تكون سالبة' }
        }
    },
    available_capacity: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.max_deliveries - this.current_bookings;
        }
    },
    capacity_percentage: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.max_deliveries > 0 ? (this.current_bookings / this.max_deliveries) * 100 : 0;
        }
    },

    // Capacity configuration
    distributor_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    vehicle_capacity: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Vehicle capacity information for the time slot'
    },
    area_restrictions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Geographic or operational restrictions'
    },
    weather_factors: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Weather impact on delivery capacity'
    }
}, {
    tableName: 'delivery_capacity',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['capacity_date'] },
        { fields: ['time_slot'] },
        { fields: ['capacity_date', 'time_slot'], unique: true }
    ]
});

// Instance methods
DeliveryCapacity.prototype.isAvailable = function () {
    return this.available_capacity > 0;
};

DeliveryCapacity.prototype.getCapacityStatus = function () {
    const percentage = this.capacity_percentage;

    if (percentage >= 100) return { status: 'FULL', color: 'red', message: 'السعة مكتملة' };
    if (percentage >= 90) return { status: 'HIGH', color: 'orange', message: 'سعة عالية' };
    if (percentage >= 75) return { status: 'MEDIUM', color: 'yellow', message: 'سعة متوسطة' };
    if (percentage >= 50) return { status: 'LOW', color: 'blue', message: 'سعة منخفضة' };
    return { status: 'AVAILABLE', color: 'green', message: 'متوفر' };
};

DeliveryCapacity.prototype.incrementBooking = async function () {
    this.current_bookings += 1;
    await this.save();
    return this;
};

DeliveryCapacity.prototype.decrementBooking = async function () {
    this.current_bookings = Math.max(0, this.current_bookings - 1);
    await this.save();
    return this;
};

// Class methods
DeliveryCapacity.findOrCreateForDate = async function (date, timeSlot, maxDeliveries = 10) {
    const [capacity, created] = await this.findOrCreate({
        where: { capacity_date: date, time_slot: timeSlot },
        defaults: { max_deliveries: maxDeliveries, current_bookings: 0 }
    });

    return { capacity, created };
};

DeliveryCapacity.getCapacityForDateRange = async function (startDate, endDate) {
    return await this.findAll({
        where: {
            capacity_date: {
                [sequelize.Op.between]: [startDate, endDate]
            }
        },
        order: [['capacity_date', 'ASC'], ['time_slot', 'ASC']]
    });
};

DeliveryCapacity.getAvailableSlots = async function (date, minimumCapacity = 1) {
    const capacities = await this.findAll({
        where: {
            capacity_date: date
        }
    });

    const availableSlots = capacities
        .filter(capacity => capacity.available_capacity >= minimumCapacity)
        .map(capacity => ({
            time_slot: capacity.time_slot,
            available: capacity.available_capacity,
            percentage: capacity.capacity_percentage,
            status: capacity.getCapacityStatus()
        }));

    return availableSlots;
};

DeliveryCapacity.updateCapacityForSchedule = async function (scheduleData, action = 'increment') {
    const { capacity_date, time_slot } = scheduleData;

    const { capacity } = await this.findOrCreateForDate(capacity_date, time_slot);

    if (action === 'increment') {
        await capacity.incrementBooking();
    } else if (action === 'decrement') {
        await capacity.decrementBooking();
    }

    return capacity;
};

export default DeliveryCapacity; 