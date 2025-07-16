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
                msg: 'Product name is required'
            },
            len: {
                args: [2, 100],
                msg: 'Product name must be between 2 and 100 characters'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other'),
        defaultValue: 'other',
        validate: {
            isIn: {
                args: [['bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other']],
                msg: 'Invalid product category'
            }
        }
    },
    unit: {
        type: DataTypes.STRING(20),
        defaultValue: 'piece',
        validate: {
            notEmpty: {
                msg: 'Unit is required'
            }
        }
    },
    price_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.01,
        validate: {
            min: {
                args: 0.01,
                msg: 'Price in EUR must be a positive number'
            },
            isDecimal: {
                msg: 'Price in EUR must be a valid decimal number'
            }
        }
    },
    price_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        validate: {
            isPositive(value) {
                if (value !== null && value !== undefined && value !== '') {
                    if (parseFloat(value) <= 0) {
                        throw new Error('Price in SYP must be a positive number');
                    }
                }
            }
        }
    },
    cost_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
        validate: {
            isNonNegative(value) {
                if (value !== null && value !== undefined && value !== '') {
                    if (parseFloat(value) < 0) {
                        throw new Error('Cost in EUR cannot be negative');
                    }
                }
            }
        }
    },
    cost_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        validate: {
            isNonNegative(value) {
                if (value !== null && value !== undefined && value !== '') {
                    if (parseFloat(value) < 0) {
                        throw new Error('Cost in SYP cannot be negative');
                    }
                }
            }
        }
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
            isNonNegative(value) {
                if (value !== null && value !== undefined && value !== '') {
                    if (parseInt(value) < 0) {
                        throw new Error('Stock quantity cannot be negative');
                    }
                }
            }
        }
    },
    minimum_stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
            isNonNegative(value) {
                if (value !== null && value !== undefined && value !== '') {
                    if (parseInt(value) < 0) {
                        throw new Error('Minimum stock cannot be negative');
                    }
                }
            }
        }
    },
    total_sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_revenue_eur: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    total_revenue_syp: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0.00
    },
    supplier_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'معلومات المورد'
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'تاريخ انتهاء الصلاحية'
    },
    production_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'تاريخ الإنتاج'
    },
    shelf_life_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Shelf life in days',
        validate: {
            isPositive(value) {
                if (value !== null && value !== undefined && value !== '') {
                    if (parseInt(value) <= 0) {
                        throw new Error('Shelf life must be a positive number');
                    }
                }
            }
        }
    },
    weight_grams: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Weight in grams',
        validate: {
            isPositive(value) {
                if (value !== null && value !== undefined && value !== '') {
                    if (parseInt(value) <= 0) {
                        throw new Error('Weight must be a positive number');
                    }
                }
            }
        }
    },
    dimensions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'أبعاد المنتج'
    },
    nutritional_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'المعلومات الغذائية'
    },
    allergen_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'معلومات المواد المسببة للحساسية'
    },
    storage_conditions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'شروط التخزين'
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
            isValidUrl(value) {
                if (value !== null && value !== undefined && value !== '') {
                    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                    if (!urlPattern.test(value)) {
                        throw new Error('Image URL must be a valid URL');
                    }
                }
            }
        }
    },
    barcode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
        defaultValue: 'active',
        validate: {
            isIn: {
                args: [['active', 'inactive', 'discontinued']],
                msg: 'Invalid product status'
            }
        }
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
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['category']
        },
        {
            fields: ['name']
        },
        {
            fields: ['price_eur']
        },
        {
            fields: ['price_syp']
        },
        {
            fields: ['is_featured']
        },
        {
            fields: ['barcode'],
            unique: true
        }
    ],
    validate: {
        priceNotLessThanCostEur() {
            // Only validate if both values are provided and not null
            if (this.price_eur !== null && this.cost_eur !== null &&
                this.price_eur !== undefined && this.cost_eur !== undefined) {
                if (parseFloat(this.price_eur) < parseFloat(this.cost_eur)) {
                    throw new Error('Price in EUR cannot be less than cost');
                }
            }
        },
        priceNotLessThanCostSyp() {
            // Only validate if both values are provided and not null
            if (this.price_syp !== null && this.cost_syp !== null &&
                this.price_syp !== undefined && this.cost_syp !== undefined) {
                if (parseFloat(this.price_syp) < parseFloat(this.cost_syp)) {
                    throw new Error('Price in SYP cannot be less than cost');
                }
            }
        }
    }
});

// Instance methods
Product.prototype.getMarginEur = function () {
    const margin = parseFloat(this.price_eur) - parseFloat(this.cost_eur);
    return Math.round(margin * 100) / 100;
};

Product.prototype.getMarginSyp = function () {
    const margin = parseFloat(this.price_syp) - parseFloat(this.cost_syp);
    return Math.round(margin * 100) / 100;
};

Product.prototype.getMarginPercentageEur = function () {
    if (parseFloat(this.cost_eur) === 0) return 0;
    const marginPercentage = ((parseFloat(this.price_eur) - parseFloat(this.cost_eur)) / parseFloat(this.cost_eur)) * 100;
    return Math.round(marginPercentage * 100) / 100;
};

Product.prototype.getMarginPercentageSyp = function () {
    if (parseFloat(this.cost_syp) === 0) return 0;
    const marginPercentage = ((parseFloat(this.price_syp) - parseFloat(this.cost_syp)) / parseFloat(this.cost_syp)) * 100;
    return Math.round(marginPercentage * 100) / 100;
};

Product.prototype.calculateTotalEur = function (quantity) {
    const total = parseFloat(this.price_eur) * parseInt(quantity);
    return Math.round(total * 100) / 100;
};

Product.prototype.calculateTotalSyp = function (quantity) {
    const total = parseFloat(this.price_syp) * parseInt(quantity);
    return Math.round(total * 100) / 100;
};

Product.prototype.updatePrices = async function (newPriceEur, newPriceSyp, transaction = null) {
    if (newPriceEur < this.cost_eur) {
        throw new Error('New price in EUR cannot be less than cost');
    }

    if (newPriceSyp < this.cost_syp) {
        throw new Error('New price in SYP cannot be less than cost');
    }

    const options = transaction ? { transaction } : {};
    this.price_eur = newPriceEur;
    this.price_syp = newPriceSyp;
    await this.save(options);

    return this;
};

Product.prototype.updateStock = async function (quantity, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.stock_quantity = parseInt(quantity);
    await this.save(options);
    return this;
};

Product.prototype.addToStock = async function (quantity, transaction = null) {
    const options = transaction ? { transaction } : {};
    this.stock_quantity += parseInt(quantity);
    await this.save(options);
    return this;
};

Product.prototype.removeFromStock = async function (quantity, transaction = null) {
    const options = transaction ? { transaction } : {};
    const newQuantity = this.stock_quantity - parseInt(quantity);
    this.stock_quantity = newQuantity >= 0 ? newQuantity : 0;
    await this.save(options);
    return this;
};

Product.prototype.isLowStock = function () {
    return this.stock_quantity <= this.minimum_stock;
};

Product.prototype.isOutOfStock = function () {
    return this.stock_quantity === 0;
};

Product.prototype.isExpired = function () {
    if (!this.expiry_date) return false;
    return new Date() > new Date(this.expiry_date);
};

Product.prototype.isExpiringSoon = function (daysAhead = 7) {
    if (!this.expiry_date) return false;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return new Date(this.expiry_date) <= futureDate;
};

Product.prototype.recordSale = async function (quantity, amountEur = 0, amountSyp = 0, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.total_sold += parseInt(quantity);
    this.total_revenue_eur += parseFloat(amountEur);
    this.total_revenue_syp += parseFloat(amountSyp);

    // Remove from stock
    await this.removeFromStock(quantity, transaction);

    await this.save(options);
    return this;
};

// Class methods
Product.getActiveProducts = async function () {
    return await Product.findAll({
        where: {
            status: 'active'
        },
        order: [['name', 'ASC']]
    });
};

Product.getProductsByCategory = async function (category, includeInactive = false) {
    const whereClause = { category: category };
    if (!includeInactive) {
        whereClause.status = 'active';
    }

    return await Product.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

Product.getFeaturedProducts = async function (limit = 10) {
    return await Product.findAll({
        where: {
            is_featured: true,
            status: 'active'
        },
        order: [['name', 'ASC']],
        limit: limit
    });
};

Product.searchByName = async function (searchTerm, includeInactive = false) {
    const whereClause = {
        name: {
            [sequelize.Sequelize.Op.like]: `%${searchTerm}%`
        }
    };

    if (!includeInactive) {
        whereClause.status = 'active';
    }

    return await Product.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

Product.searchProducts = async function (searchTerm, filters = {}) {
    const { Op } = require('sequelize');

    let whereClause = {};

    // Search in name and description
    if (searchTerm) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
            { barcode: { [Op.like]: `%${searchTerm}%` } }
        ];
    }

    // Apply filters
    if (filters.category) {
        whereClause.category = filters.category;
    }

    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.is_featured !== undefined) {
        whereClause.is_featured = filters.is_featured;
    }

    if (filters.min_price_eur) {
        whereClause.price_eur = { [Op.gte]: filters.min_price_eur };
    }

    if (filters.max_price_eur) {
        whereClause.price_eur = {
            ...whereClause.price_eur,
            [Op.lte]: filters.max_price_eur
        };
    }

    return await Product.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

Product.getPriceRange = async function () {
    const result = await Product.findOne({
        attributes: [
            [sequelize.fn('MIN', sequelize.col('price_eur')), 'min_price_eur'],
            [sequelize.fn('MAX', sequelize.col('price_eur')), 'max_price_eur'],
            [sequelize.fn('AVG', sequelize.col('price_eur')), 'avg_price_eur'],
            [sequelize.fn('MIN', sequelize.col('price_syp')), 'min_price_syp'],
            [sequelize.fn('MAX', sequelize.col('price_syp')), 'max_price_syp'],
            [sequelize.fn('AVG', sequelize.col('price_syp')), 'avg_price_syp']
        ],
        where: {
            status: 'active'
        }
    });

    return {
        min_price_eur: parseFloat(result.dataValues.min_price_eur) || 0,
        max_price_eur: parseFloat(result.dataValues.max_price_eur) || 0,
        avg_price_eur: Math.round(parseFloat(result.dataValues.avg_price_eur) * 100) / 100 || 0,
        min_price_syp: parseFloat(result.dataValues.min_price_syp) || 0,
        max_price_syp: parseFloat(result.dataValues.max_price_syp) || 0,
        avg_price_syp: Math.round(parseFloat(result.dataValues.avg_price_syp) * 100) / 100 || 0
    };
};

Product.getBestSellers = async function (limit = 10) {
    return await Product.findAll({
        where: {
            status: 'active'
        },
        order: [['total_sold', 'DESC']],
        limit
    });
};

Product.getTopRevenue = async function (limit = 10) {
    return await Product.findAll({
        where: {
            status: 'active'
        },
        order: [['total_revenue_eur', 'DESC']],
        limit
    });
};

Product.getLowStockProducts = async function (limit = 20) {
    return await Product.findAll({
        where: {
            status: 'active',
            stock_quantity: {
                [sequelize.Sequelize.Op.lte]: sequelize.col('minimum_stock')
            }
        },
        order: [['stock_quantity', 'ASC']],
        limit
    });
};

Product.getExpiredProducts = async function () {
    return await Product.findAll({
        where: {
            status: 'active',
            expiry_date: {
                [sequelize.Sequelize.Op.lt]: new Date()
            }
        },
        order: [['expiry_date', 'ASC']]
    });
};

Product.getExpiringSoonProducts = async function (daysAhead = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await Product.findAll({
        where: {
            status: 'active',
            expiry_date: {
                [sequelize.Sequelize.Op.between]: [new Date(), futureDate]
            }
        },
        order: [['expiry_date', 'ASC']]
    });
};

Product.getProductStatistics = async function () {
    const stats = await Product.findAll({
        attributes: [
            'category',
            [sequelize.fn('COUNT', sequelize.col('id')), 'product_count'],
            [sequelize.fn('SUM', sequelize.col('total_sold')), 'total_sold'],
            [sequelize.fn('SUM', sequelize.col('total_revenue_eur')), 'total_revenue_eur'],
            [sequelize.fn('SUM', sequelize.col('total_revenue_syp')), 'total_revenue_syp'],
            [sequelize.fn('AVG', sequelize.col('price_eur')), 'avg_price_eur'],
            [sequelize.fn('AVG', sequelize.col('price_syp')), 'avg_price_syp']
        ],
        where: {
            status: 'active'
        },
        group: ['category'],
        raw: true
    });

    return stats;
};

export default Product; 