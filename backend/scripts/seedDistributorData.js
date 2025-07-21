import sequelize from '../config/database.js';
import { connectDB, closeDB } from '../config/database.js';

async function seedDistributorData() {
    try {
        console.log('🌱 Seeding distributor data...\n');

        await connectDB();

        // Check if distributors already exist
        const [existingDistributors] = await sequelize.query("SELECT COUNT(*) as count FROM distributors");

        if (existingDistributors[0].count > 0) {
            console.log(`ℹ️  Found ${existingDistributors[0].count} existing distributors`);
            console.log('   Skipping distributor creation...\n');
        } else {
            console.log('📦 Creating sample distributors...');

            // Create sample distributors
            const distributors = [
                {
                    name: 'أحمد محمد',
                    phone: '+32456123789',
                    email: 'ahmed@bakery.com',
                    address: 'شارع الجامعة، بروكسل',
                    vehicle_type: 'van',
                    vehicle_plate: 'ABC-123',
                    vehicle_info: JSON.stringify({
                        type: 'van',
                        model: 'Mercedes Sprinter',
                        year: 2020,
                        capacity: '500kg',
                        license_plate: 'ABC-123'
                    }),
                    salary_base_eur: 1800,
                    commission_rate: 5.0,
                    hire_date: '2023-01-15',
                    status: 'active'
                },
                {
                    name: 'محمد علي',
                    phone: '+32465789123',
                    email: 'mohamed@bakery.com',
                    address: 'شارع العرب، أنتويرب',
                    vehicle_type: 'truck',
                    vehicle_plate: 'XYZ-456',
                    vehicle_info: JSON.stringify({
                        type: 'truck',
                        model: 'Iveco Daily',
                        year: 2021,
                        capacity: '1000kg',
                        license_plate: 'XYZ-456'
                    }),
                    salary_base_eur: 2000,
                    commission_rate: 4.5,
                    hire_date: '2022-06-10',
                    status: 'active'
                },
                {
                    name: 'سامر حسن',
                    phone: '+32478456123',
                    email: 'samer@bakery.com',
                    address: 'شارع الملك، غنت',
                    vehicle_type: 'van',
                    vehicle_plate: 'DEF-789',
                    vehicle_info: JSON.stringify({
                        type: 'van',
                        model: 'Ford Transit',
                        year: 2022,
                        capacity: '600kg',
                        license_plate: 'DEF-789'
                    }),
                    salary_base_eur: 1900,
                    commission_rate: 5.5,
                    hire_date: '2023-03-20',
                    status: 'active'
                }
            ];

            for (const distributor of distributors) {
                await sequelize.query(`
                    INSERT INTO distributors (
                        name, phone, email, address, vehicle_type, vehicle_plate, 
                        vehicle_info, salary_base_eur, commission_rate, hire_date, status, 
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    distributor.name, distributor.phone, distributor.email,
                    distributor.address, distributor.vehicle_type, distributor.vehicle_plate,
                    distributor.vehicle_info, distributor.salary_base_eur, distributor.commission_rate,
                    distributor.hire_date, distributor.status
                ]);
            }

            console.log(`✅ Created ${distributors.length} distributors`);
        }

        // Check if users with distributor role exist
        console.log('👥 Creating distributor users...');
        const [existingUsers] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE role = 'distributor'");

        if (existingUsers[0].count > 0) {
            console.log(`ℹ️  Found ${existingUsers[0].count} existing distributor users`);
        } else {
            // Create user accounts for distributors
            const distributorUsers = [
                {
                    username: 'ahmed_distributor',
                    email: 'ahmed@bakery.com',
                    password: '$2b$12$vMZ8/E4RZfY3yQv1bRxAzOqYzJfK5j4J1wNhO2yLHb3g1oC5yH8sG', // password: 123456
                    full_name: 'أحمد محمد',
                    phone: '+32456123789',
                    role: 'distributor',
                    status: 'active'
                },
                {
                    username: 'mohamed_distributor',
                    email: 'mohamed@bakery.com',
                    password: '$2b$12$vMZ8/E4RZfY3yQv1bRxAzOqYzJfK5j4J1wNhO2yLHb3g1oC5yH8sG',
                    full_name: 'محمد علي',
                    phone: '+32465789123',
                    role: 'distributor',
                    status: 'active'
                },
                {
                    username: 'samer_distributor',
                    email: 'samer@bakery.com',
                    password: '$2b$12$vMZ8/E4RZfY3yQv1bRxAzOqYzJfK5j4J1wNhO2yLHb3g1oC5yH8sG',
                    full_name: 'سامر حسن',
                    phone: '+32478456123',
                    role: 'distributor',
                    status: 'active'
                }
            ];

            for (const user of distributorUsers) {
                await sequelize.query(`
                    INSERT INTO users (
                        username, email, password, full_name, phone, role, status,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    user.username, user.email, user.password,
                    user.full_name, user.phone, user.role, user.status
                ]);
            }

            console.log(`✅ Created ${distributorUsers.length} distributor user accounts`);
        }

        // Create sample orders if needed
        console.log('📦 Checking existing orders...');
        const [existingOrders] = await sequelize.query("SELECT COUNT(*) as count FROM orders");

        if (existingOrders[0].count < 5) {
            console.log('📦 Creating sample orders...');

            // Get store IDs
            const [stores] = await sequelize.query("SELECT id, name FROM stores LIMIT 5");

            if (stores.length > 0) {
                const sampleOrders = [
                    {
                        order_number: 'ORD-2024-101',
                        store_id: stores[0].id,
                        store_name: stores[0].name,
                        order_date: '2024-01-20',
                        delivery_date: '2024-01-21',
                        total_amount_eur: 285.50,
                        final_amount_eur: 285.50,
                        status: 'confirmed',
                        priority: 'high'
                    },
                    {
                        order_number: 'ORD-2024-102',
                        store_id: stores[1]?.id || stores[0].id,
                        store_name: stores[1]?.name || stores[0].name,
                        order_date: '2024-01-20',
                        delivery_date: '2024-01-22',
                        total_amount_eur: 156.75,
                        final_amount_eur: 156.75,
                        status: 'confirmed',
                        priority: 'normal'
                    },
                    {
                        order_number: 'ORD-2024-103',
                        store_id: stores[2]?.id || stores[0].id,
                        store_name: stores[2]?.name || stores[0].name,
                        order_date: '2024-01-21',
                        delivery_date: '2024-01-22',
                        total_amount_eur: 320.00,
                        final_amount_eur: 320.00,
                        status: 'confirmed',
                        priority: 'normal'
                    }
                ];

                for (const order of sampleOrders) {
                    await sequelize.query(`
                        INSERT INTO orders (
                            order_number, store_id, store_name, order_date, delivery_date,
                            total_amount_eur, final_amount_eur, status, priority,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `, [
                        order.order_number, order.store_id, order.store_name,
                        order.order_date, order.delivery_date,
                        order.total_amount_eur, order.final_amount_eur,
                        order.status, order.priority
                    ]);
                }

                console.log(`✅ Created ${sampleOrders.length} sample orders`);
            } else {
                console.log('⚠️  No stores found. Skipping order creation.');
            }
        } else {
            console.log(`ℹ️  Found ${existingOrders[0].count} existing orders`);
        }

        // Create sample distributor assignments
        console.log('🚚 Creating sample distributor assignments...');
        const [existingAssignments] = await sequelize.query("SELECT COUNT(*) as count FROM distributor_assignments");

        if (existingAssignments[0].count === 0) {
            // Get distributor and order data
            const [distributorsList] = await sequelize.query("SELECT id, name FROM distributors LIMIT 3");
            const [ordersList] = await sequelize.query("SELECT id, order_number, store_id, store_name FROM orders LIMIT 3");

            if (distributorsList.length > 0 && ordersList.length > 0) {
                const assignments = [
                    {
                        distributor_id: distributorsList[0].id,
                        distributor_name: distributorsList[0].name,
                        order_id: ordersList[0].id,
                        order_number: ordersList[0].order_number,
                        store_id: ordersList[0].store_id,
                        store_name: ordersList[0].store_name,
                        store_address: 'Avenue Louise 123, Brussels',
                        assigned_date: '2024-01-20',
                        estimated_delivery: '2024-01-21 14:00:00',
                        status: 'assigned',
                        delivery_priority: 'high'
                    },
                    {
                        distributor_id: distributorsList[1]?.id || distributorsList[0].id,
                        distributor_name: distributorsList[1]?.name || distributorsList[0].name,
                        order_id: ordersList[1]?.id || ordersList[0].id,
                        order_number: ordersList[1]?.order_number || ordersList[0].order_number,
                        store_id: ordersList[1]?.store_id || ordersList[0].store_id,
                        store_name: ordersList[1]?.store_name || ordersList[0].store_name,
                        store_address: 'Rue des Arabes 45, Antwerp',
                        assigned_date: '2024-01-20',
                        estimated_delivery: '2024-01-22 10:00:00',
                        status: 'in_progress',
                        delivery_priority: 'normal'
                    }
                ];

                for (const assignment of assignments) {
                    await sequelize.query(`
                        INSERT INTO distributor_assignments (
                            distributor_id, distributor_name, order_id, order_number,
                            store_id, store_name, store_address, assigned_date,
                            estimated_delivery, status, delivery_priority,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `, [
                        assignment.distributor_id, assignment.distributor_name,
                        assignment.order_id, assignment.order_number,
                        assignment.store_id, assignment.store_name, assignment.store_address,
                        assignment.assigned_date, assignment.estimated_delivery,
                        assignment.status, assignment.delivery_priority
                    ]);
                }

                console.log(`✅ Created ${assignments.length} distributor assignments`);
            }
        } else {
            console.log(`ℹ️  Found ${existingAssignments[0].count} existing assignments`);
        }

        // Create sample delivery schedules
        console.log('📅 Creating sample delivery schedules...');
        const [existingSchedules] = await sequelize.query("SELECT COUNT(*) as count FROM delivery_schedules");

        if (existingSchedules[0].count === 0) {
            const [ordersList2] = await sequelize.query("SELECT id, order_number, store_id, store_name FROM orders LIMIT 3");

            if (ordersList2.length > 0) {
                const schedules = [
                    {
                        order_id: ordersList2[0].id,
                        order_number: ordersList2[0].order_number,
                        store_id: ordersList2[0].store_id,
                        store_name: ordersList2[0].store_name,
                        scheduled_date: '2024-01-21',
                        scheduled_time_start: '14:00:00',
                        scheduled_time_end: '15:00:00',
                        time_slot: 'afternoon',
                        delivery_type: 'standard',
                        status: 'scheduled',
                        delivery_address: 'Avenue Louise 123, Brussels',
                        contact_person: 'خالد أحمد',
                        contact_phone: '+32456789123',
                        delivery_fee_eur: 5.50
                    },
                    {
                        order_id: ordersList2[1]?.id || ordersList2[0].id,
                        order_number: ordersList2[1]?.order_number || ordersList2[0].order_number,
                        store_id: ordersList2[1]?.store_id || ordersList2[0].store_id,
                        store_name: ordersList2[1]?.store_name || ordersList2[0].store_name,
                        scheduled_date: '2024-01-22',
                        scheduled_time_start: '10:00:00',
                        scheduled_time_end: '11:00:00',
                        time_slot: 'morning',
                        delivery_type: 'express',
                        status: 'confirmed',
                        delivery_address: 'Rue des Arabes 45, Antwerp',
                        contact_person: 'سارة محمد',
                        contact_phone: '+32465123789',
                        delivery_fee_eur: 8.00
                    }
                ];

                for (const schedule of schedules) {
                    await sequelize.query(`
                        INSERT INTO delivery_schedules (
                            order_id, order_number, store_id, store_name,
                            scheduled_date, scheduled_time_start, scheduled_time_end,
                            time_slot, delivery_type, status, delivery_address,
                            contact_person, contact_phone, delivery_fee_eur,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `, [
                        schedule.order_id, schedule.order_number,
                        schedule.store_id, schedule.store_name,
                        schedule.scheduled_date, schedule.scheduled_time_start,
                        schedule.scheduled_time_end, schedule.time_slot,
                        schedule.delivery_type, schedule.status,
                        schedule.delivery_address, schedule.contact_person,
                        schedule.contact_phone, schedule.delivery_fee_eur
                    ]);
                }

                console.log(`✅ Created ${schedules.length} delivery schedules`);
            }
        } else {
            console.log(`ℹ️  Found ${existingSchedules[0].count} existing schedules`);
        }

        console.log('\n📊 Final Summary:');
        const [finalDistributors] = await sequelize.query("SELECT COUNT(*) as count FROM distributors");
        const [finalUsers] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE role = 'distributor'");
        const [finalOrders] = await sequelize.query("SELECT COUNT(*) as count FROM orders");
        const [finalAssignments] = await sequelize.query("SELECT COUNT(*) as count FROM distributor_assignments");
        const [finalSchedules] = await sequelize.query("SELECT COUNT(*) as count FROM delivery_schedules");

        console.log(`✅ Distributors: ${finalDistributors[0].count}`);
        console.log(`✅ Distributor users: ${finalUsers[0].count}`);
        console.log(`✅ Orders: ${finalOrders[0].count}`);
        console.log(`✅ Assignments: ${finalAssignments[0].count}`);
        console.log(`✅ Delivery schedules: ${finalSchedules[0].count}`);

        console.log('\n🎉 Distributor data seeding completed successfully!');
        console.log('💡 You can now test the distributor management features.');

        await closeDB();

    } catch (error) {
        console.error('❌ Error seeding distributor data:', error);
        console.error('\nError details:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedDistributorData(); 