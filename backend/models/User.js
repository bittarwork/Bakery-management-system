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
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
                const hashedPassword = await bcrypt.hash(user.password, saltRounds);
                user.setDataValue('password', hashedPassword);
            }
        },
        beforeUpdate: async (user) => {
            if (user.password && user.changed('password')) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
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
User.findByCredentials = async function (username, password) {
    const user = await User.findOne({
        where: {
            username: username,
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

export default User; 