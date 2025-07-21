import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import crypto from 'crypto';

const DeliverySchedule = sequelize.define('DeliverySchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },

    // Schedule timing
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: { msg: 'تاريخ التسليم مطلوب' },
            isAfter: {
                args: new Date().toISOString().split('T')[0],
                msg: 'تاريخ التسليم يجب أن يكون في المستقبل'
            }
        }
    },
    scheduled_time_start: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            notNull: { msg: 'وقت البداية مطلوب' }
        }
    },
    scheduled_time_end: {
        type: DataTypes.TIME,
        allowNull: true
    },
    time_slot: {
        type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'custom'),
        defaultValue: 'morning'
    },
    delivery_type: {
        type: DataTypes.ENUM('standard', 'express', 'scheduled', 'pickup'),
        defaultValue: 'standard'
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal'
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'delivered', 'missed', 'cancelled', 'rescheduled'),
        defaultValue: 'scheduled'
    },

    // Delivery information
    delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    delivery_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    contact_person: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    contact_phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    contact_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: { msg: 'البريد الإلكتروني غير صحيح' }
        }
    },

    // Pricing
    delivery_fee_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: { args: 0, msg: 'رسوم التسليم لا يمكن أن تكون سالبة' }
        }
    },
    delivery_fee_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: { args: 0, msg: 'رسوم التسليم لا يمكن أن تكون سالبة' }
        }
    },
    extra_charges_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    extra_charges_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },

    // Confirmation
    confirmation_token: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
    },
    confirmation_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    confirmed_by: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    customer_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Rescheduling
    rescheduled_from: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'delivery_schedules',
            key: 'id'
        }
    },
    reschedule_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    reschedule_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    max_reschedules: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },

    // Location and routing
    gps_coordinates: {
        type: DataTypes.JSON,
        allowNull: true
    },
    delivery_location: {
        type: DataTypes.JSON,
        allowNull: true
    },
    route_optimization_data: {
        type: DataTypes.JSON,
        allowNull: true
    },

    // Performance tracking
    estimated_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    actual_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    delivery_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 5
        }
    },
    delivery_feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Audit fields
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'delivery_schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['order_id'] },
        { fields: ['distributor_id'] },
        { fields: ['scheduled_date'] },
        { fields: ['time_slot'] },
        { fields: ['status'] },
        { fields: ['delivery_type'] },
        { fields: ['priority'] },
        { fields: ['confirmation_token'], unique: true },
        { fields: ['scheduled_date', 'scheduled_time_start'] },
        { fields: ['distributor_id', 'scheduled_date'] },
        { fields: ['scheduled_date', 'status', 'delivery_type'] }
    ]
});

// Instance methods
DeliverySchedule.prototype.generateConfirmationToken = function () {
    this.confirmation_token = crypto.randomBytes(32).toString('hex');
    return this.confirmation_token;
};

DeliverySchedule.prototype.canBeRescheduled = function () {
    return this.reschedule_count < this.max_reschedules &&
        ['scheduled', 'confirmed'].includes(this.status);
};

DeliverySchedule.prototype.updateStatus = async function (newStatus, userId = null) {
    const validTransitions = {
        'scheduled': ['confirmed', 'cancelled', 'rescheduled'],
        'confirmed': ['in_progress', 'cancelled', 'rescheduled'],
        'in_progress': ['delivered', 'missed', 'cancelled'],
        'delivered': [],
        'missed': ['rescheduled'],
        'cancelled': [],
        'rescheduled': []
    };

    if (!validTransitions[this.status]?.includes(newStatus)) {
        throw new Error(`لا يمكن تغيير الحالة من ${this.status} إلى ${newStatus}`);
    }

    const oldStatus = this.status;
    this.status = newStatus;

    if (userId) {
        this.updated_by = userId;
    }

    // Update timestamps based on status
    if (newStatus === 'confirmed' && !this.confirmed_at) {
        this.confirmed_at = new Date();
    }

    await this.save();

    // Log status change if needed
    console.log(`Schedule ${this.id} status changed from ${oldStatus} to ${newStatus}`);

    return this;
};

DeliverySchedule.prototype.calculateTotalFee = function (currency = 'EUR') {
    if (currency === 'EUR') {
        return parseFloat(this.delivery_fee_eur || 0) + parseFloat(this.extra_charges_eur || 0);
    } else {
        return parseFloat(this.delivery_fee_syp || 0) + parseFloat(this.extra_charges_syp || 0);
    }
};

DeliverySchedule.prototype.getTimeSlotInfo = function () {
    const timeSlots = {
        'morning': { label: 'صباحي', icon: '🌅', time: '9:00 - 12:00' },
        'afternoon': { label: 'مسائي', icon: '☀️', time: '14:00 - 17:00' },
        'evening': { label: 'مسائي متأخر', icon: '🌇', time: '18:00 - 21:00' },
        'custom': { label: 'مخصص', icon: '⏰', time: 'حسب التحديد' }
    };

    return timeSlots[this.time_slot] || timeSlots.custom;
};

DeliverySchedule.prototype.getStatusInfo = function () {
    const statusMap = {
        'scheduled': { label: 'مجدول', color: 'blue', icon: '📅' },
        'confirmed': { label: 'مؤكد', color: 'green', icon: '✅' },
        'in_progress': { label: 'قيد التنفيذ', color: 'yellow', icon: '🚚' },
        'delivered': { label: 'تم التسليم', color: 'green', icon: '✅' },
        'missed': { label: 'فائت', color: 'red', icon: '❌' },
        'cancelled': { label: 'ملغي', color: 'red', icon: '🚫' },
        'rescheduled': { label: 'معاد جدولته', color: 'orange', icon: '🔄' }
    };

    return statusMap[this.status] || statusMap.scheduled;
};

// Class methods
DeliverySchedule.prototype.toJSON = function () {
    const values = { ...this.dataValues };

    // Add computed fields
    values.time_slot_info = this.getTimeSlotInfo();
    values.status_info = this.getStatusInfo();
    values.total_fee_eur = this.calculateTotalFee('EUR');
    values.total_fee_syp = this.calculateTotalFee('SYP');
    values.can_reschedule = this.canBeRescheduled();

    return values;
};

// Static methods
DeliverySchedule.findByDateRange = async function (startDate, endDate, options = {}) {
    const whereClause = {
        scheduled_date: {
            [sequelize.Op.between]: [startDate, endDate]
        }
    };

    if (options.status) {
        whereClause.status = options.status;
    }

    if (options.distributor_id) {
        whereClause.distributor_id = options.distributor_id;
    }

    if (options.time_slot) {
        whereClause.time_slot = options.time_slot;
    }

    return await this.findAll({
        where: whereClause,
        include: options.include || [],
        order: [['scheduled_date', 'ASC'], ['scheduled_time_start', 'ASC']]
    });
};

DeliverySchedule.findByOrder = async function (orderId) {
    return await this.findOne({
        where: { order_id: orderId },
        order: [['created_at', 'DESC']]
    });
};

DeliverySchedule.findByConfirmationToken = async function (token) {
    return await this.findOne({
        where: { confirmation_token: token }
    });
};

DeliverySchedule.findActiveSchedules = async function (distributorId = null) {
    const whereClause = {
        status: ['scheduled', 'confirmed', 'in_progress']
    };

    if (distributorId) {
        whereClause.distributor_id = distributorId;
    }

    return await this.findAll({
        where: whereClause,
        order: [['scheduled_date', 'ASC'], ['scheduled_time_start', 'ASC']]
    });
};

DeliverySchedule.getCapacityForDate = async function (date, timeSlot = null) {
    const whereClause = { scheduled_date: date };

    if (timeSlot) {
        whereClause.time_slot = timeSlot;
    }

    const schedules = await this.findAll({
        where: whereClause,
        attributes: [
            'time_slot',
            [sequelize.fn('COUNT', sequelize.col('id')), 'current_bookings']
        ],
        group: ['time_slot']
    });

    const capacityMap = {
        morning: { max: 10, current: 0 },
        afternoon: { max: 15, current: 0 },
        evening: { max: 8, current: 0 }
    };

    schedules.forEach(schedule => {
        if (capacityMap[schedule.time_slot]) {
            capacityMap[schedule.time_slot].current = schedule.get('current_bookings');
        }
    });

    // Calculate availability
    Object.keys(capacityMap).forEach(slot => {
        const capacity = capacityMap[slot];
        capacity.available = capacity.max - capacity.current;
        capacity.percentage = capacity.max > 0 ? (capacity.current / capacity.max) * 100 : 0;
    });

    return timeSlot ? capacityMap[timeSlot] : capacityMap;
};

DeliverySchedule.checkTimeSlotAvailability = async function (date, startTime, endTime, excludeId = null) {
    const whereClause = {
        scheduled_date: date,
        status: ['scheduled', 'confirmed', 'in_progress'],
        [sequelize.Op.or]: [
            {
                [sequelize.Op.and]: [
                    { scheduled_time_start: { [sequelize.Op.lte]: startTime } },
                    { scheduled_time_end: { [sequelize.Op.gt]: startTime } }
                ]
            },
            {
                [sequelize.Op.and]: [
                    { scheduled_time_start: { [sequelize.Op.lt]: endTime } },
                    { scheduled_time_end: { [sequelize.Op.gte]: endTime } }
                ]
            },
            {
                [sequelize.Op.and]: [
                    { scheduled_time_start: { [sequelize.Op.gte]: startTime } },
                    { scheduled_time_end: { [sequelize.Op.lte]: endTime } }
                ]
            }
        ]
    };

    if (excludeId) {
        whereClause.id = { [sequelize.Op.ne]: excludeId };
    }

    return await this.findAll({ where: whereClause });
};

DeliverySchedule.createBulk = async function (schedulesData, userId = null) {
    const transaction = await sequelize.transaction();

    try {
        const createdSchedules = [];

        for (const scheduleData of schedulesData) {
            const schedule = await this.create({
                ...scheduleData,
                created_by: userId
            }, { transaction });

            createdSchedules.push(schedule);
        }

        await transaction.commit();
        return createdSchedules;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export default DeliverySchedule; 