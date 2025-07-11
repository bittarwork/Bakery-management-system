import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnhancedUser = sequelize.define('EnhancedUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            len: [3, 50],
            isAlphanumeric: true
        }
    },

    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },

    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [8, 255]
        }
    },

    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [2, 100]
        }
    },

    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: /^[+]?[0-9\s\-\(\)]+$/
        }
    },

    role: {
        type: DataTypes.ENUM('admin', 'manager', 'distributor', 'store_owner', 'accountant'),
        defaultValue: 'distributor'
    },

    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
        defaultValue: 'active'
    },

    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },

    login_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    locked_until: {
        type: DataTypes.DATE,
        allowNull: true
    },

    profile_image: {
        type: DataTypes.STRING(500),
        allowNull: true
    },

    // Distributor specific fields
    salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },

    commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        }
    },

    vehicle_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Vehicle information for distributors'
    },

    assigned_areas: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Assigned distribution areas'
    },

    // Store owner specific fields
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Associated store ID for store owners'
    },

    // Performance metrics
    total_trips: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    completed_trips: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    total_sales_eur: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00
    },

    total_sales_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },

    performance_rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 5
        }
    },

    // Security fields
    two_factor_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    password_reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    password_reset_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },

    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    email_verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    created_by_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'enhanced_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    hooks: {
        beforeCreate: async (user) => {
            // Generate username if not provided
            if (!user.username && user.email) {
                const emailPrefix = user.email.split('@')[0];
                const timestamp = Date.now().toString().slice(-4);
                user.username = `${emailPrefix}${timestamp}`;
            }
        },

        beforeUpdate: (user) => {
            // Update performance rating based on completed trips
            if (user.total_trips > 0) {
                const completionRate = (user.completed_trips / user.total_trips) * 100;
                if (completionRate >= 95) user.performance_rating = 5.0;
                else if (completionRate >= 85) user.performance_rating = 4.0;
                else if (completionRate >= 75) user.performance_rating = 3.0;
                else if (completionRate >= 65) user.performance_rating = 2.0;
                else user.performance_rating = 1.0;
            }
        }
    }
});

// Instance methods
EnhancedUser.prototype.updateLoginAttempts = function (success = false) {
    if (success) {
        this.login_attempts = 0;
        this.locked_until = null;
        this.last_login = new Date();
    } else {
        this.login_attempts += 1;
        if (this.login_attempts >= 5) {
            this.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
    }
    return this.save();
};

EnhancedUser.prototype.isLocked = function () {
    return this.locked_until && this.locked_until > new Date();
};

EnhancedUser.prototype.updatePerformance = function (tripCompleted = false, salesAmount = 0, currency = 'EUR') {
    if (tripCompleted) {
        this.total_trips += 1;
        this.completed_trips += 1;
    }

    if (salesAmount > 0) {
        if (currency === 'EUR') {
            this.total_sales_eur = parseFloat(this.total_sales_eur) + parseFloat(salesAmount);
        } else if (currency === 'SYP') {
            this.total_sales_syp = parseFloat(this.total_sales_syp) + parseFloat(salesAmount);
        }
    }

    // Update performance rating
    if (this.total_trips > 0) {
        const completionRate = (this.completed_trips / this.total_trips) * 100;
        if (completionRate >= 95) this.performance_rating = 5.0;
        else if (completionRate >= 85) this.performance_rating = 4.0;
        else if (completionRate >= 75) this.performance_rating = 3.0;
        else if (completionRate >= 65) this.performance_rating = 2.0;
        else this.performance_rating = 1.0;
    }

    return this.save();
};

EnhancedUser.prototype.getPerformanceStats = function () {
    const completionRate = this.total_trips > 0 ? (this.completed_trips / this.total_trips) * 100 : 0;
    const totalSalesEur = parseFloat(this.total_sales_eur) + (parseFloat(this.total_sales_syp) / 15000);

    return {
        total_trips: this.total_trips,
        completed_trips: this.completed_trips,
        completion_rate: Math.round(completionRate * 100) / 100,
        total_sales_eur: Math.round(totalSalesEur * 100) / 100,
        total_sales_syp: parseFloat(this.total_sales_syp),
        performance_rating: parseFloat(this.performance_rating),
        avg_sales_per_trip: this.completed_trips > 0 ? Math.round((totalSalesEur / this.completed_trips) * 100) / 100 : 0
    };
};

EnhancedUser.prototype.canAccessStore = function (storeId) {
    if (this.role === 'admin' || this.role === 'manager') return true;
    if (this.role === 'store_owner' && this.store_id === storeId) return true;
    if (this.role === 'distributor') {
        // Check if store is in assigned areas
        const assignedAreas = this.assigned_areas || [];
        return assignedAreas.some(area => area.stores && area.stores.includes(storeId));
    }
    return false;
};

// Static methods
EnhancedUser.getByRole = async function (role) {
    return await this.findAll({
        where: { role },
        attributes: { exclude: ['password', 'password_reset_token', 'email_verification_token'] }
    });
};

EnhancedUser.getDistributors = async function () {
    return await this.findAll({
        where: { role: 'distributor', status: 'active' },
        attributes: { exclude: ['password', 'password_reset_token', 'email_verification_token'] }
    });
};

EnhancedUser.getStoreOwners = async function () {
    return await this.findAll({
        where: { role: 'store_owner', status: 'active' },
        attributes: { exclude: ['password', 'password_reset_token', 'email_verification_token'] }
    });
};

EnhancedUser.getPerformanceLeaderboard = async function (role = 'distributor', limit = 10) {
    return await this.findAll({
        where: { role, status: 'active' },
        order: [['performance_rating', 'DESC'], ['total_sales_eur', 'DESC']],
        limit,
        attributes: { exclude: ['password', 'password_reset_token', 'email_verification_token'] }
    });
};

EnhancedUser.searchUsers = async function (query, role = null) {
    const { Op } = sequelize.Sequelize;
    const whereCondition = {
        [Op.or]: [
            { full_name: { [Op.like]: `%${query}%` } },
            { username: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } }
        ]
    };

    if (role) {
        whereCondition.role = role;
    }

    return await this.findAll({
        where: whereCondition,
        attributes: { exclude: ['password', 'password_reset_token', 'email_verification_token'] },
        limit: 20
    });
};

export default EnhancedUser; 