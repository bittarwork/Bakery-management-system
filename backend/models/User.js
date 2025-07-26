import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../constants/index.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'اسم المستخدم مطلوب'
            },
            len: {
                args: [3, 50],
                msg: 'اسم المستخدم يجب أن يكون بين 3 و 50 حرف'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: {
                msg: 'البريد الإلكتروني غير صحيح'
            },
            notEmpty: {
                msg: 'البريد الإلكتروني مطلوب'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'كلمة المرور مطلوبة'
            }
        }
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'الاسم الكامل مطلوب'
            },
            len: {
                args: [2, 100],
                msg: 'الاسم الكامل يجب أن يكون بين 2 و 100 حرف'
            }
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: {
                args: /^\+?[1-9]\d{1,14}$/,
                msg: 'رقم الهاتف غير صحيح'
            }
        }
    },
    role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLES)),
        defaultValue: USER_ROLES.DISTRIBUTOR,
        validate: {
            isIn: {
                args: [Object.values(USER_ROLES)],
                msg: 'الدور غير صحيح'
            }
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
        defaultValue: 'active'
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Distributor location tracking fields
    current_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Current GPS location with timestamp for distributors'
    },
    location_updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When location was last updated'
    },
    // Vehicle information for distributors
    vehicle_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Vehicle details for distributors'
    },
    // Work status for distributors
    work_status: {
        type: DataTypes.ENUM('available', 'busy', 'offline', 'break'),
        allowNull: true,
        comment: 'Current work status for distributors'
    },
    // Performance metrics
    daily_performance: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Daily performance metrics for distributors'
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['email']
        },
        {
            fields: ['role']
        },
        {
            fields: ['status']
        }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
                const hashedPassword = await bcrypt.hash(user.password, saltRounds);
                user.setDataValue('password', hashedPassword);
            }
        },
        beforeUpdate: async (user) => {
            if (user.password && user.changed('password')) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
                const hashedPassword = await bcrypt.hash(user.password, saltRounds);
                user.setDataValue('password', hashedPassword);
            }
        }
    }
});

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
};

// Class methods
User.findByCredentials = async function (usernameOrEmail, password) {
    const { Op } = await import('sequelize');

    const user = await User.findOne({
        where: {
            [Op.or]: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ],
            status: 'active'
        }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    return user;
};

User.findByEmail = async function (email) {
    return await User.findOne({
        where: {
            email: email,
            status: 'active'
        }
    });
};

User.getActiveDistributors = async function () {
    return await User.findAll({
        where: {
            role: 'distributor',
            status: 'active'
        },
        order: [['full_name', 'ASC']]
    });
};

User.getUsersByRole = async function (role) {
    return await User.findAll({
        where: {
            role: role,
            status: 'active'
        },
        order: [['full_name', 'ASC']]
    });
};

// New methods for distributor management
User.prototype.updateLocation = async function (location) {
    if (this.role !== 'distributor') {
        throw new Error('Only distributors can update location');
    }
    
    this.current_location = {
        ...location,
        timestamp: new Date()
    };
    this.location_updated_at = new Date();
    
    await this.save();
    return this;
};

User.prototype.updateWorkStatus = async function (workStatus) {
    if (this.role !== 'distributor') {
        throw new Error('Only distributors can update work status');
    }
    
    const validStatuses = ['available', 'busy', 'offline', 'break'];
    if (!validStatuses.includes(workStatus)) {
        throw new Error('Invalid work status');
    }
    
    this.work_status = workStatus;
    await this.save();
    return this;
};

User.prototype.updateDailyPerformance = async function (performanceData) {
    if (this.role !== 'distributor') {
        throw new Error('Only distributors can update performance');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const currentPerformance = this.daily_performance || {};
    
    currentPerformance[today] = {
        ...performanceData,
        updated_at: new Date()
    };
    
    this.daily_performance = currentPerformance;
    await this.save();
    return this;
};

User.getActiveDistributorsWithLocation = async function () {
    return await User.findAll({
        where: {
            role: 'distributor',
            status: 'active',
            work_status: ['available', 'busy']
        },
        order: [['full_name', 'ASC']]
    });
};

export default User; 