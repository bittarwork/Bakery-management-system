import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Distributor = sequelize.define('Distributor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'اسم الموزع مطلوب'
            },
            len: {
                args: [2, 255],
                msg: 'اسم الموزع يجب أن يكون بين 2 و 255 حرف'
            }
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'رقم الهاتف مطلوب'
            },
            isNumeric: {
                msg: 'رقم الهاتف يجب أن يحتوي على أرقام فقط'
            }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        validate: {
            isEmail: {
                msg: 'البريد الإلكتروني غير صحيح'
            }
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    license_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    vehicle_type: {
        type: DataTypes.ENUM('car', 'van', 'truck', 'motorcycle'),
        defaultValue: 'van',
        validate: {
            isIn: {
                args: [['car', 'van', 'truck', 'motorcycle']],
                msg: 'نوع المركبة غير صحيح'
            }
        }
    },
    vehicle_plate: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    vehicle_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'معلومات المركبة التفصيلية (JSON)'
    },
    salary_base_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'الراتب الأساسي بالأورو لا يمكن أن يكون سالباً'
            }
        }
    },
    salary_base_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'الراتب الأساسي بالليرة لا يمكن أن يكون سالباً'
            }
        }
    },
    commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'نسبة العمولة لا يمكن أن تكون سالبة'
            },
            max: {
                args: [100],
                msg: 'نسبة العمولة لا يمكن أن تتجاوز 100%'
            }
        }
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'تاريخ التوظيف مطلوب'
            },
            isDate: {
                msg: 'تاريخ التوظيف غير صحيح'
            }
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        validate: {
            isIn: {
                args: [['active', 'inactive', 'suspended']],
                msg: 'حالة الموزع غير صحيحة'
            }
        }
    },
    emergency_contact: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    photo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
            isUrl: {
                msg: 'رابط الصورة غير صحيح'
            }
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'distributors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['phone']
        },
        {
            fields: ['hire_date']
        }
    ]
});

// Instance methods
Distributor.prototype.getVehicleInfo = function () {
    const vehicleTypes = {
        car: { label: 'سيارة', icon: '🚗', capacity: 'صغيرة' },
        van: { label: 'فان', icon: '🚐', capacity: 'متوسطة' },
        truck: { label: 'شاحنة', icon: '🚛', capacity: 'كبيرة' },
        motorcycle: { label: 'دراجة نارية', icon: '🏍️', capacity: 'محدودة جداً' }
    };

    return vehicleTypes[this.vehicle_type] || { label: this.vehicle_type, icon: '🚐', capacity: 'غير محدد' };
};

Distributor.prototype.getStatusInfo = function () {
    const statusMap = {
        active: { label: 'نشط', color: 'green', icon: '✅' },
        inactive: { label: 'غير نشط', color: 'gray', icon: '⏸️' },
        suspended: { label: 'معلق', color: 'red', icon: '🚫' }
    };

    return statusMap[this.status] || { label: this.status, color: 'gray', icon: '❓' };
};

Distributor.prototype.calculateWorkingYears = function () {
    const today = new Date();
    const hireDate = new Date(this.hire_date);
    const diffTime = Math.abs(today - hireDate);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
};

Distributor.prototype.updateStatus = async function (newStatus, transaction = null) {
    if (!['active', 'inactive', 'suspended'].includes(newStatus)) {
        throw new Error('حالة الموزع غير صحيحة');
    }

    const options = transaction ? { transaction } : {};
    this.status = newStatus;
    await this.save(options);

    return this;
};

// Class methods
Distributor.getActiveDistributors = async function () {
    return await this.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']]
    });
};

Distributor.getDistributorStatistics = async function (distributorId, period = 'month') {
    const { Op } = require('sequelize');

    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
            dateFilter = {
                created_at: {
                    [Op.gte]: todayStart,
                    [Op.lt]: todayEnd
                }
            };
            break;
        case 'week':
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = {
                created_at: {
                    [Op.gte]: weekStart,
                    [Op.lt]: now
                }
            };
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            dateFilter = {
                created_at: {
                    [Op.gte]: monthStart,
                    [Op.lt]: monthEnd
                }
            };
            break;
        case 'year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
            dateFilter = {
                created_at: {
                    [Op.gte]: yearStart,
                    [Op.lt]: yearEnd
                }
            };
            break;
    }

    const whereClause = { distributor_id: distributorId, ...dateFilter };

    // هذه الإحصائيات ستحتاج للتطوير عندما ننشئ جداول الرحلات والزيارات
    return {
        total_trips: 0,
        completed_trips: 0,
        total_visits: 0,
        successful_visits: 0,
        total_amount_collected: 0,
        collection_rate: 0,
        average_visit_time: 0
    };
};

Distributor.searchDistributors = async function (searchTerm, filters = {}) {
    const { Op } = require('sequelize');

    let whereClause = {};

    // Search in name and phone
    if (searchTerm) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } }
        ];
    }

    // Apply filters
    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.vehicle_type) {
        whereClause.vehicle_type = filters.vehicle_type;
    }

    if (filters.hire_date_from || filters.hire_date_to) {
        whereClause.hire_date = {};
        if (filters.hire_date_from) whereClause.hire_date[Op.gte] = filters.hire_date_from;
        if (filters.hire_date_to) whereClause.hire_date[Op.lte] = filters.hire_date_to;
    }

    return await this.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

export default Distributor; 