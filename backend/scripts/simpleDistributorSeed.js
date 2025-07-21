import sequelize from '../config/database.js';
import { connectDB, closeDB } from '../config/database.js';

async function simpleDistributorSeed() {
    try {
        console.log('🌱 Adding simple distributor test data...\n');

        await connectDB();

        // Add simple distributor assignments manually
        console.log('🚚 Adding distributor assignments...');

        // First, get some existing orders and distributors
        const [orders] = await sequelize.query("SELECT id, order_number FROM orders LIMIT 3");
        const [distributors] = await sequelize.query("SELECT id, name FROM distributors WHERE name = 'أحمد محمد' LIMIT 1");

        if (orders.length > 0 && distributors.length > 0) {
            const assignmentData = {
                distributor_id: distributors[0].id,
                distributor_name: distributors[0].name,
                order_id: orders[0].id,
                order_number: orders[0].order_number,
                store_id: 1,
                store_name: 'متجر الأمين',
                store_address: 'Avenue Louise 123, Brussels',
                assigned_date: '2024-01-20',
                status: 'assigned',
                delivery_priority: 'high'
            };

            // Check if assignment already exists
            const [existing] = await sequelize.query(
                "SELECT COUNT(*) as count FROM distributor_assignments WHERE distributor_id = ? AND order_id = ?",
                [assignmentData.distributor_id, assignmentData.order_id]
            );

            if (existing[0].count === 0) {
                await sequelize.query(`
                    INSERT INTO distributor_assignments 
                    (distributor_id, distributor_name, order_id, order_number, store_id, store_name, store_address, assigned_date, status, delivery_priority, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    assignmentData.distributor_id,
                    assignmentData.distributor_name,
                    assignmentData.order_id,
                    assignmentData.order_number,
                    assignmentData.store_id,
                    assignmentData.store_name,
                    assignmentData.store_address,
                    assignmentData.assigned_date,
                    assignmentData.status,
                    assignmentData.delivery_priority
                ]);

                console.log('✅ Created distributor assignment');
            } else {
                console.log('ℹ️  Assignment already exists');
            }
        }

        // Add simple delivery schedules
        console.log('📅 Adding delivery schedules...');

        if (orders.length > 0) {
            const scheduleData = {
                order_id: orders[0].id,
                order_number: orders[0].order_number,
                store_id: 1,
                store_name: 'متجر الأمين',
                scheduled_date: '2024-01-21',
                scheduled_time_start: '14:00:00',
                time_slot: 'afternoon',
                delivery_type: 'standard',
                status: 'scheduled',
                delivery_address: 'Avenue Louise 123, Brussels',
                contact_person: 'خالد أحمد',
                contact_phone: '+32456789123'
            };

            const [existingSchedule] = await sequelize.query(
                "SELECT COUNT(*) as count FROM delivery_schedules WHERE order_id = ?",
                [scheduleData.order_id]
            );

            if (existingSchedule[0].count === 0) {
                await sequelize.query(`
                    INSERT INTO delivery_schedules 
                    (order_id, order_number, store_id, store_name, scheduled_date, scheduled_time_start, time_slot, delivery_type, status, delivery_address, contact_person, contact_phone, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    scheduleData.order_id,
                    scheduleData.order_number,
                    scheduleData.store_id,
                    scheduleData.store_name,
                    scheduleData.scheduled_date,
                    scheduleData.scheduled_time_start,
                    scheduleData.time_slot,
                    scheduleData.delivery_type,
                    scheduleData.status,
                    scheduleData.delivery_address,
                    scheduleData.contact_person,
                    scheduleData.contact_phone
                ]);

                console.log('✅ Created delivery schedule');
            } else {
                console.log('ℹ️  Schedule already exists');
            }
        }

        // Summary
        console.log('\n📊 Data Summary:');
        const [distributorCount] = await sequelize.query("SELECT COUNT(*) as count FROM distributors");
        const [assignmentCount] = await sequelize.query("SELECT COUNT(*) as count FROM distributor_assignments");
        const [scheduleCount] = await sequelize.query("SELECT COUNT(*) as count FROM delivery_schedules");
        const [orderCount] = await sequelize.query("SELECT COUNT(*) as count FROM orders");

        console.log(`✅ Distributors: ${distributorCount[0].count}`);
        console.log(`✅ Orders: ${orderCount[0].count}`);
        console.log(`✅ Assignments: ${assignmentCount[0].count}`);
        console.log(`✅ Schedules: ${scheduleCount[0].count}`);

        console.log('\n🎉 Basic test data added successfully!');

        await closeDB();

    } catch (error) {
        console.error('❌ Error adding test data:', error);
        console.error('\nError details:', error.message);
        process.exit(1);
    }
}

// Run the seeding
simpleDistributorSeed(); 