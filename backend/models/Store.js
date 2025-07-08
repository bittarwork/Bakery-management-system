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
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        validate: {
            isValidLatitude(value) {
                if (value !== null && value !== undefined && value !== '') {
                    const num = parseFloat(value);
                    if (isNaN(num) || num < -90 || num > 90) {
                        throw new Error('خط العرض غير صحيح');
                    }
                }
            }
        }
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        validate: {
            isValidLongitude(value) {
                if (value !== null && value !== undefined && value !== '') {
                    const num = parseFloat(value);
                    if (isNaN(num) || num < -180 || num > 180) {
                        throw new Error('خط الطول غير صحيح');
                    }
                }
            }
        }
    },
    region_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'regions',
            key: 'id'
        }
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'bank', 'mixed'),
        defaultValue: 'cash',
        validate: {
            isIn: {
                args: [['cash', 'bank', 'mixed']],
                msg: 'طريقة الدفع غير صحيحة'
            }
        }
    },
    credit_limit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            isValidCreditLimit(value) {
                if (value !== null && value !== undefined && value !== '') {
                    const num = parseFloat(value);
                    if (isNaN(num) || num < 0) {
                        throw new Error('حد الائتمان لا يمكن أن يكون سالباً');
                    }
                }
            }
        }
    },
    current_balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        comment: 'الرصيد الحالي - موجب يعني دين على المحل، سالب يعني رصيد للمحل'
    },
    gift_policy: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'قواعد الهدايا للمحل'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'stores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['region_id']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['payment_method']
        },
        {
            fields: ['latitude', 'longitude']
        },
        {
            fields: ['name']
        }
    ]
});

// Instance methods
Store.prototype.updateBalance = async function (amount, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.current_balance = parseFloat(this.current_balance) + parseFloat(amount);
    await this.save(options);

    return this.current_balance;
};

Store.prototype.getDistance = function (lat, lng) {
    if (!this.latitude || !this.longitude || !lat || !lng) {
        return null;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat - this.latitude) * Math.PI / 180;
    const dLon = (lng - this.longitude) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

Store.prototype.isWithinCreditLimit = function (additionalAmount = 0) {
    const totalDebt = parseFloat(this.current_balance) + parseFloat(additionalAmount);
    return totalDebt <= parseFloat(this.credit_limit);
};

Store.prototype.getGiftPolicy = function (productId) {
    if (!this.gift_policy || typeof this.gift_policy !== 'object') {
        return null;
    }

    // Search by product ID or product name
    for (const [key, policy] of Object.entries(this.gift_policy)) {
        if (key === productId.toString() || key === productId) {
            return policy;
        }
    }

    return null;
};

// Class methods
Store.findByRegion = async function (regionId, includeInactive = false) {
    const whereClause = { region_id: regionId };
    if (!includeInactive) {
        whereClause.is_active = true;
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
            is_active: true,
            latitude: { [sequelize.Sequelize.Op.not]: null },
            longitude: { [sequelize.Sequelize.Op.not]: null }
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

export default Store; 