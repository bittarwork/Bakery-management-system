import sequelize from '../config/database.js';
import { connectDB, closeDB } from '../config/database.js';

async function createMissingDistributorTables() {
    try {
        console.log('🔧 Creating missing distributor tables...\n');

        await connectDB();

        // Create delivery_schedules table
        console.log('📦 Creating delivery_schedules table...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS delivery_schedules (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                order_number VARCHAR(50) NOT NULL,
                store_id INT NOT NULL,
                store_name VARCHAR(255) NOT NULL,
                scheduled_date DATE NOT NULL,
                scheduled_time_start TIME NOT NULL,
                scheduled_time_end TIME NULL,
                time_slot ENUM('morning', 'afternoon', 'evening', 'custom') DEFAULT 'morning',
                delivery_type ENUM('standard', 'express', 'scheduled', 'pickup') DEFAULT 'standard',
                status ENUM('scheduled', 'confirmed', 'in_progress', 'delivered', 'missed', 'rescheduled', 'cancelled') DEFAULT 'scheduled',
                priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
                delivery_address TEXT,
                contact_person VARCHAR(255),
                contact_phone VARCHAR(20),
                special_instructions TEXT,
                delivery_fee_eur DECIMAL(10, 2) DEFAULT 0.00,
                delivery_fee_syp DECIMAL(15, 2) DEFAULT 0.00,
                estimated_duration INT DEFAULT 30,
                actual_delivery_time DATETIME NULL,
                completion_notes TEXT,
                customer_rating TINYINT NULL,
                customer_feedback TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_delivery_date (scheduled_date),
                INDEX idx_order_id (order_id),
                INDEX idx_store_id (store_id),
                INDEX idx_status (status),
                INDEX idx_time_slot (time_slot),
                INDEX idx_delivery_type (delivery_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ delivery_schedules table created successfully');

        // Create distributor_assignments table
        console.log('📦 Creating distributor_assignments table...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS distributor_assignments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                distributor_id INT NOT NULL,
                distributor_name VARCHAR(255) NOT NULL,
                order_id INT NOT NULL,
                order_number VARCHAR(50) NOT NULL,
                store_id INT NOT NULL,
                store_name VARCHAR(255) NOT NULL,
                store_address TEXT,
                assigned_date DATE NOT NULL,
                assignment_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                estimated_delivery DATETIME NULL,
                actual_delivery DATETIME NULL,
                status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'failed', 'cancelled') DEFAULT 'assigned',
                delivery_priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
                route_order INT DEFAULT 1,
                distance_km DECIMAL(8, 2) NULL,
                estimated_duration INT NULL,
                actual_duration INT NULL,
                delivery_notes TEXT,
                problems_encountered TEXT,
                customer_satisfaction TINYINT NULL,
                fuel_cost_eur DECIMAL(8, 2) DEFAULT 0.00,
                other_expenses_eur DECIMAL(8, 2) DEFAULT 0.00,
                commission_earned_eur DECIMAL(8, 2) DEFAULT 0.00,
                gps_start_location JSON NULL,
                gps_end_location JSON NULL,
                created_by INT NULL,
                created_by_name VARCHAR(255) NULL,
                assigned_by INT NULL,
                assigned_by_name VARCHAR(255) NULL,
                cancelled_reason TEXT NULL,
                cancelled_at DATETIME NULL,
                completed_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_distributor_id (distributor_id),
                INDEX idx_order_id (order_id),
                INDEX idx_store_id (store_id),
                INDEX idx_assigned_date (assigned_date),
                INDEX idx_status (status),
                INDEX idx_delivery_priority (delivery_priority),
                INDEX idx_estimated_delivery (estimated_delivery),
                INDEX idx_route_order (route_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ distributor_assignments table created successfully');

        // Verify tables were created
        console.log('\n🔍 Verifying created tables...');
        const [deliveryTables] = await sequelize.query("SHOW TABLES LIKE 'delivery_schedules'");
        const [assignmentTables] = await sequelize.query("SHOW TABLES LIKE 'distributor_assignments'");
        const tables = [...deliveryTables, ...assignmentTables];

        if (tables.length >= 2) {
            console.log('✅ All tables created successfully!');

            // Get table structures
            console.log('\n📋 Table structures:');
            console.log('='.repeat(50));

            const [deliverySchedulesColumns] = await sequelize.query("DESCRIBE delivery_schedules");
            console.log(`📦 delivery_schedules: ${deliverySchedulesColumns.length} columns`);

            const [distributorAssignmentsColumns] = await sequelize.query("DESCRIBE distributor_assignments");
            console.log(`📦 distributor_assignments: ${distributorAssignmentsColumns.length} columns`);

        } else {
            console.log('⚠️  Some tables may not have been created properly');
        }

        console.log('\n📊 Summary:');
        console.log('✅ delivery_schedules table - CREATED');
        console.log('✅ distributor_assignments table - CREATED');
        console.log('\n🎉 All missing distributor tables have been created successfully!');
        console.log('💡 You can now use the distributor management features.');

        await closeDB();

    } catch (error) {
        console.error('❌ Error creating distributor tables:', error);
        console.error('\nError details:', error.message);
        process.exit(1);
    }
}

// Run the creation
createMissingDistributorTables(); 