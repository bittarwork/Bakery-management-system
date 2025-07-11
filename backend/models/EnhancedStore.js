import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnhancedStore = sequelize.define('EnhancedStore', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [2, 100]
        }
    },

    owner_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [2, 100]
        }
    },

    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            is: /^[+]?[0-9\s\-\(\)]+$/
        }
    },

    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },

    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    gps_coordinates: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'GPS coordinates {latitude, longitude}'
    },

    store_type: {
        type: DataTypes.ENUM('retail', 'wholesale', 'restaurant', 'cafe', 'hotel', 'other'),
        defaultValue: 'retail'
    },

    category: {
        type: DataTypes.ENUM('grocery', 'supermarket', 'restaurant', 'cafe', 'hotel', 'bakery', 'other'),
        defaultValue: 'grocery'
    },

    size_category: {
        type: DataTypes.ENUM('small', 'medium', 'large', 'enterprise'),
        defaultValue: 'medium'
    },

    opening_hours: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Opening hours for each day of the week'
    },

    // Financial Information
    credit_limit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    current_balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },

    total_purchases_eur: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00
    },

    total_purchases_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },

    total_payments_eur: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00
    },

    total_payments_syp: {
        type: DataTypes.DECIMAL(15, 2),
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
        type: DataTypes.ENUM('cash', 'credit_7_days', 'credit_15_days', 'credit_30_days', 'custom'),
        defaultValue: 'cash'
    },

    // Performance Metrics
    total_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    completed_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    cancelled_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    average_order_value_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },

    average_order_value_syp: {
        type: DataTypes.DECIMAL(12, 2),
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

    // Status and Preferences
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_approval'),
        defaultValue: 'active'
    },

    preferred_delivery_time: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    special_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Relationship Information
    assigned_distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    assigned_distributor_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    store_owner_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Link to enhanced_users table for store owner access'
    },

    // Audit Information
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    created_by_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    last_updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    last_updated_by_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    // Additional Information
    tax_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    business_license: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'enhanced_stores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    hooks: {
        beforeUpdate: (store) => {
            // Update performance rating based on order completion rate
            if (store.total_orders > 0) {
                const completionRate = (store.completed_orders / store.total_orders) * 100;
                const paymentRate = store.total_purchases_eur > 0 ?
                    (store.total_payments_eur / store.total_purchases_eur) * 100 : 0;

                // Calculate performance rating (0-5)
                const avgRate = (completionRate + paymentRate) / 2;
                if (avgRate >= 95) store.performance_rating = 5.0;
                else if (avgRate >= 85) store.performance_rating = 4.0;
                else if (avgRate >= 75) store.performance_rating = 3.0;
                else if (avgRate >= 65) store.performance_rating = 2.0;
                else store.performance_rating = 1.0;
            }

            // Update average order values
            if (store.completed_orders > 0) {
                store.average_order_value_eur = store.total_purchases_eur / store.completed_orders;
                store.average_order_value_syp = store.total_purchases_syp / store.completed_orders;
            }
        }
    }
});

// Instance methods
EnhancedStore.prototype.updateBalance = function (amount, currency = 'EUR', isPayment = false) {
    const eurAmount = currency === 'EUR' ? amount : amount / 15000;
    const sypAmount = currency === 'SYP' ? amount : amount * 15000;

    if (isPayment) {
        this.current_balance -= eurAmount;
        this.total_payments_eur = parseFloat(this.total_payments_eur) + eurAmount;
        this.total_payments_syp = parseFloat(this.total_payments_syp) + sypAmount;
        this.last_payment_date = new Date();
    } else {
        this.current_balance += eurAmount;
        this.total_purchases_eur = parseFloat(this.total_purchases_eur) + eurAmount;
        this.total_purchases_syp = parseFloat(this.total_purchases_syp) + sypAmount;
        this.last_order_date = new Date();
    }

    return this.save();
};

EnhancedStore.prototype.addOrder = function (orderValue, currency = 'EUR', completed = true) {
    this.total_orders += 1;

    if (completed) {
        this.completed_orders += 1;
        this.updateBalance(orderValue, currency, false);
    }

    return this.save();
};

EnhancedStore.prototype.cancelOrder = function () {
    this.cancelled_orders += 1;
    return this.save();
};

EnhancedStore.prototype.makePayment = function (amount, currency = 'EUR') {
    return this.updateBalance(amount, currency, true);
};

EnhancedStore.prototype.isWithinCreditLimit = function (newOrderValue, currency = 'EUR') {
    const eurValue = currency === 'EUR' ? newOrderValue : newOrderValue / 15000;
    return (this.current_balance + eurValue) <= this.credit_limit;
};

EnhancedStore.prototype.getFinancialSummary = function () {
    const totalPurchasesEur = parseFloat(this.total_purchases_eur) + (parseFloat(this.total_purchases_syp) / 15000);
    const totalPaymentsEur = parseFloat(this.total_payments_eur) + (parseFloat(this.total_payments_syp) / 15000);
    const paymentRate = totalPurchasesEur > 0 ? (totalPaymentsEur / totalPurchasesEur) * 100 : 0;

    return {
        current_balance: parseFloat(this.current_balance),
        credit_limit: parseFloat(this.credit_limit),
        credit_used: parseFloat(this.current_balance),
        credit_available: parseFloat(this.credit_limit) - parseFloat(this.current_balance),
        total_purchases_eur: Math.round(totalPurchasesEur * 100) / 100,
        total_payments_eur: Math.round(totalPaymentsEur * 100) / 100,
        payment_rate: Math.round(paymentRate * 100) / 100,
        average_order_value_eur: parseFloat(this.average_order_value_eur),
        performance_rating: parseFloat(this.performance_rating)
    };
};

EnhancedStore.prototype.getPerformanceStats = function () {
    const completionRate = this.total_orders > 0 ? (this.completed_orders / this.total_orders) * 100 : 0;
    const cancellationRate = this.total_orders > 0 ? (this.cancelled_orders / this.total_orders) * 100 : 0;

    return {
        total_orders: this.total_orders,
        completed_orders: this.completed_orders,
        cancelled_orders: this.cancelled_orders,
        completion_rate: Math.round(completionRate * 100) / 100,
        cancellation_rate: Math.round(cancellationRate * 100) / 100,
        performance_rating: parseFloat(this.performance_rating),
        last_order_date: this.last_order_date,
        last_payment_date: this.last_payment_date
    };
};

EnhancedStore.prototype.updateLocation = function (latitude, longitude) {
    this.gps_coordinates = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updated_at: new Date()
    };
    return this.save();
};

EnhancedStore.prototype.assignDistributor = function (distributorId, distributorName) {
    this.assigned_distributor_id = distributorId;
    this.assigned_distributor_name = distributorName;
    return this.save();
};

// Static methods
EnhancedStore.getByStatus = async function (status) {
    return await this.findAll({
        where: { status },
        order: [['name', 'ASC']]
    });
};

EnhancedStore.getByDistributor = async function (distributorId) {
    return await this.findAll({
        where: { assigned_distributor_id: distributorId },
        order: [['name', 'ASC']]
    });
};

EnhancedStore.getByCategory = async function (category) {
    return await this.findAll({
        where: { category },
        order: [['name', 'ASC']]
    });
};

EnhancedStore.searchStores = async function (query, filters = {}) {
    const whereCondition = {
        [sequelize.Sequelize.Op.or]: [
            { name: { [sequelize.Sequelize.Op.like]: `%${query}%` } },
            { owner_name: { [sequelize.Sequelize.Op.like]: `%${query}%` } },
            { phone: { [sequelize.Sequelize.Op.like]: `%${query}%` } },
            { address: { [sequelize.Sequelize.Op.like]: `%${query}%` } }
        ]
    };

    if (filters.status) whereCondition.status = filters.status;
    if (filters.category) whereCondition.category = filters.category;
    if (filters.store_type) whereCondition.store_type = filters.store_type;
    if (filters.assigned_distributor_id) whereCondition.assigned_distributor_id = filters.assigned_distributor_id;

    return await this.findAll({
        where: whereCondition,
        order: [['name', 'ASC']],
        limit: 50
    });
};

EnhancedStore.getTopPerformers = async function (limit = 10) {
    return await this.findAll({
        where: { status: 'active' },
        order: [['performance_rating', 'DESC'], ['total_purchases_eur', 'DESC']],
        limit
    });
};

EnhancedStore.getStatistics = async function (filters = {}) {
    let where = {};

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.assigned_distributor_id) where.assigned_distributor_id = filters.assigned_distributor_id;

    const stores = await this.findAll({ where });

    const stats = {
        total_stores: stores.length,
        active_stores: stores.filter(s => s.status === 'active').length,
        inactive_stores: stores.filter(s => s.status === 'inactive').length,
        suspended_stores: stores.filter(s => s.status === 'suspended').length,
        total_orders: stores.reduce((sum, s) => sum + s.total_orders, 0),
        completed_orders: stores.reduce((sum, s) => sum + s.completed_orders, 0),
        cancelled_orders: stores.reduce((sum, s) => sum + s.cancelled_orders, 0),
        total_purchases_eur: stores.reduce((sum, s) => sum + parseFloat(s.total_purchases_eur), 0),
        total_payments_eur: stores.reduce((sum, s) => sum + parseFloat(s.total_payments_eur), 0),
        total_balance: stores.reduce((sum, s) => sum + parseFloat(s.current_balance), 0),
        avg_performance_rating: stores.length > 0 ? stores.reduce((sum, s) => sum + parseFloat(s.performance_rating), 0) / stores.length : 0
    };

    return stats;
};

EnhancedStore.getNearbyStores = async function (latitude, longitude, radiusKm = 10) {
    // This is a simplified version - in production, you'd use proper geospatial queries
    const stores = await this.findAll({
        where: {
            status: 'active',
            gps_coordinates: {
                [sequelize.Sequelize.Op.ne]: null
            }
        }
    });

    return stores.filter(store => {
        if (!store.gps_coordinates) return false;

        const coords = store.gps_coordinates;
        const distance = calculateDistance(latitude, longitude, coords.latitude, coords.longitude);
        return distance <= radiusKm;
    }).sort((a, b) => {
        const distA = calculateDistance(latitude, longitude, a.gps_coordinates.latitude, a.gps_coordinates.longitude);
        const distB = calculateDistance(latitude, longitude, b.gps_coordinates.latitude, b.gps_coordinates.longitude);
        return distA - distB;
    });
};

// Helper function for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default EnhancedStore; 