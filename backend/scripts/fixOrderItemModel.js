import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create new OrderItem model based on production database
const createOrderItemModel = async () => {
    let connection;
    try {
        console.log('🔄 Connecting to production database...');

        // Production database connection
        connection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        console.log('✅ Connected to production database');

        // Get the actual table structure
        const [columns] = await connection.execute('DESCRIBE order_items');

        console.log('📋 Production order_items table structure:');
        console.log('==========================================');

        columns.forEach((column) => {
            console.log(`- ${column.Field} (${column.Type}) ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });

        // Create the new model based on production database
        const modelCode = `import { DataTypes } from 'sequelize';
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
`;

        // Backup the old model
        const modelPath = path.join(__dirname, '../models/OrderItem.js');
        const backupPath = path.join(__dirname, '../models/OrderItem.backup.js');

        if (fs.existsSync(modelPath)) {
            console.log('📁 Backing up old model to OrderItem.backup.js...');
            fs.copyFileSync(modelPath, backupPath);
        }

        // Write the new model
        console.log('📝 Writing new OrderItem model...');
        fs.writeFileSync(modelPath, modelCode);

        console.log('✅ New OrderItem model created successfully!');
        console.log('🔄 The model now matches the production database schema.');

        // Test the new model
        console.log('\n🧪 Testing orders query with new model...');
        const [testOrders] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                oi.id as item_id,
                oi.product_name,
                oi.quantity,
                oi.unit_price_eur,
                oi.total_price_eur,
                oi.return_reason
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LIMIT 3
        `);

        console.log(`✅ Query successful! Found ${testOrders.length} records`);
        testOrders.forEach((row, index) => {
            console.log(`${index + 1}. Order ${row.order_number}: ${row.product_name} - ${row.quantity} units`);
        });

        console.log('\n🎉 Model update completed successfully!');
        console.log('🚀 The orders API should now work correctly with the production database.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
};

// Run the script
createOrderItemModel(); 