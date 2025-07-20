/**
 * Enhanced Order Management Migration Script
 * Runs the database migration for Phase 6 features using Sequelize
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        console.log('🔄 Starting Enhanced Order Management Migration...');

        // Import database configuration
        const { default: sequelize } = await import('../config/database.js');

        // Read and parse migration SQL file
        const migrationPath = path.join(__dirname, '..', 'migrations', 'create-enhanced-order-features-mysql.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📋 Executing migration SQL...');

        // Split SQL by statements and execute each one
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
            .filter(stmt => !stmt.toLowerCase().startsWith('select \'enhanced order management'));

        // Start transaction
        const transaction = await sequelize.transaction();

        try {
            for (const statement of statements) {
                if (statement.trim()) {
                    console.log(`   Executing: ${statement.substring(0, 50)}...`);
                    await sequelize.query(statement, { transaction });
                }
            }

            // Commit transaction
            await transaction.commit();

            console.log('✅ Enhanced Order Management Migration completed successfully!');
            console.log('📊 Created tables:');
            console.log('   • price_history - للتاريخ المفصل للأسعار');
            console.log('   • pricing_rules - لقواعد التسعير الديناميكي');
            console.log('   • distributor_assignments - لتعيينات الموزعين');
            console.log('   • delivery_schedules - لجدولة التسليم المتقدمة');
            console.log('   • bulk_operations_log - لسجل العمليات المجمعة');
            console.log('🔧 Created indexes and views for optimal performance');
            console.log('🚀 Enhanced Order Management system is ready!');

            // Close database connection
            await sequelize.close();
            process.exit(0);

        } catch (error) {
            // Rollback on error
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error('Stack trace:', error.stack);

        if (error.name === 'SequelizeDatabaseError') {
            console.log('💡 Database Error Details:');
            console.log('   SQL:', error.sql);
            console.log('   Message:', error.message);
        }

        process.exit(1);
    }
}

// Run migration
runMigration(); 