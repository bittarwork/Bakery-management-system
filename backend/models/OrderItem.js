import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    product_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    product_barcode: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    product_sku: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    product_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    supplier_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    unit: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    product_category: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: 1,
                msg: 'الكمية يجب أن تكون أكبر من صفر'
            }
        }
    },
    delivered_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    returned_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    damaged_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivery_status: {
        type: DataTypes.ENUM('pending', 'in_transit', 'delivered', 'returned', 'cancelled'),
        allowNull: true,
        defaultValue: 'pending'
    },
    delivery_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    delivery_confirmed_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    delivery_confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tracking_number: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    delivery_method: {
        type: DataTypes.ENUM('pickup', 'delivery', 'shipping'),
        allowNull: true,
        defaultValue: 'delivery'
    },
    estimated_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actual_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    unit_price_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    unit_price_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_price_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_price_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    discount_amount_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    discount_amount_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    final_price_eur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    final_price_syp: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    return_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'سبب الإرجاع'
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['order_id']
        },
        {
            fields: ['product_id']
        },
        {
            fields: ['delivery_status']
        }
    ]
});

export default OrderItem;
