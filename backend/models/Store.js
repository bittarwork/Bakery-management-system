import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'اسم المحل مطلوب'
            },
            len: {
                args: [2, 100],
                msg: 'اسم المحل يجب أن يكون بين 2 و 100 حرف'
            }
        }
    },
    owner_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: {
                args: [0, 100],
                msg: 'اسم المالك لا يجب أن يتجاوز 100 حرف'
            }
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            isPhoneOrEmpty(value) {
                if (value && value.trim() !== '' && !/^\+?[0-9\s\-\(\)]{7,20}$/.test(value)) {
                    throw new Error('رقم الهاتف غير صحيح');
                }
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmailOrEmpty(value) {
                if (value && value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    throw new Error('البريد الإلكتروني غير صحيح');
                }
            }
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    gps_coordinates: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'إحداثيات GPS للمحل'
    },
    store_type: {
        type: DataTypes.ENUM('retail', 'wholesale', 'restaurant'),
        defaultValue: 'retail',
        validate: {
            isIn: {
                args: [['retail', 'wholesale', 'restaurant']],
                msg: 'نوع المحل غير صحيح'
            }
        }
    },
    category: {
        type: DataTypes.ENUM('supermarket', 'grocery', 'cafe', 'restaurant', 'bakery', 'hotel', 'other'),
        defaultValue: 'grocery',
        validate: {
            isIn: {
                args: [['supermarket', 'grocery', 'cafe', 'restaurant', 'bakery', 'hotel', 'other']],
                msg: 'فئة المحل غير صحيحة'
            }
        }
    },
    size_category: {
        type: DataTypes.ENUM('small', 'medium', 'large', 'enterprise'),
        defaultValue: 'small',
        validate: {
            isIn: {
                args: [['small', 'medium', 'large', 'enterprise']],
                msg: 'حجم المحل غير صحيح'
            }
        }
    },
    opening_hours: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'ساعات العمل اليومية'
    },
    credit_limit_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    credit_limit_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    current_balance_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        comment: 'الرصيد الحالي باليورو'
    },
    current_balance_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00,
        comment: 'الرصيد الحالي بالليرة السورية'
    },
    total_purchases_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    total_purchases_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00
    },
    total_payments_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    total_payments_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00
    },
    commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        }
    },
    payment_terms: {
        type: DataTypes.ENUM('cash', 'credit_7_days', 'credit_15_days', 'credit_30_days'),
        defaultValue: 'cash',
        validate: {
            isIn: {
                args: [['cash', 'credit_7_days', 'credit_15_days', 'credit_30_days']],
                msg: 'شروط الدفع غير صحيحة'
            }
        }
    },
    total_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completed_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    average_order_value_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    average_order_value_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    last_order_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    performance_rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 5
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        validate: {
            isIn: {
                args: [['active', 'inactive', 'suspended']],
                msg: 'حالة المحل غير صحيحة'
            }
        }
    },
    preferred_delivery_time: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    special_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    assigned_distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'distributors',
            key: 'id'
        }
    },
    assigned_distributor_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    created_by_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'stores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['assigned_distributor_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['store_type']
        },
        {
            fields: ['category']
        },
        {
            fields: ['name']
        },
        {
            fields: ['payment_terms']
        }
    ]
});

// Instance methods
Store.prototype.updateBalanceEur = async function (amount, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.current_balance_eur = parseFloat(this.current_balance_eur) + parseFloat(amount);
    await this.save(options);
    return this.current_balance_eur;
};

Store.prototype.updateBalanceSyp = async function (amount, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.current_balance_syp = parseFloat(this.current_balance_syp) + parseFloat(amount);
    await this.save(options);
    return this.current_balance_syp;
};

Store.prototype.getDistance = function (lat, lng) {
    if (!this.gps_coordinates || !this.gps_coordinates.latitude || !this.gps_coordinates.longitude || !lat || !lng) {
        return null;
    }

    const storeLat = this.gps_coordinates.latitude;
    const storeLng = this.gps_coordinates.longitude;

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat - storeLat) * Math.PI / 180;
    const dLon = (lng - storeLng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(storeLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

Store.prototype.isWithinCreditLimitEur = function (additionalAmount = 0) {
    const totalDebt = parseFloat(this.current_balance_eur) + parseFloat(additionalAmount);
    return totalDebt <= parseFloat(this.credit_limit_eur);
};

Store.prototype.isWithinCreditLimitSyp = function (additionalAmount = 0) {
    const totalDebt = parseFloat(this.current_balance_syp) + parseFloat(additionalAmount);
    return totalDebt <= parseFloat(this.credit_limit_syp);
};

Store.prototype.updateStatistics = async function (orderData, transaction = null) {
    const options = transaction ? { transaction } : {};

    // Update totals
    this.total_orders += 1;
    if (orderData.status === 'completed') {
        this.completed_orders += 1;
    }

    if (orderData.amount_eur) {
        this.total_purchases_eur = parseFloat(this.total_purchases_eur) + parseFloat(orderData.amount_eur);
    }

    if (orderData.amount_syp) {
        this.total_purchases_syp = parseFloat(this.total_purchases_syp) + parseFloat(orderData.amount_syp);
    }

    // Update average order value
    if (this.completed_orders > 0) {
        this.average_order_value_eur = this.total_purchases_eur / this.completed_orders;
        this.average_order_value_syp = this.total_purchases_syp / this.completed_orders;
    }

    this.last_order_date = new Date();

    await this.save(options);
    return this;
};

Store.prototype.isOpenNow = function () {
    if (!this.opening_hours || typeof this.opening_hours !== 'object') {
        return true; // Default to open if no hours specified
    }

    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];

    const todayHours = this.opening_hours[currentDay];
    if (!todayHours || todayHours === 'closed') {
        return false;
    }

    const currentTime = now.getHours() * 100 + now.getMinutes();
    const [openTime, closeTime] = todayHours.split('-');
    const openMinutes = parseInt(openTime.split(':')[0]) * 100 + parseInt(openTime.split(':')[1]);
    const closeMinutes = parseInt(closeTime.split(':')[0]) * 100 + parseInt(closeTime.split(':')[1]);

    return currentTime >= openMinutes && currentTime <= closeMinutes;
};

// Class methods
Store.findByDistributor = async function (distributorId, includeInactive = false) {
    const whereClause = { assigned_distributor_id: distributorId };
    if (!includeInactive) {
        whereClause.status = 'active';
    }

    return await Store.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

Store.findByCategory = async function (category, includeInactive = false) {
    const whereClause = { category: category };
    if (!includeInactive) {
        whereClause.status = 'active';
    }

    return await Store.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

Store.findNearby = async function (lat, lng, radiusKm = 10, limit = 50) {
    // This is a simplified version - in production, you'd use PostGIS or similar
    const stores = await Store.findAll({
        where: {
            status: 'active',
            gps_coordinates: { [sequelize.Sequelize.Op.not]: null }
        },
        limit
    });

    return stores
        .map(store => ({
            ...store.toJSON(),
            distance: store.getDistance(lat, lng)
        }))
        .filter(store => store.distance !== null && store.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
};

Store.getStoreStatistics = async function (storeId = null, period = 'month') {
    const { Op } = require('sequelize');

    let whereClause = {};
    if (storeId) {
        whereClause.id = storeId;
    }

    // Add date filter
    const now = new Date();
    let dateFilter = {};
    if (period === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = {
            last_order_date: { [Op.gte]: monthStart }
        };
    }

    whereClause = { ...whereClause, ...dateFilter };

    const stats = await Store.findAll({
        where: whereClause,
        attributes: [
            'category',
            [sequelize.fn('COUNT', sequelize.col('id')), 'store_count'],
            [sequelize.fn('AVG', sequelize.col('performance_rating')), 'avg_performance'],
            [sequelize.fn('SUM', sequelize.col('total_purchases_eur')), 'total_sales_eur'],
            [sequelize.fn('SUM', sequelize.col('total_purchases_syp')), 'total_sales_syp'],
            [sequelize.fn('SUM', sequelize.col('total_orders')), 'total_orders'],
            [sequelize.fn('SUM', sequelize.col('completed_orders')), 'completed_orders']
        ],
        group: ['category'],
        raw: true
    });

    return stats;
};

Store.getActiveStores = async function (limit = null) {
    const options = {
        where: { status: 'active' },
        order: [['name', 'ASC']]
    };

    if (limit) {
        options.limit = limit;
    }

    return await Store.findAll(options);
};

Store.getTopPerformingStores = async function (limit = 10) {
    return await Store.findAll({
        where: { status: 'active' },
        order: [['performance_rating', 'DESC']],
        limit: limit
    });
};

Store.searchStores = async function (searchTerm, filters = {}) {
    const { Op } = require('sequelize');

    let whereClause = {};

    // Search in name, owner_name, and phone
    if (searchTerm) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { owner_name: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } }
        ];
    }

    // Apply filters
    if (filters.category) {
        whereClause.category = filters.category;
    }

    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.store_type) {
        whereClause.store_type = filters.store_type;
    }

    if (filters.assigned_distributor_id) {
        whereClause.assigned_distributor_id = filters.assigned_distributor_id;
    }

    return await Store.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

export default Store; 