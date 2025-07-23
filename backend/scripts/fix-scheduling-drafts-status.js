import mysql from 'mysql2/promise';

// Database configuration for Railway production
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

async function fixSchedulingDraftsStatus() {
    let connection;

    try {
        console.log('🔄 Connecting to Railway database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database successfully');

        // Check if status column exists
        console.log('🔍 Checking current table structure...');
        const [structure] = await connection.execute('DESCRIBE scheduling_drafts');

        const hasStatusColumn = structure.some(column => column.Field === 'status');

        if (hasStatusColumn) {
            console.log('✅ Status column already exists!');
        } else {
            console.log('⚠️ Status column is missing, adding it...');

            // Add status column
            await connection.execute(`
                ALTER TABLE scheduling_drafts 
                ADD COLUMN status ENUM('pending_review', 'approved', 'modified', 'rejected') 
                DEFAULT 'pending_review' 
                AFTER route_optimization
            `);

            console.log('✅ Status column added successfully!');
        }

        // Also ensure we have suggested_delivery_time column
        const hasDeliveryTimeColumn = structure.some(column => column.Field === 'suggested_delivery_time');

        if (!hasDeliveryTimeColumn) {
            console.log('⚠️ suggested_delivery_time column is missing, adding it...');

            await connection.execute(`
                ALTER TABLE scheduling_drafts 
                ADD COLUMN suggested_delivery_time TIME DEFAULT '08:00:00' 
                AFTER suggested_delivery_date
            `);

            console.log('✅ suggested_delivery_time column added successfully!');
        }

        // Show final structure
        console.log('\n📋 Updated table structure:');
        const [finalStructure] = await connection.execute('DESCRIBE scheduling_drafts');
        finalStructure.forEach(column => {
            console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'}`);
        });

        // Add some sample data if table is empty
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM scheduling_drafts');

        if (count[0].count === 0) {
            console.log('\n📝 Adding sample data...');

            await connection.execute(`
                INSERT INTO scheduling_drafts (
                    order_id, suggested_distributor_id, suggested_distributor_name,
                    confidence_score, suggested_delivery_date, suggested_delivery_time,
                    suggested_priority, reasoning, status, created_by
                ) VALUES 
                (1, 4, 'محمد السوري', 85.50, '2024-03-20', '09:00:00', 'normal', 
                 '{"factors": ["distance", "workload", "performance"], "primary_reason": "Optimal route match"}',
                 'pending_review', 1),
                (2, 5, 'علي المغربي', 92.30, '2024-03-21', '10:30:00', 'high',
                 '{"factors": ["urgent_priority", "distributor_availability"], "primary_reason": "High priority order"}',
                 'pending_review', 1)
            `);

            console.log('✅ Sample data added successfully!');
        }

        console.log('\n🎉 Scheduling drafts table is now ready!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);

    } finally {
        if (connection) {
            await connection.end();
            console.log('🔒 Database connection closed');
        }
    }
}

// Run the fix
console.log('🚀 Fixing scheduling_drafts table...');
console.log('📅 Date:', new Date().toISOString());
console.log('🏗️ Target: Railway production database\n');

fixSchedulingDraftsStatus(); 