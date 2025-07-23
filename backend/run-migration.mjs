import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration for Railway production
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

async function runSchedulingMigration() {
    console.log('🚀 Starting Auto-Scheduling Migration...\n');

    let connection;

    try {
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database successfully');

        // Create table first
        console.log('📊 Creating scheduling_drafts table...');

        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS scheduling_drafts (
            id INT(11) NOT NULL AUTO_INCREMENT,
            order_id INT(11) NOT NULL,
            suggested_distributor_id INT(11) NOT NULL,
            suggested_distributor_name VARCHAR(255) NOT NULL,
            confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            suggested_delivery_date DATE NOT NULL,
            suggested_priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
            reasoning JSON DEFAULT NULL COMMENT 'AI reasoning for distributor selection',
            alternative_suggestions JSON DEFAULT NULL COMMENT 'Alternative distributor suggestions',
            route_optimization JSON DEFAULT NULL COMMENT 'Route optimization information',
            estimated_delivery_time TIME DEFAULT NULL,
            estimated_duration INT(11) DEFAULT NULL COMMENT 'Estimated duration in minutes',
            status ENUM('pending_review', 'reviewed', 'approved', 'rejected', 'modified') DEFAULT 'pending_review',
            admin_notes TEXT DEFAULT NULL,
            modifications JSON DEFAULT NULL COMMENT 'Admin modifications to the suggestion',
            approved_distributor_id INT(11) DEFAULT NULL,
            approved_delivery_date DATE DEFAULT NULL,
            approved_priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT NULL,
            created_by INT(11) NOT NULL,
            reviewed_by INT(11) DEFAULT NULL,
            reviewed_at DATETIME DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_order_draft (order_id),
            KEY idx_status (status),
            KEY idx_suggested_distributor (suggested_distributor_id),
            KEY idx_delivery_date (suggested_delivery_date),
            KEY idx_confidence_score (confidence_score),
            KEY idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await connection.execute(createTableSQL);
        console.log('✅ Table created successfully');

        // Verify table creation
        console.log('🔍 Verifying table structure...');

        const [tableInfo] = await connection.execute(`DESCRIBE scheduling_drafts`);

        console.log('\n📋 Table structure:');
        console.table(tableInfo.map(field => ({
            Field: field.Field,
            Type: field.Type,
            Null: field.Null,
            Key: field.Key,
            Default: field.Default
        })));

        console.log('\n🎉 Auto-Scheduling Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Test creating a new order to trigger auto-scheduling');
        console.log('   2. Check the admin dashboard for pending reviews');
        console.log('   3. Test the approval/rejection workflow');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('⚠️  Table already exists!');
        } else {
            console.error('Stack trace:', error.stack);
            process.exit(1);
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run migration
runSchedulingMigration(); 