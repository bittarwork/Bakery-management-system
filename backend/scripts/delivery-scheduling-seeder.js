import mysql from 'mysql2/promise';

// Database configuration for Railway production
const config = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785,
    multipleStatements: true
};

class DeliverySchedulingSeeder {
    constructor() {
        this.connection = null;
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

    async clearDeliveryData() {
        console.log('\n🧹 Clearing existing delivery schedule data...');

        const tables = ['delivery_schedules', 'distribution_trips', 'store_visits'];

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
        console.log('✅ Delivery schedule data cleared successfully!');
    }

    async seedDistributionTrips() {
        console.log('\n🚚 Creating distribution trips...');

        const trips = [
            // Trip 1: North District - Mohammad Al-Souri
            [
                'TRIP-2024-001', // trip_number
                '2024-03-20', // trip_date
                1, // distributor_id (Mohammad Al-Souri)
                'Mohammad Al-Souri - North District', // distributor_name
                JSON.stringify({
                    type: 'van',
                    make: 'Mercedes',
                    model: 'Sprinter',
                    plate: 'BXL-001-N',
                    capacity: '2500kg'
                }), // vehicle_info
                JSON.stringify({
                    planned_route: [
                        { store_id: 1, order: 1, estimated_arrival: '08:00' },
                        { store_id: 2, order: 2, estimated_arrival: '09:30' }
                    ],
                    total_distance: '45km',
                    estimated_duration: '4 hours'
                }), // route_plan
                '2024-03-20 07:30:00', // planned_start_time
                '2024-03-20 07:35:00', // actual_start_time
                '2024-03-20 12:00:00', // planned_end_time
                '2024-03-20 11:45:00', // actual_end_time
                2, // total_orders
                2, // total_stores
                2, // completed_stores
                645.50, // total_amount_eur
                1161900.00, // total_amount_syp
                'completed', // status
                'Successful delivery run to North District stores', // notes
                2, // created_by (manager)
                'Operations Manager' // created_by_name
            ],

            // Trip 2: South District - Ali Al-Maghribi
            [
                'TRIP-2024-002',
                '2024-03-20',
                2, // distributor_id (Ali Al-Maghribi)
                'Ali Al-Maghribi - South District',
                JSON.stringify({
                    type: 'truck',
                    make: 'Iveco',
                    model: 'Daily',
                    plate: 'BXL-002-S',
                    capacity: '3500kg'
                }),
                JSON.stringify({
                    planned_route: [
                        { store_id: 3, order: 1, estimated_arrival: '09:00' },
                        { store_id: 5, order: 2, estimated_arrival: '11:00' }
                    ],
                    total_distance: '38km',
                    estimated_duration: '5 hours'
                }),
                '2024-03-20 08:00:00',
                '2024-03-20 08:05:00',
                '2024-03-20 13:30:00',
                '2024-03-20 13:15:00',
                2,
                2,
                2,
                1065.00,
                1917000.00,
                'completed',
                'High-value deliveries to restaurant and hotel',
                2,
                'Operations Manager'
            ],

            // Trip 3: East District - Khalid Al-Tunisi
            [
                'TRIP-2024-003',
                '2024-03-20',
                3, // distributor_id (Khalid Al-Tunisi)
                'Khalid Al-Tunisi - East District',
                JSON.stringify({
                    type: 'van',
                    make: 'Ford',
                    model: 'Transit',
                    plate: 'BXL-003-E',
                    capacity: '2200kg'
                }),
                JSON.stringify({
                    planned_route: [
                        { store_id: 4, order: 1, estimated_arrival: '07:00' },
                        { store_id: 6, order: 2, estimated_arrival: '10:30' }
                    ],
                    total_distance: '52km',
                    estimated_duration: '6 hours'
                }),
                '2024-03-20 06:30:00',
                '2024-03-20 06:25:00',
                '2024-03-20 13:00:00',
                '2024-03-20 12:50:00',
                2,
                2,
                2,
                705.40,
                1269720.00,
                'completed',
                'Early morning start for university and small grocery',
                2,
                'Operations Manager'
            ]
        ];

        const insertQuery = `
            INSERT INTO distribution_trips (
                trip_number, trip_date, distributor_id, distributor_name, vehicle_info,
                route_plan, planned_start_time, actual_start_time, planned_end_time, actual_end_time,
                total_orders, total_stores, completed_stores, total_amount_eur, total_amount_syp,
                status, notes, created_by, created_by_name, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (let i = 0; i < trips.length; i++) {
            await this.connection.execute(insertQuery, trips[i]);
            console.log(`   ✅ Created distribution trip: ${trips[i][0]} (ID: ${i + 1})`);
        }

        console.log(`✅ Created ${trips.length} distribution trips successfully!`);
    }

    async seedStoreVisits() {
        console.log('\n🏪 Creating store visits...');

        const visits = [
            // Trip 1 visits (North District)
            [
                1, // trip_id
                1, // store_id (Hope Supermarket)
                'Hope Supermarket', // store_name
                1, // visit_order
                '2024-03-20 08:00:00', // planned_arrival_time
                '2024-03-20 08:05:00', // actual_arrival_time
                '2024-03-20 09:00:00', // planned_departure_time
                '2024-03-20 08:55:00', // actual_departure_time
                'completed', // visit_status
                JSON.stringify({ latitude: 50.8503, longitude: 4.3517, timestamp: '2024-03-20 08:05:00' }), // arrival_location
                JSON.stringify({ latitude: 50.8503, longitude: 4.3517, timestamp: '2024-03-20 08:55:00' }), // departure_location
                1, // order_id
                460.00, // order_value_eur
                828000.00, // order_value_syp
                460.00, // payment_collected_eur
                828000.00, // payment_collected_syp
                true, // delivery_successful
                true, // payment_collected
                null, // problems_encountered
                'Smooth delivery, customer satisfied with products'
            ],
            [
                1, // trip_id
                2, // store_id (Jasmine Cafe)
                'Jasmine Cafe',
                2,
                '2024-03-20 09:30:00',
                '2024-03-20 09:35:00',
                '2024-03-20 10:15:00',
                '2024-03-20 10:10:00',
                'completed',
                JSON.stringify({ latitude: 50.8485, longitude: 4.3525, timestamp: '2024-03-20 09:35:00' }),
                JSON.stringify({ latitude: 50.8485, longitude: 4.3525, timestamp: '2024-03-20 10:10:00' }),
                2,
                180.00,
                324000.00,
                180.00,
                324000.00,
                true,
                true,
                null,
                'Fresh croissants delivered on time for morning rush'
            ],

            // Trip 2 visits (South District)
            [
                2, // trip_id
                3, // store_id (Damascus Restaurant)
                'Damascus Restaurant',
                1,
                '2024-03-20 09:00:00',
                '2024-03-20 09:10:00',
                '2024-03-20 10:30:00',
                '2024-03-20 10:25:00',
                'completed',
                JSON.stringify({ latitude: 50.8263, longitude: 4.3406, timestamp: '2024-03-20 09:10:00' }),
                JSON.stringify({ latitude: 50.8263, longitude: 4.3406, timestamp: '2024-03-20 10:25:00' }),
                3,
                265.00,
                477000.00,
                265.00,
                477000.00,
                true,
                true,
                null,
                'Large bread order for lunch service'
            ],
            [
                2, // trip_id
                5, // store_id (Golden Hotel Brussels)
                'Golden Hotel Brussels',
                2,
                '2024-03-20 11:00:00',
                '2024-03-20 11:15:00',
                '2024-03-20 12:30:00',
                '2024-03-20 12:20:00',
                'completed',
                JSON.stringify({ latitude: 50.8245, longitude: 4.3598, timestamp: '2024-03-20 11:15:00' }),
                JSON.stringify({ latitude: 50.8245, longitude: 4.3598, timestamp: '2024-03-20 12:20:00' }),
                5,
                800.00,
                1440000.00,
                800.00,
                1440000.00,
                true,
                true,
                null,
                'Premium hotel order, special packaging required'
            ],

            // Trip 3 visits (East District)
            [
                3, // trip_id
                4, // store_id (University Cafeteria)
                'University Cafeteria',
                1,
                '2024-03-20 07:00:00',
                '2024-03-20 06:55:00',
                '2024-03-20 08:30:00',
                '2024-03-20 08:25:00',
                'completed',
                JSON.stringify({ latitude: 50.8467, longitude: 4.3720, timestamp: '2024-03-20 06:55:00' }),
                JSON.stringify({ latitude: 50.8467, longitude: 4.3720, timestamp: '2024-03-20 08:25:00' }),
                4,
                620.00,
                1116000.00,
                620.00,
                1116000.00,
                true,
                true,
                null,
                'Early delivery for breakfast service, arrived 5 minutes early'
            ],
            [
                3, // trip_id
                6, // store_id (Corner Grocery)
                'Corner Grocery',
                2,
                '2024-03-20 10:30:00',
                '2024-03-20 10:40:00',
                '2024-03-20 11:00:00',
                '2024-03-20 10:58:00',
                'completed',
                JSON.stringify({ latitude: 50.8345, longitude: 4.3198, timestamp: '2024-03-20 10:40:00' }),
                JSON.stringify({ latitude: 50.8345, longitude: 4.3198, timestamp: '2024-03-20 10:58:00' }),
                6,
                85.40,
                153720.00,
                85.40,
                153720.00,
                true,
                true,
                null,
                'Small order for elderly store owner, helped with unloading'
            ]
        ];

        const insertQuery = `
            INSERT INTO store_visits (
                trip_id, store_id, store_name, visit_order, planned_arrival_time, actual_arrival_time,
                planned_departure_time, actual_departure_time, visit_status, arrival_location, departure_location,
                order_id, order_value_eur, order_value_syp, payment_collected_eur, payment_collected_syp,
                delivery_successful, payment_collected, problems_encountered, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (let i = 0; i < visits.length; i++) {
            await this.connection.execute(insertQuery, visits[i]);
            console.log(`   ✅ Created store visit: ${visits[i][2]} (ID: ${i + 1})`);
        }

        console.log(`✅ Created ${visits.length} store visits successfully!`);
    }

    async seedDeliverySchedules() {
        console.log('\n📅 Creating delivery schedules...');

        const schedules = [
            // Future delivery schedules
            [
                1, // order_id (Hope Supermarket - future order)
                1, // distributor_id (Mohammad Al-Souri)
                '2024-03-21', // scheduled_date
                '08:00:00', // scheduled_time_start
                '09:00:00', // scheduled_time_end
                'morning', // time_slot
                'standard', // delivery_type
                'normal', // priority
                'scheduled', // status
                'Rue de la Lumière 25, 1000 Brussels North, Belgium', // delivery_address
                'Early morning delivery preferred by customer', // delivery_instructions
                'Abdullah Al-Salam', // contact_person
                '+32-489-456-101', // contact_phone
                'hope@supermarket.be', // contact_email
                0.00, // delivery_fee_eur
                0.00, // delivery_fee_syp
                null, // special_requirements
                2, // created_by (manager)
                'Operations Manager', // created_by_name
                null, // updated_by
                null // updated_by_name
            ],
            [
                2, // order_id (Jasmine Cafe - future order)
                1, // distributor_id (Mohammad Al-Souri)
                '2024-03-21',
                '09:30:00',
                '10:30:00',
                'morning',
                'standard',
                'high', // high priority for cafe
                'scheduled',
                'Avenue du Printemps 12, 1000 Brussels North, Belgium',
                'Fresh pastries needed for morning service',
                'Mariam Al-Khadra',
                '+32-489-456-102',
                'jasmine@cafe.be',
                0.00,
                0.00,
                JSON.stringify({
                    'temperature_control': true,
                    'fresh_products_only': true,
                    'special_packaging': false
                }),
                2,
                'Operations Manager',
                null,
                null
            ],
            [
                3, // order_id (Damascus Restaurant - future order)
                2, // distributor_id (Ali Al-Maghribi)
                '2024-03-21',
                '10:00:00',
                '11:30:00',
                'morning',
                'standard',
                'normal',
                'scheduled',
                'Boulevard Al-Sham 45, 1050 Brussels South, Belgium',
                'Delivery to rear entrance, restaurant prep area',
                'Hussam Al-Din',
                '+32-489-456-103',
                'damascus@restaurant.be',
                0.00,
                0.00,
                JSON.stringify({
                    'rear_entrance': true,
                    'loading_dock': true,
                    'special_handling': false
                }),
                2,
                'Operations Manager',
                null,
                null
            ]
        ];

        const insertQuery = `
            INSERT INTO delivery_schedules (
                order_id, distributor_id, scheduled_date, scheduled_time_start, scheduled_time_end,
                time_slot, delivery_type, priority, status, delivery_address, delivery_instructions,
                contact_person, contact_phone, contact_email, delivery_fee_eur, delivery_fee_syp,
                special_requirements, created_by, created_by_name, updated_by, updated_by_name,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        for (let i = 0; i < schedules.length; i++) {
            await this.connection.execute(insertQuery, schedules[i]);
            console.log(`   ✅ Created delivery schedule: Order ${schedules[i][0]} (ID: ${i + 1})`);
        }

        console.log(`✅ Created ${schedules.length} delivery schedules successfully!`);
    }

    async generateDeliveryReport() {
        console.log('\n📊 Generating delivery scheduling report...');

        try {
            // Distribution trips summary
            const [tripsStats] = await this.connection.execute(`
                SELECT 
                    COUNT(*) as total_trips,
                    SUM(total_stores) as total_stores_visited,
                    SUM(completed_stores) as total_completed,
                    SUM(total_amount_eur) as total_delivery_value_eur,
                    AVG(TIMESTAMPDIFF(MINUTE, planned_start_time, actual_end_time)) as avg_trip_duration
                FROM distribution_trips
                WHERE status = 'completed'
            `);

            // Store visits summary
            const [visitsStats] = await this.connection.execute(`
                SELECT 
                    COUNT(*) as total_visits,
                    SUM(CASE WHEN visit_status = 'completed' THEN 1 ELSE 0 END) as successful_visits,
                    SUM(CASE WHEN delivery_successful = 1 THEN 1 ELSE 0 END) as successful_deliveries,
                    SUM(CASE WHEN payment_collected = 1 THEN 1 ELSE 0 END) as payments_collected,
                    AVG(TIMESTAMPDIFF(MINUTE, planned_arrival_time, actual_arrival_time)) as avg_delay_minutes
                FROM store_visits
            `);

            // Future schedules
            const [futureSchedules] = await this.connection.execute(`
                SELECT 
                    COUNT(*) as scheduled_deliveries,
                    COUNT(DISTINCT distributor_id) as distributors_assigned,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_deliveries
                FROM delivery_schedules
                WHERE status = 'scheduled' AND scheduled_date >= CURDATE()
            `);

            const trips = tripsStats[0];
            const visits = visitsStats[0];
            const future = futureSchedules[0];

            console.log('\n📈 Delivery System Performance Report:');
            console.log('='.repeat(50));

            console.log('\n🚚 Distribution Trips:');
            console.log(`   Total Completed Trips: ${trips.total_trips}`);
            console.log(`   Stores Visited: ${trips.total_stores_visited}`);
            console.log(`   Successful Completions: ${trips.total_completed}`);
            console.log(`   Total Delivery Value: €${trips.total_delivery_value_eur ? trips.total_delivery_value_eur.toFixed(2) : '0.00'}`);
            console.log(`   Average Trip Duration: ${trips.avg_trip_duration ? Math.round(trips.avg_trip_duration) : 0} minutes`);

            console.log('\n🏪 Store Visits:');
            console.log(`   Total Visits: ${visits.total_visits}`);
            console.log(`   Successful Visits: ${visits.successful_visits}`);
            console.log(`   Successful Deliveries: ${visits.successful_deliveries}`);
            console.log(`   Payments Collected: ${visits.payments_collected}`);
            console.log(`   Average Delay: ${visits.avg_delay_minutes ? Math.round(visits.avg_delay_minutes) : 0} minutes`);

            console.log('\n📅 Future Schedules:');
            console.log(`   Scheduled Deliveries: ${future.scheduled_deliveries}`);
            console.log(`   Distributors Assigned: ${future.distributors_assigned}`);
            console.log(`   High Priority Deliveries: ${future.high_priority_deliveries}`);

            // Performance metrics
            const visitSuccessRate = visits.total_visits > 0 ? (visits.successful_visits / visits.total_visits * 100).toFixed(1) : 0;
            const deliverySuccessRate = visits.total_visits > 0 ? (visits.successful_deliveries / visits.total_visits * 100).toFixed(1) : 0;
            const paymentCollectionRate = visits.total_visits > 0 ? (visits.payments_collected / visits.total_visits * 100).toFixed(1) : 0;

            console.log('\n📊 Key Performance Indicators:');
            console.log(`   Visit Success Rate: ${visitSuccessRate}%`);
            console.log(`   Delivery Success Rate: ${deliverySuccessRate}%`);
            console.log(`   Payment Collection Rate: ${paymentCollectionRate}%`);

        } catch (error) {
            console.error('   ❌ Error generating report:', error.message);
        }
    }

    async explainDeliverySystem() {
        console.log('\n' + '='.repeat(80));
        console.log('🚀 DELIVERY SCHEDULING SYSTEM - CONCEPT EXPLANATION');
        console.log('='.repeat(80));

        console.log('\n📋 SYSTEM OVERVIEW:');
        console.log('   The Delivery Scheduling System is a comprehensive solution that manages');
        console.log('   the entire delivery process from planning to execution and tracking.');

        console.log('\n🔄 WORKFLOW PROCESS:');
        console.log('   1. ORDER CREATION → Orders are created for stores');
        console.log('   2. TRIP PLANNING → Distribution trips are planned for each distributor');
        console.log('   3. ROUTE OPTIMIZATION → Optimal routes are calculated');
        console.log('   4. SCHEDULE ASSIGNMENT → Delivery schedules are created');
        console.log('   5. EXECUTION → Distributors execute the delivery plan');
        console.log('   6. TRACKING → Real-time tracking of deliveries');
        console.log('   7. COMPLETION → Recording of actual delivery data');

        console.log('\n🏗️ SYSTEM COMPONENTS:');

        console.log('\n   📦 DISTRIBUTION TRIPS:');
        console.log('     • Planned delivery routes for each distributor');
        console.log('     • Vehicle information and capacity management');
        console.log('     • Time planning (start/end times)');
        console.log('     • Route optimization with GPS coordinates');
        console.log('     • Real-time status tracking');

        console.log('\n   🏪 STORE VISITS:');
        console.log('     • Individual store delivery appointments');
        console.log('     • Planned vs actual arrival/departure times');
        console.log('     • GPS location tracking for accountability');
        console.log('     • Payment collection tracking');
        console.log('     • Delivery success/failure recording');
        console.log('     • Problem reporting and notes');

        console.log('\n   📅 DELIVERY SCHEDULES:');
        console.log('     • Future delivery appointments');
        console.log('     • Time slot management (morning/afternoon/evening)');
        console.log('     • Priority levels (low/normal/high/urgent)');
        console.log('     • Special delivery requirements');
        console.log('     • Customer contact information');
        console.log('     • Delivery instructions and preferences');

        console.log('\n💡 KEY FEATURES:');
        console.log('   ✅ Route Optimization - Minimize travel time and distance');
        console.log('   ✅ Real-time Tracking - GPS-based location monitoring');
        console.log('   ✅ Performance Analytics - Delivery success rates and metrics');
        console.log('   ✅ Customer Preferences - Delivery time preferences and instructions');
        console.log('   ✅ Payment Integration - On-delivery payment collection');
        console.log('   ✅ Problem Management - Issue reporting and resolution');
        console.log('   ✅ Multi-currency Support - EUR and SYP pricing');

        console.log('\n📊 BUSINESS BENEFITS:');
        console.log('   • Improved delivery efficiency and time management');
        console.log('   • Better customer satisfaction through reliable scheduling');
        console.log('   • Reduced fuel costs through route optimization');
        console.log('   • Enhanced accountability with GPS tracking');
        console.log('   • Improved cash flow with integrated payment collection');
        console.log('   • Data-driven insights for operational improvement');

        console.log('\n🎯 USE CASES FOR CLIENT DEMONSTRATION:');
        console.log('   1. Show daily distribution planning interface');
        console.log('   2. Demonstrate route optimization on map');
        console.log('   3. Display real-time delivery tracking');
        console.log('   4. Show delivery history and performance metrics');
        console.log('   5. Demonstrate mobile app for distributors');
        console.log('   6. Show customer notification system');

        console.log('\n' + '='.repeat(80));
    }

    async run() {
        try {
            console.log('🌱 Starting Delivery Scheduling System Seeding...');
            console.log('='.repeat(60));

            await this.connect();
            await this.clearDeliveryData();
            await this.seedDistributionTrips();
            await this.seedStoreVisits();
            await this.seedDeliverySchedules();
            await this.generateDeliveryReport();
            await this.explainDeliverySystem();

            console.log('\n' + '='.repeat(60));
            console.log('🎉 DELIVERY SCHEDULING SYSTEM READY FOR DEMONSTRATION!');
            console.log('='.repeat(60));
            console.log('');
            console.log('🌐 API Endpoints for Testing:');
            console.log('   GET /api/distribution/trips - View all trips');
            console.log('   GET /api/distribution/visits - View store visits');
            console.log('   GET /api/delivery/schedules - View future schedules');
            console.log('   GET /api/distribution/tracking - Real-time tracking');
            console.log('');
            console.log('📱 Mobile App Features:');
            console.log('   • Real-time route navigation');
            console.log('   • Delivery confirmation with GPS');
            console.log('   • Payment collection interface');
            console.log('   • Problem reporting system');
            console.log('');
            console.log('🎯 Perfect for Client Demonstration!');

        } catch (error) {
            console.error('❌ Seeding failed:', error.message);
            console.error('Stack trace:', error.stack);
        } finally {
            await this.disconnect();
        }
    }
}

// Run the delivery scheduling seeder
const seeder = new DeliverySchedulingSeeder();
seeder.run(); 