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
    password_hash: {
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
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
            fields: ['is_active']
        }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
                user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
                user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
            }
        }
    }
});

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    return values;
};

// Class methods
User.findByCredentials = async function (username, password) {
    const user = await User.findOne({
        where: {
            username: username,
            is_active: true
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

export default User; 