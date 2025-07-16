import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

async function seedOrders() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // Get available stores
        const [stores] = await connection.execute('SELECT id, name FROM stores LIMIT 5');
        console.log(`📋 Found ${stores.length} stores`);

        // Get available products
        const [products] = await connection.execute('SELECT id, name, price_eur, price_syp FROM products LIMIT 5');
        console.log(`📦 Found ${products.length} products`);

        if (stores.length === 0 || products.length === 0) {
            console.log('❌ No stores or products found. Please run seeders first.');
            return;
        }

        // Clear existing orders
        console.log('\n🗑️  Clearing existing orders...');
        await connection.execute('DELETE FROM order_items');
        await connection.execute('DELETE FROM orders');
        console.log('✅ Orders cleared');

        // Create sample orders
        console.log('\n📋 Creating sample orders...');

        const sampleOrders = [
            {
                order_number: 'ORD-2024-001',
                store_id: stores[0].id,
                order_date: '2024-12-20',
                delivery_date: '2024-12-22',
                status: 'confirmed',
                payment_status: 'pending',
                priority: 'high',
                notes: 'Urgent order for weekend rush',
                created_by_name: 'System Admin'
            },
            {
                order_number: 'ORD-2024-002',
                store_id: stores[1] ? stores[1].id : stores[0].id,
                order_date: '2024-12-20',
                delivery_date: '2024-12-21',
                status: 'prepared',
                payment_status: 'partial',
                priority: 'normal',
                notes: 'Regular weekly order',
                created_by_name: 'System Admin'
            },
            {
                order_number: 'ORD-2024-003',
                store_id: stores[2] ? stores[2].id : stores[0].id,
                order_date: '2024-12-19',
                delivery_date: '2024-12-21',
                status: 'delivered',
                payment_status: 'paid',
                priority: 'normal',
                notes: 'Delivered successfully',
                created_by_name: 'System Admin'
            },
            {
                order_number: 'ORD-2024-004',
                store_id: stores[3] ? stores[3].id : stores[0].id,
                order_date: '2024-12-20',
                delivery_date: '2024-12-23',
                status: 'draft',
                payment_status: 'pending',
                priority: 'high',
                notes: 'Special event order',
                created_by_name: 'System Admin'
            },
            {
                order_number: 'ORD-2024-005',
                store_id: stores[4] ? stores[4].id : stores[0].id,
                order_date: '2024-12-18',
                delivery_date: '2024-12-20',
                status: 'cancelled',
                payment_status: 'pending',
                priority: 'normal',
                notes: 'Cancelled due to store closure',
                created_by_name: 'System Admin'
            }
        ];

        for (let i = 0; i < sampleOrders.length; i++) {
            const order = sampleOrders[i];

            // Calculate totals
            let totalAmountEur = 0;
            let totalAmountSyp = 0;

            // Create random order items
            const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
            const orderItems = [];

            for (let j = 0; j < numItems; j++) {
                const product = products[j % products.length];
                const quantity = Math.floor(Math.random() * 10) + 1; // 1-10 quantity
                const itemTotalEur = product.price_eur * quantity;
                const itemTotalSyp = product.price_syp * quantity;

                totalAmountEur += itemTotalEur;
                totalAmountSyp += itemTotalSyp;

                orderItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    quantity: quantity,
                    unit_price_eur: product.price_eur,
                    unit_price_syp: product.price_syp,
                    total_price_eur: itemTotalEur,
                    total_price_syp: itemTotalSyp
                });
            }

            // Get store name for the order
            const store = stores.find(s => s.id === order.store_id);
            const storeName = store ? store.name : 'Unknown Store';

            // Insert order
            const [orderResult] = await connection.execute(`
        INSERT INTO orders (
          order_number, store_id, store_name, order_date, delivery_date, 
          total_amount_eur, total_amount_syp, final_amount_eur, final_amount_syp,
          status, payment_status, priority, notes, created_by, created_by_name,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
                order.order_number,
                order.store_id,
                storeName,
                order.order_date,
                order.delivery_date,
                totalAmountEur,
                totalAmountSyp,
                totalAmountEur, // final_amount_eur (no discount for now)
                totalAmountSyp, // final_amount_syp (no discount for now)
                order.status,
                order.payment_status,
                order.priority,
                order.notes,
                1, // created_by (admin user ID)
                order.created_by_name
            ]);

            const orderId = orderResult.insertId;

            // Insert order items
            for (const item of orderItems) {
                await connection.execute(`
          INSERT INTO order_items (
            order_id, product_id, product_name, quantity, 
            unit_price_eur, unit_price_syp, total_price_eur, total_price_syp,
            final_price_eur, final_price_syp, final_price,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
                    orderId,
                    item.product_id,
                    item.product_name,
                    item.quantity,
                    item.unit_price_eur,
                    item.unit_price_syp,
                    item.total_price_eur,
                    item.total_price_syp,
                    item.total_price_eur, // final_price_eur (no discount)
                    item.total_price_syp, // final_price_syp (no discount)
                    item.total_price_eur  // final_price (EUR value)
                ]);
            }

            console.log(`✅ Created order: ${order.order_number} (€${totalAmountEur.toFixed(2)})`);
        }

        // Verify creation
        const [orderCount] = await connection.execute('SELECT COUNT(*) as count FROM orders');
        const [itemCount] = await connection.execute('SELECT COUNT(*) as count FROM order_items');

        console.log(`\n📊 Created ${orderCount[0].count} orders with ${itemCount[0].count} items`);

        // Show sample data
        const [ordersData] = await connection.execute(`
      SELECT o.order_number, s.name as store_name, o.final_amount_eur, o.status, o.priority
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      ORDER BY o.created_at DESC
    `);

        console.log('\n📋 Sample orders:');
        console.table(ordersData);

    } catch (error) {
        console.error('❌ Error seeding orders:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

seedOrders(); 