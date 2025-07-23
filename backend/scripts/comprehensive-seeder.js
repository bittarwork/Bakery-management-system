import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Database configuration for Railway production
const config = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785,
    multipleStatements: true
};

class ComprehensiveSeeder {
    constructor() {
        this.connection = null;
        this.exchangeRate = 1800.00; // EUR to SYP
        this.userIds = [];
        this.storeIds = [];
        this.productIds = [];
        this.orderIds = [];
        this.distributorIds = [];
        this.tripIds = [];
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
            'delivery_tracking',
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

        const users = [
            // Admin Users
            {
                username: 'admin',
                email: 'admin@bakery.com',
                password: await bcrypt.hash('admin123', 12),
                full_name: 'System Administrator',
                phone: '+32-489-123-001',
                role: 'admin',
                status: 'active',
                email_verified: true,
                created_by_name: 'System'
            },
            {
                username: 'manager',
                email: 'manager@bakery.com',
                password: await bcrypt.hash('manager123', 12),
                full_name: 'Operations Manager - Ahmed Hassan',
                phone: '+32-489-123-002',
                role: 'manager',
                status: 'active',
                salary_eur: 2800.00,
                salary_syp: 5040000.00,
                email_verified: true,
                created_by_name: 'System Administrator'
            },
            {
                username: 'accountant',
                email: 'accountant@bakery.com',
                password: await bcrypt.hash('account123', 12),
                full_name: 'Chief Accountant - Fatima Ali',
                phone: '+32-489-123-003',
                role: 'accountant',
                status: 'active',
                salary_eur: 2400.00,
                salary_syp: 4320000.00,
                email_verified: true,
                created_by_name: 'System Administrator'
            },

            // Distributors with vehicles and performance data
            {
                username: 'distributor_north',
                email: 'north@bakery.com',
                password: await bcrypt.hash('dist123', 12),
                full_name: 'Mohammad Al-Souri - North District',
                phone: '+32-489-123-010',
                role: 'distributor',
                status: 'active',
                salary_eur: 2000.00,
                salary_syp: 3600000.00,
                commission_rate: 2.5,
                vehicle_info: JSON.stringify({
                    type: 'van',
                    make: 'Mercedes',
                    model: 'Sprinter',
                    plate: 'BXL-001-N',
                    capacity_kg: 2500,
                    fuel_type: 'diesel',
                    insurance_valid: true
                }),
                total_trips: 48,
                completed_trips: 46,
                total_sales_eur: 18500.00,
                total_sales_syp: 33300000.00,
                performance_rating: 4.85,
                email_verified: true,
                created_by_name: 'Operations Manager'
            },
            {
                username: 'distributor_south',
                email: 'south@bakery.com',
                password: await bcrypt.hash('dist123', 12),
                full_name: 'Ali Al-Maghribi - South District',
                phone: '+32-489-123-011',
                role: 'distributor',
                status: 'active',
                salary_eur: 2000.00,
                salary_syp: 3600000.00,
                commission_rate: 2.75,
                vehicle_info: JSON.stringify({
                    type: 'truck',
                    make: 'Iveco',
                    model: 'Daily',
                    plate: 'BXL-002-S',
                    capacity_kg: 3500,
                    fuel_type: 'diesel',
                    insurance_valid: true
                }),
                total_trips: 42,
                completed_trips: 40,
                total_sales_eur: 21200.00,
                total_sales_syp: 38160000.00,
                performance_rating: 4.70,
                email_verified: true,
                created_by_name: 'Operations Manager'
            },
            {
                username: 'distributor_east',
                email: 'east@bakery.com',
                password: await bcrypt.hash('dist123', 12),
                full_name: 'Khalid Al-Tunisi - East District',
                phone: '+32-489-123-012',
                role: 'distributor',
                status: 'active',
                salary_eur: 1950.00,
                salary_syp: 3510000.00,
                commission_rate: 2.25,
                vehicle_info: JSON.stringify({
                    type: 'van',
                    make: 'Ford',
                    model: 'Transit',
                    plate: 'BXL-003-E',
                    capacity_kg: 2200,
                    fuel_type: 'diesel',
                    insurance_valid: true
                }),
                total_trips: 55,
                completed_trips: 52,
                total_sales_eur: 16800.00,
                total_sales_syp: 30240000.00,
                performance_rating: 4.90,
                email_verified: true,
                created_by_name: 'Operations Manager'
            },

            // Store Owners
            {
                username: 'store_owner_1',
                email: 'owner1@stores.com',
                password: await bcrypt.hash('store123', 12),
                full_name: 'Abdullah Al-Salam - Hope Supermarket Owner',
                phone: '+32-489-123-020',
                role: 'store_owner',
                status: 'active',
                email_verified: true,
                created_by_name: 'Operations Manager'
            },
            {
                username: 'store_owner_2',
                email: 'owner2@stores.com',
                password: await bcrypt.hash('store123', 12),
                full_name: 'Mariam Al-Khadra - Jasmine Cafe Owner',
                phone: '+32-489-123-021',
                role: 'store_owner',
                status: 'active',
                email_verified: true,
                created_by_name: 'Operations Manager'
            },
            {
                username: 'store_owner_3',
                email: 'owner3@stores.com',
                password: await bcrypt.hash('store123', 12),
                full_name: 'Hussam Al-Din - Damascus Restaurant Owner',
                phone: '+32-489-123-022',
                role: 'store_owner',
                status: 'active',
                email_verified: true,
                created_by_name: 'Operations Manager'
            }
        ];

        const insertQuery = `
            INSERT INTO users (
                username, email, password, full_name, phone, role, status,
                salary_eur, salary_syp, commission_rate, vehicle_info,
                total_trips, completed_trips, total_sales_eur, total_sales_syp,
                performance_rating, email_verified, created_by_name,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (const user of users) {
            const [result] = await this.connection.execute(insertQuery, [
                user.username, user.email, user.password, user.full_name,
                user.phone, user.role, user.status, user.salary_eur || null,
                user.salary_syp || null, user.commission_rate || null,
                user.vehicle_info || null, user.total_trips || 0,
                user.completed_trips || 0, user.total_sales_eur || 0.00,
                user.total_sales_syp || 0.00, user.performance_rating || 0.00,
                user.email_verified, user.created_by_name
            ]);

            this.userIds.push(result.insertId);
            if (user.role === 'distributor') {
                this.distributorIds.push(result.insertId);
            }
            console.log(`   ✅ Created user: ${user.username} (ID: ${result.insertId})`);
        }

        console.log(`✅ Created ${users.length} users successfully!`);
    }

    async seedProducts() {
        console.log('\n🍞 Seeding products...');

        const products = [
            // Bread Products
            {
                name: 'French White Bread',
                description: 'Fresh daily French bread made from finest flour',
                category: 'bread',
                unit: 'loaf',
                price_eur: 2.50,
                price_syp: 4500.00,
                cost_eur: 1.20,
                cost_syp: 2160.00,
                stock_quantity: 150,
                minimum_stock: 20,
                barcode: 'BRD001FR',
                weight_grams: 400,
                shelf_life_days: 3,
                is_featured: true,
                status: 'active'
            },
            {
                name: 'Whole Wheat Bread',
                description: 'Healthy whole wheat bread rich in fiber',
                category: 'bread',
                unit: 'loaf',
                price_eur: 3.00,
                price_syp: 5400.00,
                cost_eur: 1.50,
                cost_syp: 2700.00,
                stock_quantity: 100,
                minimum_stock: 15,
                barcode: 'BRD002WW',
                weight_grams: 450,
                shelf_life_days: 4,
                is_featured: true,
                status: 'active'
            },
            {
                name: 'French Baguette',
                description: 'Traditional French baguette with crispy crust',
                category: 'bread',
                unit: 'piece',
                price_eur: 3.50,
                price_syp: 6300.00,
                cost_eur: 1.80,
                cost_syp: 3240.00,
                stock_quantity: 80,
                minimum_stock: 10,
                barcode: 'BRD003BG',
                weight_grams: 250,
                shelf_life_days: 2,
                is_featured: true,
                status: 'active'
            },

            // Pastries
            {
                name: 'Butter Croissant',
                description: 'French croissant made with real butter',
                category: 'pastry',
                unit: 'piece',
                price_eur: 4.50,
                price_syp: 8100.00,
                cost_eur: 2.20,
                cost_syp: 3960.00,
                stock_quantity: 60,
                minimum_stock: 10,
                barcode: 'PST001CR',
                weight_grams: 80,
                shelf_life_days: 2,
                is_featured: true,
                status: 'active'
            },
            {
                name: 'Cheese Danish',
                description: 'Danish pastry filled with cream cheese',
                category: 'pastry',
                unit: 'piece',
                price_eur: 5.20,
                price_syp: 9360.00,
                cost_eur: 2.60,
                cost_syp: 4680.00,
                stock_quantity: 40,
                minimum_stock: 8,
                barcode: 'PST002DN',
                weight_grams: 90,
                shelf_life_days: 2,
                is_featured: false,
                status: 'active'
            },
            {
                name: 'Pain au Chocolat',
                description: 'French pastry with dark chocolate',
                category: 'pastry',
                unit: 'piece',
                price_eur: 4.80,
                price_syp: 8640.00,
                cost_eur: 2.40,
                cost_syp: 4320.00,
                stock_quantity: 45,
                minimum_stock: 8,
                barcode: 'PST003PC',
                weight_grams: 85,
                shelf_life_days: 2,
                is_featured: true,
                status: 'active'
            },

            // Cakes
            {
                name: 'Vanilla Sponge Cake',
                description: 'Classic vanilla sponge cake - small size',
                category: 'cake',
                unit: 'piece',
                price_eur: 15.00,
                price_syp: 27000.00,
                cost_eur: 7.50,
                cost_syp: 13500.00,
                stock_quantity: 12,
                minimum_stock: 3,
                barcode: 'CKE001VN',
                weight_grams: 500,
                shelf_life_days: 5,
                is_featured: true,
                status: 'active'
            },
            {
                name: 'Chocolate Cake',
                description: 'Rich chocolate cake - medium size',
                category: 'cake',
                unit: 'piece',
                price_eur: 18.00,
                price_syp: 32400.00,
                cost_eur: 9.00,
                cost_syp: 16200.00,
                stock_quantity: 8,
                minimum_stock: 2,
                barcode: 'CKE002CH',
                weight_grams: 650,
                shelf_life_days: 5,
                is_featured: true,
                status: 'active'
            },
            {
                name: 'Strawberry Cheesecake',
                description: 'Fresh strawberry cheesecake with cream',
                category: 'cake',
                unit: 'piece',
                price_eur: 25.00,
                price_syp: 45000.00,
                cost_eur: 12.50,
                cost_syp: 22500.00,
                stock_quantity: 6,
                minimum_stock: 2,
                barcode: 'CKE003SC',
                weight_grams: 800,
                shelf_life_days: 3,
                is_featured: true,
                status: 'active'
            },

            // Cookies & Biscuits
            {
                name: 'Chocolate Chip Cookies',
                description: 'Crispy cookies with chocolate chips',
                category: 'snack',
                unit: 'piece',
                price_eur: 2.20,
                price_syp: 3960.00,
                cost_eur: 1.10,
                cost_syp: 1980.00,
                stock_quantity: 200,
                minimum_stock: 30,
                barcode: 'SNK001CC',
                weight_grams: 35,
                shelf_life_days: 7,
                is_featured: false,
                status: 'active'
            },
            {
                name: 'Butter Cookies',
                description: 'Traditional butter cookies',
                category: 'snack',
                unit: 'piece',
                price_eur: 1.80,
                price_syp: 3240.00,
                cost_eur: 0.90,
                cost_syp: 1620.00,
                stock_quantity: 180,
                minimum_stock: 25,
                barcode: 'SNK002BT',
                weight_grams: 30,
                shelf_life_days: 10,
                is_featured: false,
                status: 'active'
            },
            {
                name: 'Almond Macarons',
                description: 'French macarons with various flavors',
                category: 'snack',
                unit: 'piece',
                price_eur: 3.50,
                price_syp: 6300.00,
                cost_eur: 1.75,
                cost_syp: 3150.00,
                stock_quantity: 50,
                minimum_stock: 10,
                barcode: 'SNK003MC',
                weight_grams: 25,
                shelf_life_days: 5,
                is_featured: true,
                status: 'active'
            },

            // Drinks
            {
                name: 'Espresso Coffee',
                description: 'Authentic Italian espresso',
                category: 'drink',
                unit: 'cup',
                price_eur: 2.80,
                price_syp: 5040.00,
                cost_eur: 1.40,
                cost_syp: 2520.00,
                stock_quantity: 0,
                minimum_stock: 0,
                barcode: 'DRK001ES',
                weight_grams: 0,
                shelf_life_days: 0,
                is_featured: false,
                status: 'active'
            },
            {
                name: 'Cappuccino',
                description: 'Cappuccino with steamed milk',
                category: 'drink',
                unit: 'cup',
                price_eur: 3.50,
                price_syp: 6300.00,
                cost_eur: 1.75,
                cost_syp: 3150.00,
                stock_quantity: 0,
                minimum_stock: 0,
                barcode: 'DRK002CP',
                weight_grams: 0,
                shelf_life_days: 0,
                is_featured: true,
                status: 'active'
            },
            {
                name: 'Fresh Orange Juice',
                description: 'Natural 100% orange juice',
                category: 'drink',
                unit: 'glass',
                price_eur: 4.20,
                price_syp: 7560.00,
                cost_eur: 2.10,
                cost_syp: 3780.00,
                stock_quantity: 0,
                minimum_stock: 0,
                barcode: 'DRK003OJ',
                weight_grams: 0,
                shelf_life_days: 0,
                is_featured: false,
                status: 'active'
            }
        ];

        const insertQuery = `
            INSERT INTO products (
                name, description, category, unit, price_eur, price_syp,
                cost_eur, cost_syp, stock_quantity, minimum_stock,
                barcode, weight_grams, shelf_life_days, is_featured, status,
                created_by_name, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (const product of products) {
            const [result] = await this.connection.execute(insertQuery, [
                product.name, product.description, product.category, product.unit,
                product.price_eur, product.price_syp, product.cost_eur, product.cost_syp,
                product.stock_quantity, product.minimum_stock, product.barcode,
                product.weight_grams, product.shelf_life_days, product.is_featured,
                product.status, 'System Administrator'
            ]);

            this.productIds.push(result.insertId);
            console.log(`   ✅ Created product: ${product.name} (ID: ${result.insertId})`);
        }

        console.log(`✅ Created ${products.length} products successfully!`);
    }

    async seedStores() {
        console.log('\n🏪 Seeding stores...');

        const stores = [
            {
                name: 'Hope Supermarket',
                owner_name: 'Abdullah Al-Salam',
                phone: '+32-489-456-101',
                email: 'hope@supermarket.be',
                address: 'Rue de la Lumière 25, 1000 Brussels North, Belgium',
                gps_coordinates: JSON.stringify({
                    latitude: 50.8503,
                    longitude: 4.3517,
                    accuracy: 'high'
                }),
                store_type: 'retail',
                category: 'supermarket',
                size_category: 'large',
                opening_hours: JSON.stringify({
                    monday: '07:00-22:00',
                    tuesday: '07:00-22:00',
                    wednesday: '07:00-22:00',
                    thursday: '07:00-22:00',
                    friday: '07:00-23:00',
                    saturday: '07:00-23:00',
                    sunday: '08:00-21:00'
                }),
                credit_limit_eur: 5000.00,
                credit_limit_syp: 9000000.00,
                current_balance_eur: 1250.00,
                current_balance_syp: 2250000.00,
                total_purchases_eur: 18500.00,
                total_purchases_syp: 33300000.00,
                total_payments_eur: 17250.00,
                total_payments_syp: 31050000.00,
                commission_rate: 2.00,
                payment_terms: 'credit_15_days',
                total_orders: 42,
                completed_orders: 40,
                average_order_value_eur: 285.50,
                average_order_value_syp: 513900.00,
                performance_rating: 4.70,
                status: 'active',
                preferred_delivery_time: '07:00-09:00',
                special_instructions: 'Prefers early delivery, has cold storage, needs advance coordination for large quantities',
                assigned_distributor_id: 4, // North distributor
                assigned_distributor_name: 'Mohammad Al-Souri'
            },
            {
                name: 'Jasmine Cafe',
                owner_name: 'Mariam Al-Khadra',
                phone: '+32-489-456-102',
                email: 'jasmine@cafe.be',
                address: 'Avenue du Printemps 12, 1000 Brussels North, Belgium',
                gps_coordinates: JSON.stringify({
                    latitude: 50.8485,
                    longitude: 4.3525,
                    accuracy: 'high'
                }),
                store_type: 'restaurant',
                category: 'cafe',
                size_category: 'medium',
                opening_hours: JSON.stringify({
                    monday: '06:00-20:00',
                    tuesday: '06:00-20:00',
                    wednesday: '06:00-20:00',
                    thursday: '06:00-20:00',
                    friday: '06:00-22:00',
                    saturday: '07:00-22:00',
                    sunday: '07:00-19:00'
                }),
                credit_limit_eur: 1500.00,
                credit_limit_syp: 2700000.00,
                current_balance_eur: 320.00,
                current_balance_syp: 576000.00,
                total_purchases_eur: 8750.00,
                total_purchases_syp: 15750000.00,
                total_payments_eur: 8430.00,
                total_payments_syp: 15174000.00,
                commission_rate: 3.50,
                payment_terms: 'credit_7_days',
                total_orders: 28,
                completed_orders: 27,
                average_order_value_eur: 165.20,
                average_order_value_syp: 297360.00,
                performance_rating: 4.50,
                status: 'active',
                preferred_delivery_time: '06:00-08:00',
                special_instructions: 'Requests fresh products daily, prefers French bread and croissants',
                assigned_distributor_id: 4, // North distributor
                assigned_distributor_name: 'Mohammad Al-Souri'
            },
            {
                name: 'Damascus Restaurant',
                owner_name: 'Hussam Al-Din',
                phone: '+32-489-456-103',
                email: 'damascus@restaurant.be',
                address: 'Boulevard Al-Sham 45, 1050 Brussels South, Belgium',
                gps_coordinates: JSON.stringify({
                    latitude: 50.8263,
                    longitude: 4.3406,
                    accuracy: 'high'
                }),
                store_type: 'restaurant',
                category: 'restaurant',
                size_category: 'large',
                opening_hours: JSON.stringify({
                    monday: '11:00-23:00',
                    tuesday: '11:00-23:00',
                    wednesday: '11:00-23:00',
                    thursday: '11:00-23:00',
                    friday: '11:00-00:00',
                    saturday: '11:00-00:00',
                    sunday: '12:00-22:00'
                }),
                credit_limit_eur: 3000.00,
                credit_limit_syp: 5400000.00,
                current_balance_eur: 850.00,
                current_balance_syp: 1530000.00,
                total_purchases_eur: 12400.00,
                total_purchases_syp: 22320000.00,
                total_payments_eur: 11550.00,
                total_payments_syp: 20790000.00,
                commission_rate: 2.75,
                payment_terms: 'credit_30_days',
                total_orders: 35,
                completed_orders: 33,
                average_order_value_eur: 220.80,
                average_order_value_syp: 397440.00,
                performance_rating: 4.60,
                status: 'active',
                preferred_delivery_time: '10:00-11:00',
                special_instructions: 'Needs Middle Eastern bread and pastries, delivery from rear, limited parking space',
                assigned_distributor_id: 5, // South distributor
                assigned_distributor_name: 'Ali Al-Maghribi'
            },
            {
                name: 'University Cafeteria',
                owner_name: 'Brussels University Management',
                phone: '+32-489-456-104',
                email: 'cafeteria@university.be',
                address: 'Campus Universitaire 1, 1160 Brussels East, Belgium',
                gps_coordinates: JSON.stringify({
                    latitude: 50.8467,
                    longitude: 4.3720,
                    accuracy: 'high'
                }),
                store_type: 'wholesale',
                category: 'restaurant',
                size_category: 'enterprise',
                opening_hours: JSON.stringify({
                    monday: '07:00-20:00',
                    tuesday: '07:00-20:00',
                    wednesday: '07:00-20:00',
                    thursday: '07:00-20:00',
                    friday: '07:00-18:00',
                    saturday: 'closed',
                    sunday: 'closed'
                }),
                credit_limit_eur: 8000.00,
                credit_limit_syp: 14400000.00,
                current_balance_eur: 2100.00,
                current_balance_syp: 3780000.00,
                total_purchases_eur: 28500.00,
                total_purchases_syp: 51300000.00,
                total_payments_eur: 26400.00,
                total_payments_syp: 47520000.00,
                commission_rate: 1.50,
                payment_terms: 'credit_30_days',
                total_orders: 18,
                completed_orders: 17,
                average_order_value_eur: 680.50,
                average_order_value_syp: 1224900.00,
                performance_rating: 4.85,
                status: 'active',
                preferred_delivery_time: '06:00-08:00',
                special_instructions: 'Large volume orders, needs educational discount, delivery coordination required',
                assigned_distributor_id: 6, // East distributor
                assigned_distributor_name: 'Khalid Al-Tunisi'
            },
            {
                name: 'Golden Hotel Brussels',
                owner_name: 'Hotel Management - Mr. Karim',
                phone: '+32-489-456-105',
                email: 'golden@hotel.be',
                address: 'Royal Avenue 100, 1050 Brussels South, Belgium',
                gps_coordinates: JSON.stringify({
                    latitude: 50.8245,
                    longitude: 4.3598,
                    accuracy: 'high'
                }),
                store_type: 'wholesale',
                category: 'hotel',
                size_category: 'enterprise',
                opening_hours: JSON.stringify({
                    monday: '24/7',
                    tuesday: '24/7',
                    wednesday: '24/7',
                    thursday: '24/7',
                    friday: '24/7',
                    saturday: '24/7',
                    sunday: '24/7'
                }),
                credit_limit_eur: 10000.00,
                credit_limit_syp: 18000000.00,
                current_balance_eur: 3200.00,
                current_balance_syp: 5760000.00,
                total_purchases_eur: 35000.00,
                total_purchases_syp: 63000000.00,
                total_payments_eur: 31800.00,
                total_payments_syp: 57240000.00,
                commission_rate: 1.25,
                payment_terms: 'credit_30_days',
                total_orders: 24,
                completed_orders: 23,
                average_order_value_eur: 850.00,
                average_order_value_syp: 1530000.00,
                performance_rating: 4.95,
                status: 'active',
                preferred_delivery_time: '05:00-07:00',
                special_instructions: 'Premium products required, multiple daily deliveries, has loading dock',
                assigned_distributor_id: 5, // South distributor
                assigned_distributor_name: 'Ali Al-Maghribi'
            },
            {
                name: 'Corner Grocery',
                owner_name: 'Um Mohammad - Palestinian Lady',
                phone: '+32-489-456-106',
                email: 'corner@grocery.be',
                address: 'Palestine Street 8, 1070 Brussels West, Belgium',
                gps_coordinates: JSON.stringify({
                    latitude: 50.8345,
                    longitude: 4.3198,
                    accuracy: 'medium'
                }),
                store_type: 'retail',
                category: 'grocery',
                size_category: 'small',
                opening_hours: JSON.stringify({
                    monday: '08:00-20:00',
                    tuesday: '08:00-20:00',
                    wednesday: '08:00-20:00',
                    thursday: '08:00-20:00',
                    friday: '08:00-21:00',
                    saturday: '08:00-21:00',
                    sunday: '09:00-18:00'
                }),
                credit_limit_eur: 800.00,
                credit_limit_syp: 1440000.00,
                current_balance_eur: 150.00,
                current_balance_syp: 270000.00,
                total_purchases_eur: 3200.00,
                total_purchases_syp: 5760000.00,
                total_payments_eur: 3050.00,
                total_payments_syp: 5490000.00,
                commission_rate: 1.50,
                payment_terms: 'cash',
                total_orders: 18,
                completed_orders: 17,
                average_order_value_eur: 95.40,
                average_order_value_syp: 171720.00,
                performance_rating: 4.20,
                status: 'active',
                preferred_delivery_time: '08:00-09:00',
                special_instructions: 'Small shop, limited quantities, cash only, elderly lady owner',
                assigned_distributor_id: 6, // East distributor
                assigned_distributor_name: 'Khalid Al-Tunisi'
            }
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
                assigned_distributor_name, created_by, created_by_name, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (const store of stores) {
            const [result] = await this.connection.execute(insertQuery, [
                store.name, store.owner_name, store.phone, store.email,
                store.address, store.gps_coordinates, store.store_type, store.category,
                store.size_category, store.opening_hours, store.credit_limit_eur,
                store.credit_limit_syp, store.current_balance_eur, store.current_balance_syp,
                store.total_purchases_eur, store.total_purchases_syp, store.total_payments_eur,
                store.total_payments_syp, store.commission_rate, store.payment_terms,
                store.total_orders, store.completed_orders, store.average_order_value_eur,
                store.average_order_value_syp, store.performance_rating, store.status,
                store.preferred_delivery_time, store.special_instructions,
                store.assigned_distributor_id, store.assigned_distributor_name,
                1, 'System Administrator'
            ]);

            this.storeIds.push(result.insertId);
            console.log(`   ✅ Created store: ${store.name} (ID: ${result.insertId})`);
        }

        console.log(`✅ Created ${stores.length} stores successfully!`);
    }

    async seedDistributors() {
        console.log('\n🚚 Seeding distributors...');

        const distributors = [
            {
                name: 'Mohammad Al-Souri - North District',
                phone: '+32-489-123-010',
                email: 'north@bakery.com',
                address: 'North Brussels Distribution Center, Belgium',
                license_number: 'BXL-DIST-001',
                vehicle_type: 'van',
                vehicle_plate: 'BXL-001-N',
                vehicle_info: JSON.stringify({
                    type: 'van',
                    make: 'Mercedes',
                    model: 'Sprinter',
                    capacity_kg: 2500,
                    fuel_type: 'diesel'
                }),
                status: 'active',
                hire_date: '2023-01-15',
                salary_eur: 2000.00,
                salary_syp: 3600000.00,
                commission_rate: 2.50,
                emergency_contact: {
                    name: 'Fatima Al-Souri',
                    phone: '+32-489-123-011',
                    relation: 'spouse'
                }
            },
            {
                name: 'Ali Al-Maghribi - South District',
                phone: '+32-489-123-011',
                email: 'south@bakery.com',
                address: 'South Brussels Distribution Center, Belgium',
                license_number: 'BXL-DIST-002',
                vehicle_type: 'truck',
                vehicle_plate: 'BXL-002-S',
                vehicle_info: JSON.stringify({
                    type: 'truck',
                    make: 'Iveco',
                    model: 'Daily',
                    capacity_kg: 3500,
                    fuel_type: 'diesel'
                }),
                status: 'active',
                hire_date: '2023-02-20',
                salary_eur: 2000.00,
                salary_syp: 3600000.00,
                commission_rate: 2.75,
                emergency_contact: {
                    name: 'Omar Al-Maghribi',
                    phone: '+32-489-123-012',
                    relation: 'brother'
                }
            },
            {
                name: 'Khalid Al-Tunisi - East District',
                phone: '+32-489-123-012',
                email: 'east@bakery.com',
                address: 'East Brussels Distribution Center, Belgium',
                license_number: 'BXL-DIST-003',
                vehicle_type: 'van',
                vehicle_plate: 'BXL-003-E',
                vehicle_info: JSON.stringify({
                    type: 'van',
                    make: 'Ford',
                    model: 'Transit',
                    capacity_kg: 2200,
                    fuel_type: 'diesel'
                }),
                status: 'active',
                hire_date: '2023-03-10',
                salary_eur: 1950.00,
                salary_syp: 3510000.00,
                commission_rate: 2.25,
                emergency_contact: {
                    name: 'Amina Al-Tunisi',
                    phone: '+32-489-123-013',
                    relation: 'wife'
                }
            }
        ];

        const insertQuery = `
            INSERT INTO distributors (
                name, phone, email, address, license_number, vehicle_type,
                vehicle_plate, vehicle_info, status, hire_date,
                salary_base_eur, salary_base_syp, commission_rate, emergency_contact,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (const distributor of distributors) {
            const [result] = await this.connection.execute(insertQuery, [
                distributor.name, distributor.phone, distributor.email, distributor.address,
                distributor.license_number, distributor.vehicle_type, distributor.vehicle_plate,
                distributor.vehicle_info, distributor.status, distributor.hire_date,
                distributor.salary_eur, distributor.salary_syp, distributor.commission_rate,
                JSON.stringify(distributor.emergency_contact)
            ]);

            console.log(`   ✅ Created distributor: ${distributor.name} (ID: ${result.insertId})`);
        }

        console.log(`✅ Created ${distributors.length} distributors successfully!`);
    }

    async seedOrders() {
        console.log('\n📦 Seeding orders and order items...');

        const orders = [];
        const orderItems = [];
        let orderNumber = 1;

        // Generate realistic orders for each store
        for (const storeId of this.storeIds) {
            const numOrders = Math.floor(Math.random() * 8) + 3; // 3-10 orders per store

            for (let i = 0; i < numOrders; i++) {
                const orderDate = new Date();
                orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

                const deliveryDate = new Date(orderDate);
                deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 days later

                const order = {
                    order_number: `ORD-2024-${String(orderNumber).padStart(3, '0')}`,
                    store_id: storeId,
                    store_name: `Store ${storeId}`, // Will be updated based on actual store names
                    order_date: orderDate.toISOString().split('T')[0],
                    delivery_date: deliveryDate.toISOString().split('T')[0],
                    status: ['delivered', 'delivered', 'delivered', 'confirmed', 'prepared'][Math.floor(Math.random() * 5)],
                    payment_status: ['paid', 'paid', 'partial', 'pending'][Math.floor(Math.random() * 4)],
                    priority: ['normal', 'normal', 'high', 'low'][Math.floor(Math.random() * 4)],
                    currency: 'EUR',
                    exchange_rate: this.exchangeRate,
                    notes: [
                        'Regular weekly order',
                        'Special request for weekend event',
                        'Rush order for immediate delivery',
                        'Standard monthly order',
                        'Custom order with specific requirements'
                    ][Math.floor(Math.random() * 5)],
                    created_by: this.userIds[Math.floor(Math.random() * 3) + 1], // Random manager/admin
                    created_by_name: 'System Administrator'
                };

                orders.push(order);

                // Generate 2-6 order items per order
                const numItems = Math.floor(Math.random() * 5) + 2;
                let totalAmountEur = 0;
                let totalAmountSyp = 0;

                for (let j = 0; j < numItems; j++) {
                    const productId = this.productIds[Math.floor(Math.random() * this.productIds.length)];
                    const quantity = Math.floor(Math.random() * 10) + 1;

                    // Get product price (simplified - using average prices)
                    const unitPriceEur = 2.50 + Math.random() * 20; // Random price between 2.50-22.50
                    const unitPriceSyp = unitPriceEur * this.exchangeRate;
                    const totalPriceEur = unitPriceEur * quantity;
                    const totalPriceSyp = unitPriceSyp * quantity;

                    totalAmountEur += totalPriceEur;
                    totalAmountSyp += totalPriceSyp;

                    orderItems.push({
                        order_id: orderNumber, // Will be updated with actual order ID
                        product_id: productId,
                        product_name: `Product ${productId}`,
                        quantity: quantity,
                        unit_price_eur: unitPriceEur,
                        unit_price_syp: unitPriceSyp,
                        total_price_eur: totalPriceEur,
                        total_price_syp: totalPriceSyp,
                        discount_amount_eur: 0.00,
                        discount_amount_syp: 0.00,
                        final_price_eur: totalPriceEur,
                        final_price_syp: totalPriceSyp,
                        delivered_quantity: order.status === 'delivered' ? quantity : 0,
                        notes: Math.random() > 0.7 ? 'Special handling required' : null,
                    });
                }

                // Apply order-level discount (0-10%)
                const discountRate = Math.random() * 0.1;
                const discountAmountEur = totalAmountEur * discountRate;
                const discountAmountSyp = totalAmountSyp * discountRate;
                const finalAmountEur = totalAmountEur - discountAmountEur;
                const finalAmountSyp = totalAmountSyp - discountAmountSyp;

                order.total_amount_eur = Math.round(totalAmountEur * 100) / 100;
                order.total_amount_syp = Math.round(totalAmountSyp * 100) / 100;
                order.discount_amount_eur = Math.round(discountAmountEur * 100) / 100;
                order.discount_amount_syp = Math.round(discountAmountSyp * 100) / 100;
                order.final_amount_eur = Math.round(finalAmountEur * 100) / 100;
                order.final_amount_syp = Math.round(finalAmountSyp * 100) / 100;

                orderNumber++;
            }
        }

        // Insert orders
        const orderInsertQuery = `
            INSERT INTO orders (
                order_number, store_id, store_name, order_date, delivery_date,
                total_amount_eur, total_amount_syp, discount_amount_eur, discount_amount_syp,
                final_amount_eur, final_amount_syp, status, payment_status, priority,
                currency, exchange_rate, notes, created_by, created_by_name,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (const order of orders) {
            const [result] = await this.connection.execute(orderInsertQuery, [
                order.order_number, order.store_id, order.store_name, order.order_date,
                order.delivery_date, order.total_amount_eur, order.total_amount_syp,
                order.discount_amount_eur, order.discount_amount_syp, order.final_amount_eur,
                order.final_amount_syp, order.status, order.payment_status, order.priority,
                order.currency, order.exchange_rate, order.notes, order.created_by,
                order.created_by_name
            ]);

            this.orderIds.push(result.insertId);
            console.log(`   ✅ Created order: ${order.order_number} (ID: ${result.insertId})`);
        }

        // Insert order items
        const itemInsertQuery = `
            INSERT INTO order_items (
                order_id, product_id, product_name, quantity,
                unit_price_eur, unit_price_syp, total_price_eur, total_price_syp,
                discount_amount_eur, discount_amount_syp, final_price_eur, final_price_syp,
                delivered_quantity, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (let i = 0; i < orderItems.length; i++) {
            const item = orderItems[i];
            const actualOrderId = this.orderIds[Math.floor(i / 4)]; // Approximate mapping

            await this.connection.execute(itemInsertQuery, [
                actualOrderId, item.product_id, item.product_name, item.quantity,
                item.unit_price_eur, item.unit_price_syp, item.total_price_eur, item.total_price_syp,
                item.discount_amount_eur, item.discount_amount_syp, item.final_price_eur,
                item.final_price_syp, item.delivered_quantity, item.notes || null
            ]);
        }

        console.log(`✅ Created ${orders.length} orders with ${orderItems.length} order items successfully!`);
    }

    async seedPayments() {
        console.log('\n💰 Seeding payments...');

        const payments = [];
        let paymentNumber = 1;

        // Generate payments for delivered orders
        for (const orderId of this.orderIds) {
            if (Math.random() > 0.3) { // 70% of orders have payments
                const amount = 100 + Math.random() * 500; // Random amount
                const amountEur = Math.round(amount * 100) / 100;
                const amountSyp = Math.round(amountEur * this.exchangeRate * 100) / 100;

                const payment = {
                    payment_number: `PAY-2024-${String(paymentNumber).padStart(3, '0')}`,
                    payment_date: new Date(Date.now() - Math.random() * 2592000000), // Last 30 days
                    store_id: this.storeIds[Math.floor(Math.random() * this.storeIds.length)],
                    store_name: `Store ${Math.floor(Math.random() * this.storeIds.length) + 1}`,
                    order_id: orderId,
                    distributor_id: Math.floor(Math.random() * 3) + 1, // IDs 1,2,3 from distributors table
                    distributor_name: 'Distributor Name',
                    amount_eur: amountEur,
                    amount_syp: amountSyp,
                    currency: 'EUR',
                    exchange_rate: this.exchangeRate,
                    payment_method: ['cash', 'bank_transfer', 'credit_card', 'check'][Math.floor(Math.random() * 4)],
                    payment_type: ['full', 'full', 'partial'][Math.floor(Math.random() * 3)],
                    status: ['completed', 'completed', 'completed', 'pending'][Math.floor(Math.random() * 4)],
                    verification_status: ['verified', 'verified', 'pending'][Math.floor(Math.random() * 3)],
                    verified_by: 3, // Accountant
                    verified_by_name: 'Chief Accountant - Fatima Ali',
                    receipt_generated: true,
                    notes: [
                        'Regular payment',
                        'Cash payment on delivery',
                        'Bank transfer confirmed',
                        'Partial payment - balance pending'
                    ][Math.floor(Math.random() * 4)],
                    created_by: Math.floor(Math.random() * 3) + 4, // User IDs 4,5,6 (distributors)
                    created_by_name: 'Distributor'
                };

                payments.push(payment);
                paymentNumber++;
            }
        }

        const insertQuery = `
            INSERT INTO payments (
                payment_number, payment_date, store_id, store_name, order_id,
                distributor_id, distributor_name, amount_eur, amount_syp,
                currency, exchange_rate, payment_method, payment_type,
                status, verification_status, verified_by, verified_by_name,
                receipt_generated, notes, created_by, created_by_name,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (const payment of payments) {
            await this.connection.execute(insertQuery, [
                payment.payment_number, payment.payment_date, payment.store_id,
                payment.store_name, payment.order_id, payment.distributor_id,
                payment.distributor_name, payment.amount_eur, payment.amount_syp,
                payment.currency, payment.exchange_rate, payment.payment_method,
                payment.payment_type, payment.status, payment.verification_status,
                payment.verified_by, payment.verified_by_name, payment.receipt_generated,
                payment.notes, payment.created_by, payment.created_by_name
            ]);

            console.log(`   ✅ Created payment: ${payment.payment_number}`);
        }

        console.log(`✅ Created ${payments.length} payments successfully!`);
    }

    async seedNotifications() {
        console.log('\n🔔 Seeding notifications...');

        const notifications = [
            {
                user_id: 1, // Admin
                type: 'system',
                priority: 'high',
                title: 'System Initialization Complete',
                message: 'The bakery management system has been successfully initialized with comprehensive test data.',
                icon: '🚀',
                is_read: false,
                action_url: '/dashboard',
                metadata: JSON.stringify({ system_event: true })
            },
            {
                user_id: 2, // Manager
                type: 'order',
                priority: 'normal',
                title: 'New Orders Pending Review',
                message: 'There are 5 new orders waiting for confirmation and scheduling.',
                icon: '📋',
                is_read: false,
                action_url: '/orders/pending',
                metadata: JSON.stringify({ order_count: 5 })
            },
            {
                user_id: 3, // Accountant
                type: 'payment',
                priority: 'high',
                title: 'Payment Verification Required',
                message: 'Multiple payments are pending verification. Please review and approve.',
                icon: '💰',
                is_read: false,
                action_url: '/payments/pending',
                metadata: JSON.stringify({ payment_count: 8 })
            },
            {
                user_id: 4, // North Distributor
                type: 'delivery',
                priority: 'normal',
                title: 'Daily Route Optimization',
                message: 'Your delivery route for today has been optimized. Check your schedule.',
                icon: '🚚',
                is_read: true,
                action_url: '/distribution/schedule',
                metadata: JSON.stringify({ route_optimized: true })
            },
            {
                user_id: 5, // South Distributor
                type: 'inventory',
                priority: 'high',
                title: 'Low Stock Alert',
                message: 'Several products are running low in stock. Immediate restocking recommended.',
                icon: '⚠️',
                is_read: false,
                action_url: '/inventory/low-stock',
                metadata: JSON.stringify({ low_stock_items: 3 })
            }
        ];

        const insertQuery = `
            INSERT INTO notifications (
                user_id, type, priority, title, message, icon, is_read,
                action_url, metadata, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (const notification of notifications) {
            await this.connection.execute(insertQuery, [
                notification.user_id, notification.type, notification.priority,
                notification.title, notification.message, notification.icon,
                notification.is_read, notification.action_url, notification.metadata
            ]);

            console.log(`   ✅ Created notification: ${notification.title}`);
        }

        console.log(`✅ Created ${notifications.length} notifications successfully!`);
    }

    async generateReport() {
        console.log('\n📊 Generating comprehensive report...');

        try {
            // Users summary
            const [users] = await this.connection.execute(`
                SELECT role, COUNT(*) as count, 
                       AVG(performance_rating) as avg_rating
                FROM users 
                GROUP BY role
            `);

            console.log('\n👥 Users Summary:');
            users.forEach(user => {
                console.log(`   ${user.role}: ${user.count} users (Avg Rating: ${user.avg_rating ? user.avg_rating.toFixed(2) : 'N/A'})`);
            });

            // Products summary
            const [products] = await this.connection.execute(`
                SELECT category, COUNT(*) as count,
                       AVG(price_eur) as avg_price_eur,
                       SUM(stock_quantity) as total_stock
                FROM products 
                GROUP BY category
            `);

            console.log('\n🍞 Products Summary:');
            products.forEach(product => {
                console.log(`   ${product.category}: ${product.count} items (Avg: €${product.avg_price_eur.toFixed(2)}, Stock: ${product.total_stock})`);
            });

            // Stores summary
            const [stores] = await this.connection.execute(`
                SELECT category, COUNT(*) as count,
                       AVG(current_balance_eur) as avg_balance,
                       SUM(total_purchases_eur) as total_purchases
                FROM stores 
                GROUP BY category
            `);

            console.log('\n🏪 Stores Summary:');
            stores.forEach(store => {
                console.log(`   ${store.category}: ${store.count} stores (Avg Balance: €${store.avg_balance.toFixed(2)}, Total Purchases: €${store.total_purchases.toFixed(2)})`);
            });

            // Orders summary
            const [orders] = await this.connection.execute(`
                SELECT status, COUNT(*) as count,
                       SUM(final_amount_eur) as total_amount
                FROM orders 
                GROUP BY status
            `);

            console.log('\n📦 Orders Summary:');
            orders.forEach(order => {
                console.log(`   ${order.status}: ${order.count} orders (Total: €${order.total_amount.toFixed(2)})`);
            });

            // Payments summary
            const [payments] = await this.connection.execute(`
                SELECT payment_method, COUNT(*) as count,
                       SUM(amount_eur) as total_amount
                FROM payments 
                GROUP BY payment_method
            `);

            console.log('\n💰 Payments Summary:');
            payments.forEach(payment => {
                console.log(`   ${payment.payment_method}: ${payment.count} payments (Total: €${payment.total_amount.toFixed(2)})`);
            });

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
            console.log('\n📈 Overall Statistics:');
            console.log(`   Total Users: ${stats.total_users}`);
            console.log(`   Total Stores: ${stats.total_stores}`);
            console.log(`   Total Products: ${stats.total_products}`);
            console.log(`   Total Orders: ${stats.total_orders}`);
            console.log(`   Total Payments: ${stats.total_payments}`);
            console.log(`   Total Order Value: €${stats.total_order_value ? stats.total_order_value.toFixed(2) : '0.00'}`);
            console.log(`   Total Payments Value: €${stats.total_payments_value ? stats.total_payments_value.toFixed(2) : '0.00'}`);

        } catch (error) {
            console.error('   ❌ Error generating report:', error.message);
        }
    }

    async run() {
        try {
            console.log('🌱 Starting Comprehensive Database Seeding...');
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
            console.log('   Manager: manager@bakery.com / manager123');
            console.log('   Accountant: accountant@bakery.com / account123');
            console.log('   Distributors: */dist123 (north/south/east)');
            console.log('   Store Owners: */store123');
            console.log('');
            console.log('🌐 API Base URL: https://bakery-management-system-production.up.railway.app/api/');
            console.log('📊 Database: Railway MySQL (Production)');
            console.log('💰 Currency: EUR (Primary), SYP (Secondary)');
            console.log('🔄 Exchange Rate: 1 EUR = 1800 SYP');

        } catch (error) {
            console.error('❌ Seeding failed:', error.message);
            console.error('Stack trace:', error.stack);
        } finally {
            await this.disconnect();
        }
    }
}

// Run the comprehensive seeder
const seeder = new ComprehensiveSeeder();
seeder.run(); 