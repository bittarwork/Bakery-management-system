import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Vehicle = sequelize.define('Vehicle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // Basic vehicle information
    vehicle_type: {
        type: DataTypes.ENUM('car', 'van', 'truck', 'motorcycle'),
        allowNull: false,
        defaultValue: 'van',
        validate: {
            notNull: {
                msg: 'نوع المركبة مطلوب'
            },
            isIn: {
                args: [['car', 'van', 'truck', 'motorcycle']],
                msg: 'نوع المركبة غير صحيح'
            }
        }
    },

    vehicle_model: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'موديل المركبة مطلوب'
            },
            len: {
                args: [2, 100],
                msg: 'موديل المركبة يجب أن يكون بين 2 و 100 حرف'
            }
        }
    },

    vehicle_plate: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'رقم اللوحة مطلوب'
            },
            len: {
                args: [3, 20],
                msg: 'رقم اللوحة يجب أن يكون بين 3 و 20 حرف'
            }
        }
    },

    vehicle_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'سنة المركبة مطلوبة'
            },
            min: {
                args: [1990],
                msg: 'سنة المركبة يجب أن تكون 1990 أو أحدث'
            },
            max: {
                args: [new Date().getFullYear() + 1],
                msg: 'سنة المركبة لا يمكن أن تكون في المستقبل'
            }
        }
    },

    vehicle_color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    // Status and assignment
    status: {
        type: DataTypes.ENUM('active', 'maintenance', 'inactive', 'retired'),
        defaultValue: 'active',
        validate: {
            isIn: {
                args: [['active', 'maintenance', 'inactive', 'retired']],
                msg: 'حالة المركبة غير صحيحة'
            }
        }
    },

    assigned_distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },

    // Insurance and registration info
    insurance_company: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    insurance_expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'تاريخ انتهاء التأمين غير صحيح'
            }
        }
    },

    registration_expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'تاريخ انتهاء الترخيص غير صحيح'
            }
        }
    },

    // Technical specifications
    fuel_type: {
        type: DataTypes.ENUM('gasoline', 'diesel', 'electric', 'hybrid'),
        defaultValue: 'gasoline',
        validate: {
            isIn: {
                args: [['gasoline', 'diesel', 'electric', 'hybrid']],
                msg: 'نوع الوقود غير صحيح'
            }
        }
    },

    engine_capacity: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    transmission_type: {
        type: DataTypes.ENUM('manual', 'automatic'),
        defaultValue: 'manual',
        validate: {
            isIn: {
                args: [['manual', 'automatic']],
                msg: 'نوع ناقل الحركة غير صحيح'
            }
        }
    },

    // Maintenance info
    last_maintenance_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'تاريخ آخر صيانة غير صحيح'
            }
        }
    },

    last_maintenance_km: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'كيلومترات آخر صيانة لا يمكن أن تكون سالبة'
            }
        }
    },

    next_maintenance_km: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: {
                args: [0],
                msg: 'كيلومترات الصيانة القادمة لا يمكن أن تكون سالبة'
            }
        }
    },

    current_km: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'العداد الحالي لا يمكن أن يكون سالب'
            }
        }
    },

    // Financial info
    purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'تاريخ الشراء غير صحيح'
            }
        }
    },

    purchase_price_eur: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'سعر الشراء باليورو لا يمكن أن يكون سالب'
            }
        }
    },

    purchase_price_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'سعر الشراء بالليرة السورية لا يمكن أن يكون سالب'
            }
        }
    },

    // Additional info
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    is_company_owned: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    // Audit fields
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    created_by_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'vehicles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['vehicle_type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['assigned_distributor_id']
        },
        {
            fields: ['vehicle_plate'],
            unique: true
        },
        {
            fields: ['insurance_expiry_date']
        },
        {
            fields: ['registration_expiry_date']
        }
    ]
});

// Instance methods
Vehicle.prototype.getVehicleTypeInfo = function() {
    const vehicleTypes = {
        car: { 
            label: 'سيارة', 
            icon: '🚗', 
            capacity: 'صغيرة',
            description: 'مناسبة للتوزيع السريع والمساحات الضيقة'
        },
        van: { 
            label: 'فان', 
            icon: '🚐', 
            capacity: 'متوسطة',
            description: 'الخيار الأمثل لتوزيع المخبوزات'
        },
        truck: { 
            label: 'شاحنة', 
            icon: '🚛', 
            capacity: 'كبيرة',
            description: 'للطلبات الكبيرة والمسافات الطويلة'
        },
        motorcycle: { 
            label: 'دراجة نارية', 
            icon: '🏍️', 
            capacity: 'محدودة جداً',
            description: 'للتوصيل السريع والطرق الضيقة'
        }
    };

    return vehicleTypes[this.vehicle_type] || { 
        label: this.vehicle_type, 
        icon: '🚐', 
        capacity: 'غير محدد',
        description: 'نوع مركبة غير معروف'
    };
};

Vehicle.prototype.getStatusInfo = function() {
    const statusMap = {
        active: { 
            label: 'نشطة', 
            color: 'green', 
            icon: '✅',
            description: 'جاهزة للعمل'
        },
        maintenance: { 
            label: 'صيانة', 
            color: 'yellow', 
            icon: '🔧',
            description: 'تحت الصيانة'
        },
        inactive: { 
            label: 'غير نشطة', 
            color: 'gray', 
            icon: '⏸️',
            description: 'متوقفة مؤقتاً'
        },
        retired: { 
            label: 'متقاعدة', 
            color: 'red', 
            icon: '🚫',
            description: 'خارج الخدمة نهائياً'
        }
    };

    return statusMap[this.status] || { 
        label: this.status, 
        color: 'gray', 
        icon: '❓',
        description: 'حالة غير معروفة'
    };
};

Vehicle.prototype.getFuelTypeInfo = function() {
    const fuelTypes = {
        gasoline: { 
            label: 'بنزين', 
            icon: '⛽', 
            color: 'blue',
            avgConsumption: '8-12 لتر/100كم'
        },
        diesel: { 
            label: 'ديزل', 
            icon: '🛢️', 
            color: 'orange',
            avgConsumption: '6-9 لتر/100كم'
        },
        electric: { 
            label: 'كهربائي', 
            icon: '🔋', 
            color: 'green',
            avgConsumption: '15-25 كيلوواط/100كم'
        },
        hybrid: { 
            label: 'هجين', 
            icon: '⚡', 
            color: 'purple',
            avgConsumption: '4-7 لتر/100كم'
        }
    };

    return fuelTypes[this.fuel_type] || { 
        label: this.fuel_type, 
        icon: '⛽', 
        color: 'gray',
        avgConsumption: 'غير محدد'
    };
};

Vehicle.prototype.isMaintenanceDue = function() {
    if (!this.next_maintenance_km || !this.current_km) {
        return false;
    }
    return this.current_km >= this.next_maintenance_km;
};

Vehicle.prototype.isInsuranceExpiring = function(daysAhead = 30) {
    if (!this.insurance_expiry_date) {
        return false;
    }
    
    const today = new Date();
    const expiryDate = new Date(this.insurance_expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= daysAhead && daysUntilExpiry > 0;
};

Vehicle.prototype.isRegistrationExpiring = function(daysAhead = 30) {
    if (!this.registration_expiry_date) {
        return false;
    }
    
    const today = new Date();
    const expiryDate = new Date(this.registration_expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= daysAhead && daysUntilExpiry > 0;
};

Vehicle.prototype.getAge = function() {
    const currentYear = new Date().getFullYear();
    return currentYear - this.vehicle_year;
};

Vehicle.prototype.canBeAssigned = function() {
    return this.status === 'active' && !this.assigned_distributor_id;
};

// Static methods
Vehicle.getAvailableVehicles = async function() {
    return await Vehicle.findAll({
        where: {
            status: 'active',
            assigned_distributor_id: null
        },
        order: [['vehicle_type', 'ASC'], ['vehicle_model', 'ASC']]
    });
};

Vehicle.getVehiclesByDistributor = async function(distributorId) {
    return await Vehicle.findAll({
        where: {
            assigned_distributor_id: distributorId
        },
        order: [['created_at', 'DESC']]
    });
};

Vehicle.getMaintenanceDueVehicles = async function() {
    const vehicles = await Vehicle.findAll({
        where: {
            status: ['active', 'maintenance']
        }
    });
    
    return vehicles.filter(vehicle => vehicle.isMaintenanceDue());
};

Vehicle.getInsuranceExpiringVehicles = async function(daysAhead = 30) {
    const vehicles = await Vehicle.findAll({
        where: {
            status: ['active', 'maintenance'],
            insurance_expiry_date: {
                [sequelize.Sequelize.Op.not]: null
            }
        }
    });
    
    return vehicles.filter(vehicle => vehicle.isInsuranceExpiring(daysAhead));
};

Vehicle.getStatistics = async function() {
    const totalVehicles = await Vehicle.count();
    const activeVehicles = await Vehicle.count({ where: { status: 'active' } });
    const assignedVehicles = await Vehicle.count({ 
        where: { 
            assigned_distributor_id: { 
                [sequelize.Sequelize.Op.not]: null 
            } 
        } 
    });
    const maintenanceVehicles = await Vehicle.count({ where: { status: 'maintenance' } });
    
    return {
        total: totalVehicles,
        active: activeVehicles,
        assigned: assignedVehicles,
        available: activeVehicles - assignedVehicles,
        maintenance: maintenanceVehicles,
        utilizationRate: totalVehicles > 0 ? Math.round((assignedVehicles / totalVehicles) * 100) : 0
    };
};

export default Vehicle; 