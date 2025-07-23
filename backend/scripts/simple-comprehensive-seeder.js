import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Database configuration for Railway production
const config = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785,
    multipleStatements: true
};

class SimpleComprehensiveSeeder {
    constructor() {
        this.connection = null;
        this.exchangeRate = 1800.00; // EUR to SYP
    }

    async connect() {
        console.log('🔗 Connecting to Railway database...');
        this.connection = await mysql.createConnection(config);
        console.log('✅ Connected successfully!');
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 Database connection closed');
        }
    }

    async clearAllData() {
        console.log('\n🧹 Clearing all existing data...');

        const tables = [
            'delivery_schedules',
            'store_visits',
            'distribution_trips',
            'payments',
            'order_items',
            'orders',
            'notifications',
            'user_sessions',
            'distributors',
            'products',
            'stores',
            'users'
        ];

        // Disable foreign key checks
        await this.connection.execute('SET FOREIGN_KEY_CHECKS = 0');

        for (const table of tables) {
            try {
                await this.connection.execute(`DELETE FROM ${table}`);
                await this.connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
                console.log(`   ✅ Cleared ${table}`);
            } catch (error) {
                console.log(`   ⚠️  Table ${table} might not exist: ${error.message}`);
            }
        }

        // Re-enable foreign key checks
        await this.connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ All data cleared successfully!');
    }

    async seedUsers() {
        console.log('\n👥 Seeding users...');

        const password = await bcrypt.hash('admin123', 12);

        const users = [
            ['admin', 'admin@bakery.com', password, 'System Administrator', '+32-489-123-001', 'admin', 'active', null, null, null, 1, 'System'],
            ['manager', 'manager@bakery.com', password, 'Operations Manager', '+32-489-123-002', 'manager', 'active', 2800.00, 5040000.00, null, 1, 'System Administrator'],
            ['accountant', 'accountant@bakery.com', password, 'Chief Accountant', '+32-489-123-003', 'accountant', 'active', 2400.00, 4320000.00, null, 1, 'System Administrator'],
            ['distributor_north', 'north@bakery.com', password, 'Mohammad Al-Souri', '+32-489-123-010', 'distributor', 'active', 2000.00, 3600000.00, 2.5, 1, 'Operations Manager'],
            ['distributor_south', 'south@bakery.com', password, 'Ali Al-Maghribi', '+32-489-123-011', 'distributor', 'active', 2000.00, 3600000.00, 2.75, 1, 'Operations Manager'],
            ['distributor_east', 'east@bakery.com', password, 'Khalid Al-Tunisi', '+32-489-123-012', 'distributor', 'active', 1950.00, 3510000.00, 2.25, 1, 'Operations Manager'],
            ['store_owner_1', 'owner1@stores.com', password, 'Abdullah Al-Salam', '+32-489-123-020', 'store_owner', 'active', null, null, null, 1, 'Operations Manager'],
            ['store_owner_2', 'owner2@stores.com', password, 'Mariam Al-Khadra', '+32-489-123-021', 'store_owner', 'active', null, null, null, 1, 'Operations Manager'],
            ['store_owner_3', 'owner3@stores.com', password, 'Hussam Al-Din', '+32-489-123-022', 'store_owner', 'active', null, null, null, 1, 'Operations Manager']
        ];

        const insertQuery = `
            INSERT INTO users (
                username, email, password, full_name, phone, role, status,
                salary_eur, salary_syp, commission_rate, email_verified, created_by_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < users.length; i++) {
            await this.connection.execute(insertQuery, users[i]);
            console.log(`   ✅ Created user: ${users[i][0]} (ID: ${i + 1})`);
        }

        console.log(`✅ Created ${users.length} users successfully!`);
    }

    async seedProducts() {
        console.log('\n🍞 Seeding products...');

        const products = [
            ['French White Bread', 'Fresh daily French bread', 'bread', 'loaf', 2.50, 4500.00, 1.20, 2160.00, 150, 20, 'BRD001', 400, 3, 1, 'active'],
            ['Whole Wheat Bread', 'Healthy whole wheat bread', 'bread', 'loaf', 3.00, 5400.00, 1.50, 2700.00, 100, 15, 'BRD002', 450, 4, 1, 'active'],
            ['French Baguette', 'Traditional French baguette', 'bread', 'piece', 3.50, 6300.00, 1.80, 3240.00, 80, 10, 'BRD003', 250, 2, 1, 'active'],
            ['Butter Croissant', 'French croissant with real butter', 'pastry', 'piece', 4.50, 8100.00, 2.20, 3960.00, 60, 10, 'PST001', 80, 2, 1, 'active'],
            ['Cheese Danish', 'Danish pastry with cream cheese', 'pastry', 'piece', 5.20, 9360.00, 2.60, 4680.00, 40, 8, 'PST002', 90, 2, 0, 'active'],
            ['Pain au Chocolat', 'French pastry with chocolate', 'pastry', 'piece', 4.80, 8640.00, 2.40, 4320.00, 45, 8, 'PST003', 85, 2, 1, 'active'],
            ['Vanilla Sponge Cake', 'Classic vanilla sponge cake', 'cake', 'piece', 15.00, 27000.00, 7.50, 13500.00, 12, 3, 'CKE001', 500, 5, 1, 'active'],
            ['Chocolate Cake', 'Rich chocolate cake', 'cake', 'piece', 18.00, 32400.00, 9.00, 16200.00, 8, 2, 'CKE002', 650, 5, 1, 'active'],
            ['Strawberry Cheesecake', 'Fresh strawberry cheesecake', 'cake', 'piece', 25.00, 45000.00, 12.50, 22500.00, 6, 2, 'CKE003', 800, 3, 1, 'active'],
            ['Chocolate Chip Cookies', 'Crispy cookies with chocolate chips', 'snack', 'piece', 2.20, 3960.00, 1.10, 1980.00, 200, 30, 'SNK001', 35, 7, 0, 'active'],
            ['Butter Cookies', 'Traditional butter cookies', 'snack', 'piece', 1.80, 3240.00, 0.90, 1620.00, 180, 25, 'SNK002', 30, 10, 0, 'active'],
            ['Almond Macarons', 'French macarons with various flavors', 'snack', 'piece', 3.50, 6300.00, 1.75, 3150.00, 50, 10, 'SNK003', 25, 5, 1, 'active'],
            ['Espresso Coffee', 'Authentic Italian espresso', 'drink', 'cup', 2.80, 5040.00, 1.40, 2520.00, 0, 0, 'DRK001', 0, 0, 0, 'active'],
            ['Cappuccino', 'Cappuccino with steamed milk', 'drink', 'cup', 3.50, 6300.00, 1.75, 3150.00, 0, 0, 'DRK002', 0, 0, 1, 'active'],
            ['Fresh Orange Juice', 'Natural 100% orange juice', 'drink', 'glass', 4.20, 7560.00, 2.10, 3780.00, 0, 0, 'DRK003', 0, 0, 0, 'active']
        ];

        const insertQuery = `
            INSERT INTO products (
                name, description, category, unit, price_eur, price_syp,
                cost_eur, cost_syp, stock_quantity, minimum_stock,
                barcode, weight_grams, shelf_life_days, is_featured, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < products.length; i++) {
            await this.connection.execute(insertQuery, products[i]);
            console.log(`   ✅ Created product: ${products[i][0]} (ID: ${i + 1})`);
        }

        console.log(`✅ Created ${products.length} products successfully!`);
    }

    async seedStores() {
        console.log('\n🏪 Seeding stores...');

        const stores = [
            [
                'Hope Supermarket', 'Abdullah Al-Salam', '+32-489-456-101', 'hope@supermarket.be',
                'Rue de la Lumière 25, 1000 Brussels North, Belgium',
                '{"latitude": 50.8503, "longitude": 4.3517, "accuracy": "high"}',
                'retail', 'supermarket', 'large',
                '{"monday": "07:00-22:00", "tuesday": "07:00-22:00", "wednesday": "07:00-22:00", "thursday": "07:00-22:00", "friday": "07:00-23:00", "saturday": "07:00-23:00", "sunday": "08:00-21:00"}',
                5000.00, 9000000.00, 1250.00, 2250000.00, 18500.00, 33300000.00, 17250.00, 31050000.00,
                2.00, 'credit_15_days', 42, 40, 285.50, 513900.00, 4.70, 'active',
                '07:00-09:00', 'Prefers early delivery, has cold storage', 4, 'Mohammad Al-Souri', 1, 'System Administrator'
            ],
            [
                'Jasmine Cafe', 'Mariam Al-Khadra', '+32-489-456-102', 'jasmine@cafe.be',
                'Avenue du Printemps 12, 1000 Brussels North, Belgium',
                '{"latitude": 50.8485, "longitude": 4.3525, "accuracy": "high"}',
                'restaurant', 'cafe', 'medium',
                '{"monday": "06:00-20:00", "tuesday": "06:00-20:00", "wednesday": "06:00-20:00", "thursday": "06:00-20:00", "friday": "06:00-22:00", "saturday": "07:00-22:00", "sunday": "07:00-19:00"}',
                1500.00, 2700000.00, 320.00, 576000.00, 8750.00, 15750000.00, 8430.00, 15174000.00,
                3.50, 'credit_7_days', 28, 27, 165.20, 297360.00, 4.50, 'active',
                '06:00-08:00', 'Requests fresh products daily', 4, 'Mohammad Al-Souri', 1, 'System Administrator'
            ],
            [
                'Damascus Restaurant', 'Hussam Al-Din', '+32-489-456-103', 'damascus@restaurant.be',
                'Boulevard Al-Sham 45, 1050 Brussels South, Belgium',
                '{"latitude": 50.8263, "longitude": 4.3406, "accuracy": "high"}',
                'restaurant', 'restaurant', 'large',
                '{"monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00", "thursday": "11:00-23:00", "friday": "11:00-00:00", "saturday": "11:00-00:00", "sunday": "12:00-22:00"}',
                3000.00, 5400000.00, 850.00, 1530000.00, 12400.00, 22320000.00, 11550.00, 20790000.00,
                2.75, 'credit_30_days', 35, 33, 220.80, 397440.00, 4.60, 'active',
                '10:00-11:00', 'Needs Middle Eastern bread and pastries', 5, 'Ali Al-Maghribi', 1, 'System Administrator'
            ],
            [
                'University Cafeteria', 'Brussels University Management', '+32-489-456-104', 'cafeteria@university.be',
                'Campus Universitaire 1, 1160 Brussels East, Belgium',
                '{"latitude": 50.8467, "longitude": 4.3720, "accuracy": "high"}',
                'wholesale', 'restaurant', 'enterprise',
                '{"monday": "07:00-20:00", "tuesday": "07:00-20:00", "wednesday": "07:00-20:00", "thursday": "07:00-20:00", "friday": "07:00-18:00", "saturday": "closed", "sunday": "closed"}',
                8000.00, 14400000.00, 2100.00, 3780000.00, 28500.00, 51300000.00, 26400.00, 47520000.00,
                1.50, 'credit_30_days', 18, 17, 680.50, 1224900.00, 4.85, 'active',
                '06:00-08:00', 'Large volume orders, educational discount', 6, 'Khalid Al-Tunisi', 1, 'System Administrator'
            ],
            [
                'Golden Hotel Brussels', 'Hotel Management - Mr. Karim', '+32-489-456-105', 'golden@hotel.be',
                'Royal Avenue 100, 1050 Brussels South, Belgium',
                '{"latitude": 50.8245, "longitude": 4.3598, "accuracy": "high"}',
                'wholesale', 'hotel', 'enterprise',
                '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
                10000.00, 18000000.00, 3200.00, 5760000.00, 35000.00, 63000000.00, 31800.00, 57240000.00,
                1.25, 'credit_30_days', 24, 23, 850.00, 1530000.00, 4.95, 'active',
                '05:00-07:00', 'Premium products required, multiple daily deliveries', 5, 'Ali Al-Maghribi', 1, 'System Administrator'
            ],
            [
                'Corner Grocery', 'Um Mohammad - Palestinian Lady', '+32-489-456-106', 'corner@grocery.be',
                'Palestine Street 8, 1070 Brussels West, Belgium',
                '{"latitude": 50.8345, "longitude": 4.3198, "accuracy": "medium"}',
                'retail', 'grocery', 'small',
                '{"monday": "08:00-20:00", "tuesday": "08:00-20:00", "wednesday": "08:00-20:00", "thursday": "08:00-20:00", "friday": "08:00-21:00", "saturday": "08:00-21:00", "sunday": "09:00-18:00"}',
                800.00, 1440000.00, 150.00, 270000.00, 3200.00, 5760000.00, 3050.00, 5490000.00,
                1.50, 'cash', 18, 17, 95.40, 171720.00, 4.20, 'active',
                '08:00-09:00', 'Small shop, limited quantities, cash only', 6, 'Khalid Al-Tunisi', 1, 'System Administrator'
            ]
        ];

        const insertQuery = `
            INSERT INTO stores (
                name, owner_name, phone, email, address, gps_coordinates,
                store_type, category, size_category, opening_hours,
                credit_limit_eur, credit_limit_syp, current_balance_eur, current_balance_syp,
                total_purchases_eur, total_purchases_syp, total_payments_eur, total_payments_syp,
                commission_rate, payment_terms, total_orders, completed_orders,
                average_order_value_eur, average_order_value_syp, performance_rating, status,
                preferred_delivery_time, special_instructions, assigned_distributor_id,
                assigned_distributor_name, created_by, created_by_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < stores.length; i++) {
            await this.connection.execute(insertQuery, stores[i]);
            console.log(`   ✅ Created store: ${stores[i][0]} (ID: ${i + 1})`);
        }

        console.log(`✅ Created ${stores.length} stores successfully!`);
    }

    async seedDistributors() {
        console.log('\n🚚 Seeding distributors...');

        const distributors = [
            [
                'Mohammad Al-Souri - North District', '+32-489-123-010', 'north@bakery.com',
                'North Brussels Distribution Center, Belgium', 'BXL-DIST-001', 'van', 'BXL-001-N',
                '{"type": "van", "make": "Mercedes", "model": "Sprinter", "capacity_kg": 2500, "fuel_type": "diesel"}',
                2000.00, 3600000.00, 2.50, '2023-01-15', 'active',
                '{"name": "Fatima Al-Souri", "phone": "+32-489-123-011", "relation": "spouse"}'
            ],
            [
                'Ali Al-Maghribi - South District', '+32-489-123-011', 'south@bakery.com',
                'South Brussels Distribution Center, Belgium', 'BXL-DIST-002', 'truck', 'BXL-002-S',
                '{"type": "truck", "make": "Iveco", "model": "Daily", "capacity_kg": 3500, "fuel_type": "diesel"}',
                2000.00, 3600000.00, 2.75, '2023-02-20', 'active',
                '{"name": "Omar Al-Maghribi", "phone": "+32-489-123-012", "relation": "brother"}'
            ],
            [
                'Khalid Al-Tunisi - East District', '+32-489-123-012', 'east@bakery.com',
                'East Brussels Distribution Center, Belgium', 'BXL-DIST-003', 'van', 'BXL-003-E',
                '{"type": "van", "make": "Ford", "model": "Transit", "capacity_kg": 2200, "fuel_type": "diesel"}',
                1950.00, 3510000.00, 2.25, '2023-03-10', 'active',
                '{"name": "Amina Al-Tunisi", "phone": "+32-489-123-013", "relation": "wife"}'
            ]
        ];

        const insertQuery = `
            INSERT INTO distributors (
                name, phone, email, address, license_number, vehicle_type,
                vehicle_plate, vehicle_info, salary_base_eur, salary_base_syp,
                commission_rate, hire_date, status, emergency_contact
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < distributors.length; i++) {
            await this.connection.execute(insertQuery, distributors[i]);
            console.log(`   ✅ Created distributor: ${distributors[i][0]} (ID: ${i + 1})`);
        }

        console.log(`✅ Created ${distributors.length} distributors successfully!`);
    }

    async seedOrders() {
        console.log('\n📦 Seeding orders...');

        // Create some realistic orders
        const orders = [
            ['ORD-2024-001', 1, 'Hope Supermarket', '2024-03-10', '2024-03-11', 485.50, 873900.00, 25.50, 45900.00, 460.00, 828000.00, 'EUR', 1800.00, 'delivered', 'paid', 'normal', 'Large weekly order', 1, 'System Administrator'],
            ['ORD-2024-002', 2, 'Jasmine Cafe', '2024-03-11', '2024-03-11', 185.20, 333360.00, 5.20, 9360.00, 180.00, 324000.00, 'EUR', 1800.00, 'delivered', 'paid', 'normal', 'Daily fresh products', 4, 'Mohammad Al-Souri'],
            ['ORD-2024-003', 3, 'Damascus Restaurant', '2024-03-09', '2024-03-10', 280.50, 504900.00, 15.50, 27900.00, 265.00, 477000.00, 'EUR', 1800.00, 'delivered', 'paid', 'normal', 'Monthly restaurant order', 5, 'Ali Al-Maghribi'],
            ['ORD-2024-004', 4, 'University Cafeteria', '2024-03-12', '2024-03-13', 650.00, 1170000.00, 30.00, 54000.00, 620.00, 1116000.00, 'EUR', 1800.00, 'delivered', 'paid', 'high', 'Weekly university order', 6, 'Khalid Al-Tunisi'],
            ['ORD-2024-005', 5, 'Golden Hotel Brussels', '2024-03-13', '2024-03-14', 850.00, 1530000.00, 50.00, 90000.00, 800.00, 1440000.00, 'EUR', 1800.00, 'confirmed', 'pending', 'high', 'Premium hotel order', 1, 'System Administrator'],
            ['ORD-2024-006', 6, 'Corner Grocery', '2024-03-11', '2024-03-12', 85.40, 153720.00, 0.00, 0.00, 85.40, 153720.00, 'EUR', 1800.00, 'delivered', 'paid', 'low', 'Small grocery order', 6, 'Khalid Al-Tunisi']
        ];

        const orderInsertQuery = `
            INSERT INTO orders (
                order_number, store_id, store_name, order_date, delivery_date,
                total_amount_eur, total_amount_syp, discount_amount_eur, discount_amount_syp,
                final_amount_eur, final_amount_syp, currency, exchange_rate,
                status, payment_status, priority, notes, created_by, created_by_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < orders.length; i++) {
            await this.connection.execute(orderInsertQuery, orders[i]);
            console.log(`   ✅ Created order: ${orders[i][0]} (ID: ${i + 1})`);
        }

        // Create order items for first few orders
        const orderItems = [
            // Order 1 items
            [1, 1, 'French White Bread', 20, 2.50, 4500.00, 50.00, 90000.00, 0.00, 0.00, 50.00, 90000.00, 20, null],
            [1, 4, 'Butter Croissant', 15, 4.50, 8100.00, 67.50, 121500.00, 0.00, 0.00, 67.50, 121500.00, 15, null],
            [1, 7, 'Vanilla Sponge Cake', 5, 15.00, 27000.00, 75.00, 135000.00, 0.00, 0.00, 75.00, 135000.00, 5, null],

            // Order 2 items  
            [2, 4, 'Butter Croissant', 25, 4.50, 8100.00, 112.50, 202500.00, 0.00, 0.00, 112.50, 202500.00, 25, null],
            [2, 6, 'Pain au Chocolat', 20, 4.80, 8640.00, 96.00, 172800.00, 0.00, 0.00, 96.00, 172800.00, 20, null],

            // Order 3 items
            [3, 1, 'French White Bread', 30, 2.50, 4500.00, 75.00, 135000.00, 0.00, 0.00, 75.00, 135000.00, 30, null],
            [3, 3, 'French Baguette', 25, 3.50, 6300.00, 87.50, 157500.00, 0.00, 0.00, 87.50, 157500.00, 25, null]
        ];

        const itemInsertQuery = `
            INSERT INTO order_items (
                order_id, product_id, product_name, quantity,
                unit_price_eur, unit_price_syp, total_price_eur, total_price_syp,
                discount_amount_eur, discount_amount_syp, final_price_eur, final_price_syp,
                delivered_quantity, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < orderItems.length; i++) {
            await this.connection.execute(itemInsertQuery, orderItems[i]);
        }

        console.log(`✅ Created ${orders.length} orders with ${orderItems.length} order items successfully!`);
    }

    async seedPayments() {
        console.log('\n💰 Seeding payments...');

        const payments = [
            ['PAY-2024-001', '2024-03-11 14:30:00', 1, 'Hope Supermarket', 1, 1, 'Mohammad Al-Souri', 460.00, 828000.00, 'EUR', 1800.00, 'bank_transfer', 'full', 'completed', 'verified', 3, 'Chief Accountant', 1, 'System Administrator', 'Bank transfer completed successfully'],
            ['PAY-2024-002', '2024-03-11 16:00:00', 2, 'Jasmine Cafe', 2, 1, 'Mohammad Al-Souri', 180.00, 324000.00, 'EUR', 1800.00, 'cash', 'full', 'completed', 'verified', 1, 'Mohammad Al-Souri', 4, 'Mohammad Al-Souri', 'Cash payment on delivery'],
            ['PAY-2024-003', '2024-03-10 20:30:00', 3, 'Damascus Restaurant', 3, 2, 'Ali Al-Maghribi', 265.00, 477000.00, 'EUR', 1800.00, 'credit_card', 'full', 'completed', 'verified', 3, 'Chief Accountant', 5, 'Ali Al-Maghribi', 'Credit card payment processed'],
            ['PAY-2024-004', '2024-03-13 11:30:00', 4, 'University Cafeteria', 4, 3, 'Khalid Al-Tunisi', 620.00, 1116000.00, 'EUR', 1800.00, 'bank_transfer', 'full', 'completed', 'verified', 3, 'Chief Accountant', 6, 'Khalid Al-Tunisi', 'University payment confirmed']
        ];

        const insertQuery = `
            INSERT INTO payments (
                payment_number, payment_date, store_id, store_name, order_id,
                distributor_id, distributor_name, amount_eur, amount_syp,
                currency, exchange_rate, payment_method, payment_type,
                status, verification_status, verified_by, verified_by_name,
                created_by, created_by_name, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < payments.length; i++) {
            await this.connection.execute(insertQuery, payments[i]);
            console.log(`   ✅ Created payment: ${payments[i][0]} (ID: ${i + 1})`);
        }

        console.log(`✅ Created ${payments.length} payments successfully!`);
    }

    async seedNotifications() {
        console.log('\n🔔 Seeding notifications...');

        const notifications = [
            [1, 'system', 'high', 'System Initialization Complete', 'The bakery management system has been successfully initialized with comprehensive test data.', '🚀', 0, '/dashboard', '{"system_event": true}'],
            [2, 'order', 'normal', 'New Orders Pending Review', 'There are 5 new orders waiting for confirmation and scheduling.', '📋', 0, '/orders/pending', '{"order_count": 5}'],
            [3, 'payment', 'high', 'Payment Verification Required', 'Multiple payments are pending verification. Please review and approve.', '💰', 0, '/payments/pending', '{"payment_count": 8}'],
            [4, 'delivery', 'normal', 'Daily Route Optimization', 'Your delivery route for today has been optimized. Check your schedule.', '🚚', 1, '/distribution/schedule', '{"route_optimized": true}'],
            [5, 'inventory', 'high', 'Low Stock Alert', 'Several products are running low in stock. Immediate restocking recommended.', '⚠️', 0, '/inventory/low-stock', '{"low_stock_items": 3}']
        ];

        const insertQuery = `
            INSERT INTO notifications (
                user_id, type, priority, title, message, icon, is_read, action_url, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < notifications.length; i++) {
            await this.connection.execute(insertQuery, notifications[i]);
            console.log(`   ✅ Created notification: ${notifications[i][3]}`);
        }

        console.log(`✅ Created ${notifications.length} notifications successfully!`);
    }

    async generateReport() {
        console.log('\n📊 Generating comprehensive report...');

        try {
            // Overall statistics
            const [overallStats] = await this.connection.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM stores) as total_stores,
                    (SELECT COUNT(*) FROM products) as total_products,
                    (SELECT COUNT(*) FROM orders) as total_orders,
                    (SELECT COUNT(*) FROM payments) as total_payments,
                    (SELECT SUM(final_amount_eur) FROM orders) as total_order_value,
                    (SELECT SUM(amount_eur) FROM payments) as total_payments_value
            `);

            const stats = overallStats[0];
            console.log('\n📈 Database Statistics:');
            console.log(`   👥 Total Users: ${stats.total_users}`);
            console.log(`   🏪 Total Stores: ${stats.total_stores}`);
            console.log(`   🍞 Total Products: ${stats.total_products}`);
            console.log(`   📦 Total Orders: ${stats.total_orders}`);
            console.log(`   💰 Total Payments: ${stats.total_payments}`);
            console.log(`   💵 Total Order Value: €${stats.total_order_value ? stats.total_order_value.toFixed(2) : '0.00'}`);
            console.log(`   💸 Total Payments Value: €${stats.total_payments_value ? stats.total_payments_value.toFixed(2) : '0.00'}`);

        } catch (error) {
            console.error('   ❌ Error generating report:', error.message);
        }
    }

    async run() {
        try {
            console.log('🌱 Starting Simple Comprehensive Database Seeding...');
            console.log('='.repeat(60));

            await this.connect();
            await this.clearAllData();
            await this.seedUsers();
            await this.seedProducts();
            await this.seedStores();
            await this.seedDistributors();
            await this.seedOrders();
            await this.seedPayments();
            await this.seedNotifications();
            await this.generateReport();

            console.log('\n' + '='.repeat(60));
            console.log('🎉 COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!');
            console.log('='.repeat(60));
            console.log('');
            console.log('🔐 Login Credentials:');
            console.log('   Admin: admin@bakery.com / admin123');
            console.log('   Manager: manager@bakery.com / admin123');
            console.log('   Accountant: accountant@bakery.com / admin123');
            console.log('   Distributors: north/south/east@bakery.com / admin123');
            console.log('   Store Owners: owner1/2/3@stores.com / admin123');
            console.log('');
            console.log('🌐 API Base URL: https://bakery-management-system-production.up.railway.app/api/');
            console.log('📊 Database: Railway MySQL (Production)');
            console.log('💰 Currency: EUR (Primary), SYP (Secondary)');
            console.log('🔄 Exchange Rate: 1 EUR = 1800 SYP');
            console.log('');
            console.log('🚀 System is ready for testing and demonstration!');

        } catch (error) {
            console.error('❌ Seeding failed:', error.message);
            console.error('Stack trace:', error.stack);
        } finally {
            await this.disconnect();
        }
    }
}

// Run the simple comprehensive seeder
const seeder = new SimpleComprehensiveSeeder();
seeder.run(); 