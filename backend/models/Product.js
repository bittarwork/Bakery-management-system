import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
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
                msg: 'اسم المنتج مطلوب'
            },
            len: {
                args: [2, 100],
                msg: 'اسم المنتج يجب أن يكون بين 2 و 100 حرف'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    unit: {
        type: DataTypes.STRING(20),
        defaultValue: 'piece',
        validate: {
            notEmpty: {
                msg: 'وحدة القياس مطلوبة'
            }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'السعر لا يمكن أن يكون سالباً'
            },
            isDecimal: {
                msg: 'السعر يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: 0,
                msg: 'التكلفة لا يمكن أن تكون سالبة'
            },
            isDecimal: {
                msg: 'التكلفة يجب أن تكون رقماً صحيحاً'
            }
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['is_active']
        },
        {
            fields: ['name']
        },
        {
            fields: ['price']
        }
    ],
    validate: {
        priceNotLessThanCost() {
            if (this.price < this.cost) {
                throw new Error('السعر لا يمكن أن يكون أقل من التكلفة');
            }
        }
    }
});

// Instance methods
Product.prototype.getMargin = function () {
    const margin = parseFloat(this.price) - parseFloat(this.cost);
    return Math.round(margin * 100) / 100;
};

Product.prototype.getMarginPercentage = function () {
    if (parseFloat(this.cost) === 0) return 0;
    const marginPercentage = ((parseFloat(this.price) - parseFloat(this.cost)) / parseFloat(this.cost)) * 100;
    return Math.round(marginPercentage * 100) / 100;
};

Product.prototype.calculateTotal = function (quantity) {
    const total = parseFloat(this.price) * parseInt(quantity);
    return Math.round(total * 100) / 100;
};

Product.prototype.updatePrice = async function (newPrice, transaction = null) {
    if (newPrice < this.cost) {
        throw new Error('السعر الجديد لا يمكن أن يكون أقل من التكلفة');
    }

    const options = transaction ? { transaction } : {};
    this.price = newPrice;
    await this.save(options);

    return this;
};

// Class methods
Product.getActiveProducts = async function () {
    return await Product.findAll({
        where: {
            is_active: true
        },
        order: [['name', 'ASC']]
    });
};

Product.searchByName = async function (searchTerm, includeInactive = false) {
    const whereClause = {
        name: {
            [sequelize.Sequelize.Op.like]: `%${searchTerm}%`
        }
    };

    if (!includeInactive) {
        whereClause.is_active = true;
    }

    return await Product.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

Product.getPriceRange = async function () {
    const result = await Product.findOne({
        attributes: [
            [sequelize.fn('MIN', sequelize.col('price')), 'min_price'],
            [sequelize.fn('MAX', sequelize.col('price')), 'max_price'],
            [sequelize.fn('AVG', sequelize.col('price')), 'avg_price']
        ],
        where: {
            is_active: true
        }
    });

    return {
        min_price: parseFloat(result.dataValues.min_price) || 0,
        max_price: parseFloat(result.dataValues.max_price) || 0,
        avg_price: Math.round(parseFloat(result.dataValues.avg_price) * 100) / 100 || 0
    };
};

Product.getBestSellers = async function (limit = 10, dateFrom = null, dateTo = null) {
    // This would need to join with orders/distribution_items table
    // For now, returning a placeholder that can be implemented later
    return await Product.findAll({
        where: {
            is_active: true
        },
        order: [['name', 'ASC']],
        limit
    });
};

export default Product; 