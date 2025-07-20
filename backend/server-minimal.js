import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';

// Load environment variables first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from config.env first, then from .env
try {
    dotenv.config({ path: path.join(__dirname, 'config.env') });
} catch (err) {
    dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection
const sequelize = new Sequelize(
    process.env.DB_NAME || 'railway',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
        port: process.env.DB_PORT || 24785,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+02:00',
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

// Middleware
app.use(helmet());
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is working!',
        timestamp: new Date().toISOString()
    });
});

// Simple order creation endpoint
app.post('/api/orders', async (req, res) => {
    try {
        const { store_id, items, notes, priority } = req.body;

        // Validate input
        if (!store_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: [
                    { field: 'store_id', message: 'Store ID is required' },
                    { field: 'items', message: 'At least one item is required' }
                ]
            });
        }

        // Generate order number
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const todayStart = new Date(year, today.getMonth(), today.getDate());
        const todayEnd = new Date(year, today.getMonth(), today.getDate() + 1);

        const [todayOrdersResult] = await sequelize.query(`
            SELECT COUNT(*) as count FROM orders 
            WHERE created_at >= ? AND created_at < ?
        `, {
            replacements: [todayStart, todayEnd]
        });

        const todayOrdersCount = todayOrdersResult[0].count;
        const sequenceNumber = String(todayOrdersCount + 1).padStart(4, '0');
        const orderNumber = `ORD-${year}${month}${day}-${sequenceNumber}`;

        // Get store name
        const [storeResult] = await sequelize.query(`
            SELECT name FROM stores WHERE id = ?
        `, {
            replacements: [store_id]
        });

        if (storeResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        const storeName = storeResult[0].name;

        // Calculate totals
        let totalAmountEur = 0;
        let totalAmountSyp = 0;
        let totalCostEur = 0;
        let totalCostSyp = 0;

        // Validate items and calculate totals
        for (const item of items) {
            const [productResult] = await sequelize.query(`
                SELECT * FROM products WHERE id = ?
            `, {
                replacements: [item.product_id]
            });

            if (productResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `المنتج ${item.product_id} غير موجود`
                });
            }

            const product = productResult[0];
            const quantity = parseInt(item.quantity);

            if (quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `الكمية يجب أن تكون أكبر من صفر للمنتج ${product.name}`
                });
            }

            const itemTotalEur = product.price_eur * quantity;
            const itemTotalSyp = product.price_syp * quantity;
            const itemCostEur = product.cost_eur * quantity;
            const itemCostSyp = product.cost_syp * quantity;

            totalAmountEur += itemTotalEur;
            totalAmountSyp += itemTotalSyp;
            totalCostEur += itemCostEur;
            totalCostSyp += itemCostSyp;
        }

        // Create order
        const [orderResult] = await sequelize.query(`
            INSERT INTO orders (
                order_number, store_id, store_name, total_amount_eur, total_amount_syp,
                total_cost_eur, total_cost_syp, commission_eur, commission_syp,
                status, payment_status, priority, notes, created_by, created_by_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [
                orderNumber,
                store_id,
                storeName,
                totalAmountEur,
                totalAmountSyp,
                totalCostEur,
                totalCostSyp,
                (totalAmountEur - totalCostEur) * 0.1,
                (totalAmountSyp - totalCostSyp) * 0.1,
                'draft',
                'pending',
                priority || 'normal',
                notes || '',
                1, // Default user ID
                'admin' // Default user name
            ]
        });

        const orderId = orderResult.insertId;

        // Create order items
        for (const item of items) {
            const [productResult] = await sequelize.query(`
                SELECT * FROM products WHERE id = ?
            `, {
                replacements: [item.product_id]
            });

            const product = productResult[0];
            const quantity = parseInt(item.quantity);
            const itemTotalEur = product.price_eur * quantity;
            const itemTotalSyp = product.price_syp * quantity;

            await sequelize.query(`
                INSERT INTO order_items (
                    order_id, product_id, quantity, unit_price_eur, unit_price_syp,
                    total_price_eur, total_price_syp, final_price_eur, final_price_syp,
                    product_name, product_unit
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, {
                replacements: [
                    orderId,
                    item.product_id,
                    quantity,
                    product.price_eur,
                    product.price_syp,
                    itemTotalEur,
                    itemTotalSyp,
                    itemTotalEur,
                    itemTotalSyp,
                    product.name,
                    product.unit
                ]
            });
        }

        res.status(201).json({
            success: true,
            data: {
                id: orderId,
                order_number: orderNumber,
                store_id,
                store_name: storeName,
                total_amount_eur: totalAmountEur,
                total_amount_syp: totalAmountSyp,
                status: 'draft',
                payment_status: 'pending',
                priority: priority || 'normal',
                notes: notes || '',
                created_at: new Date().toISOString()
            },
            message: 'تم إنشاء الطلب بنجاح'
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الطلب',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        app.listen(PORT, () => {
            console.log('🍞 Bakery Management System - Minimal Edition');
            console.log('═'.repeat(50));
            console.log(`🚀 Server: http://localhost:${PORT}`);
            console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API: http://localhost:${PORT}/api`);
            console.log(`📊 Health: http://localhost:${PORT}/api/health`);
            console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
            console.log(`📦 Orders: http://localhost:${PORT}/api/orders`);
            console.log('═'.repeat(50));
            console.log('✅ Minimal server ready!\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app; 