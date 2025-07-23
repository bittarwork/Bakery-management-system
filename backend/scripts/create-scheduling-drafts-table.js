import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration for Railway production
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

async function createSchedulingDraftsTable() {
    let connection;

    try {
        console.log('🔍 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');

        // Check if table exists
        const [tables] = await connection.execute(`
            SHOW TABLES LIKE 'scheduling_drafts'
        `);

        if (tables.length > 0) {
            console.log('✅ scheduling_drafts table already exists');
            return;
        }

        // Create scheduling_drafts table
        console.log('\n📦 Creating scheduling_drafts table...');

        const createTableQuery = `
            CREATE TABLE scheduling_drafts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                suggested_distributor_id INT NOT NULL,
                suggested_distributor_name VARCHAR(100) NOT NULL,
                confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                suggested_delivery_date DATE NOT NULL,
                suggested_priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
                reasoning JSON,
                alternative_suggestions JSON,
                route_optimization JSON,
                estimated_delivery_time TIME,
                estimated_duration INT COMMENT 'Duration in minutes',
                status ENUM('pending_review', 'approved', 'rejected', 'modified') NOT NULL DEFAULT 'pending_review',
                reviewed_by INT NULL,
                reviewed_at TIMESTAMP NULL,
                admin_notes TEXT,
                modifications JSON,
                approved_distributor_id INT NULL,
                approved_delivery_date DATE NULL,
                approved_priority ENUM('low', 'normal', 'high', 'urgent') NULL,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_order_id (order_id),
                INDEX idx_status (status),
                INDEX idx_suggested_distributor_id (suggested_distributor_id),
                INDEX idx_confidence_score (confidence_score),
                INDEX idx_created_at (created_at),
                INDEX idx_suggested_delivery_date (suggested_delivery_date),
                
                UNIQUE KEY unique_order_draft (order_id),
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.execute(createTableQuery);
        console.log('✅ scheduling_drafts table created successfully');

        // Create indexes for better performance
        console.log('\n📊 Creating additional indexes...');

        const indexes = [
            'CREATE INDEX idx_pending_review ON scheduling_drafts (status, created_at) WHERE status = "pending_review"',
            'CREATE INDEX idx_confidence_status ON scheduling_drafts (confidence_score, status)',
            'CREATE INDEX idx_suggested_delivery ON scheduling_drafts (suggested_delivery_date, suggested_distributor_id)'
        ];

        for (const indexQuery of indexes) {
            try {
                await connection.execute(indexQuery);
                console.log(`✅ Index created`);
            } catch (indexError) {
                // MySQL might not support partial indexes, continue
                console.log('⚠️ Skipping specialized index (not supported)');
            }
        }

        console.log('\n🎉 scheduling_drafts table setup completed!');

    } catch (error) {
        console.error('❌ Error creating scheduling_drafts table:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔚 Database connection closed');
        }
    }
}

// Run the script
createSchedulingDraftsTable()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    }); 