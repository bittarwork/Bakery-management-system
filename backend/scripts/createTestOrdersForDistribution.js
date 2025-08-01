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

async function createTestOrdersForDistribution() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        console.log(`📅 Creating orders for date: ${today}`);

        // Get distributors
        console.log('\n=== GETTING DISTRIBUTORS ===');
        const [distributors] = await connection.execute(`
            SELECT id, full_name FROM users 
            WHERE role = 'distributor' AND status = 'active'
            LIMIT 3
        `);

        if (distributors.length === 0) {
            console.log('❌ No distributors found. Creating test distributors...');

            // Create test distributors
            await connection.execute(`
                INSERT INTO users (full_name, email, phone, role, status, password_hash, is_verified)
                VALUES 
                ('أحمد الموزع', 'distributor1@bakery.com', '0991234567', 'distributor', 'active', '$2b$12$dummy.hash.here', 1),
                ('محمد التوزيع', 'distributor2@bakery.com', '0991234568', 'distributor', 'active', '$2b$12$dummy.hash.here', 1),
                ('سارة التوصيل', 'distributor3@bakery.com', '0991234569', 'distributor', 'active', '$2b$12$dummy.hash.here', 1)
            `);

            // Get the created distributors
            const [newDistributors] = await connection.execute(`
                SELECT id, full_name FROM users 
                WHERE role = 'distributor' AND status = 'active'
                ORDER BY id DESC LIMIT 3
            `);
            distributors.push(...newDistributors);
        }

        console.log(`✅ Found ${distributors.length} distributors:`);
        distributors.forEach(d => console.log(`  - ${d.full_name} (ID: ${d.id})`));

        // Get stores
        console.log('\n=== GETTING STORES ===');
        const [stores] = await connection.execute(`
            SELECT id, name FROM stores WHERE status = 'active' LIMIT 5
        `);

        console.log(`✅ Found ${stores.length} stores:`);
        stores.forEach(s => console.log(`  - ${s.name} (ID: ${s.id})`));

        // Get products
        console.log('\n=== GETTING PRODUCTS ===');
        const [products] = await connection.execute(`
            SELECT id, name, price_eur FROM products WHERE status = 'active' LIMIT 10
        `);

        console.log(`✅ Found ${products.length} products`);

        // Create test orders
        console.log('\n=== CREATING TEST ORDERS ===');
        const ordersToCreate = [];
        let orderNumber = 1000 + Math.floor(Math.random() * 1000);

        // Create 2-3 orders per distributor
        for (let i = 0; i < distributors.length; i++) {
            const distributor = distributors[i];
            const numOrders = 2 + Math.floor(Math.random() * 2); // 2-3 orders

            for (let j = 0; j < numOrders; j++) {
                const store = stores[Math.floor(Math.random() * stores.length)];
                const deliveryDate = j === 0 ? today : tomorrow; // Mix of today and tomorrow

                const totalEur = (10 + Math.random() * 40);
                const totalSyp = totalEur * 5000; // EUR to SYP conversion

                const orderData = {
                    order_number: `ORD-${orderNumber++}`,
                    store_id: store.id,
                    store_name: store.name,
                    customer_name: `عميل ${orderNumber}`,
                    customer_phone: `099${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
                    delivery_date: deliveryDate,
                    delivery_address: `عنوان التوصيل ${orderNumber}`,
                    assigned_distributor_id: distributor.id,
                    status: 'confirmed',
                    priority: ['high', 'normal', 'low'][Math.floor(Math.random() * 3)],
                    total_amount_eur: totalEur.toFixed(2),
                    total_amount_syp: totalSyp.toFixed(0),
                    final_amount_eur: totalEur.toFixed(2),
                    final_amount_syp: totalSyp.toFixed(0),
                    discount_amount_eur: 0,
                    discount_amount_syp: 0,
                    total_cost_eur: (totalEur * 0.7).toFixed(2), // 70% cost ratio
                    currency: 'EUR',
                    payment_status: 'pending',
                    special_instructions: `تعليمات خاصة للطلب ${orderNumber}`,
                    order_date: deliveryDate,
                    created_by: 1,
                    created_by_name: 'Admin'
                };

                ordersToCreate.push(orderData);
            }
        }

        // Insert orders
        for (const orderData of ordersToCreate) {
            const insertQuery = `
                INSERT INTO orders (
                    order_number, store_id, store_name, customer_name, customer_phone,
                    delivery_date, delivery_address, assigned_distributor_id,
                    status, priority, total_amount_eur, total_amount_syp, final_amount_eur, final_amount_syp,
                    discount_amount_eur, discount_amount_syp, total_cost_eur, currency, payment_status,
                    special_instructions, order_date, created_by, created_by_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                orderData.order_number, orderData.store_id, orderData.store_name,
                orderData.customer_name, orderData.customer_phone, orderData.delivery_date,
                orderData.delivery_address, orderData.assigned_distributor_id,
                orderData.status, orderData.priority, orderData.total_amount_eur,
                orderData.total_amount_syp, orderData.final_amount_eur, orderData.final_amount_syp,
                orderData.discount_amount_eur, orderData.discount_amount_syp, orderData.total_cost_eur,
                orderData.currency, orderData.payment_status, orderData.special_instructions,
                orderData.order_date, orderData.created_by, orderData.created_by_name
            ];

            await connection.execute(insertQuery, values);
            console.log(`✅ Created order ${orderData.order_number} for distributor ID ${orderData.assigned_distributor_id}`);
        }

        // Create order items for each order
        console.log('\n=== CREATING ORDER ITEMS ===');
        const [createdOrders] = await connection.execute(`
            SELECT id, order_number FROM orders 
            WHERE created_at >= CURDATE()
            ORDER BY id DESC
            LIMIT ${ordersToCreate.length}
        `);

        for (const order of createdOrders) {
            const numItems = 1 + Math.floor(Math.random() * 3); // 1-3 items per order

            for (let i = 0; i < numItems; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = 1 + Math.floor(Math.random() * 5);

                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, product_id, product_name, quantity, unit_price_eur, unit_price_syp,
                        total_price_eur, total_price_syp
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    order.id, product.id, product.name, quantity,
                    product.price_eur, (product.price_eur * 5000), // Convert EUR to SYP
                    (product.price_eur * quantity), (product.price_eur * quantity * 5000)
                ]);
            }
            console.log(`✅ Created ${numItems} items for order ${order.order_number}`);
        }

        console.log('\n=== SUMMARY ===');
        console.log(`✅ Created ${ordersToCreate.length} test orders`);
        console.log(`✅ Assigned to ${distributors.length} distributors`);
        console.log(`📅 Orders for today: ${ordersToCreate.filter(o => o.delivery_date === today).length}`);
        console.log(`📅 Orders for tomorrow: ${ordersToCreate.filter(o => o.delivery_date === tomorrow).length}`);
        console.log('\n🎉 Test data created successfully!');
        console.log('Now try accessing the distribution schedules in the frontend.');

    } catch (error) {
        console.error('❌ Error creating test orders:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTestOrdersForDistribution();