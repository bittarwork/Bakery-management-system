import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Apply distribution system migration
 * This script creates all necessary tables for the daily distribution management system
 */
const applyDistributionMigration = async () => {
    try {
        console.log('🚚 Starting distribution system migration...');
        
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, '../migrations/create-distribution-system-tables.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📋 Migration file loaded successfully');
        
        // Split the SQL into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📊 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        let executedCount = 0;
        let errorCount = 0;
        
        for (const statement of statements) {
            try {
                if (statement.trim()) {
                    await sequelize.query(statement);
                    executedCount++;
                    console.log(`✅ Executed statement ${executedCount}/${statements.length}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`❌ Error executing statement ${executedCount + 1}:`, error.message);
                
                // Continue with other statements unless it's a critical error
                if (error.message.includes('Duplicate key name') || 
                    error.message.includes('Duplicate column name') ||
                    error.message.includes('Duplicate entry')) {
                    console.log('⚠️  Skipping duplicate entry/column/key...');
                    continue;
                }
            }
        }
        
        console.log('\n📈 Migration Summary:');
        console.log(`✅ Successfully executed: ${executedCount} statements`);
        console.log(`❌ Errors encountered: ${errorCount} statements`);
        
        if (errorCount === 0) {
            console.log('🎉 Distribution system migration completed successfully!');
            console.log('\n📋 Created tables:');
            console.log('   - distribution_trips');
            console.log('   - daily_distribution_schedule');
            console.log('   - location_tracking');
            console.log('   - distribution_performance');
            console.log('   - route_optimization_cache');
            console.log('   - distribution_notifications');
            console.log('   - distribution_settings');
            console.log('\n📋 Updated existing tables:');
            console.log('   - orders (added distribution columns)');
            console.log('   - users (added distribution columns)');
            console.log('   - stores (added distribution columns)');
            console.log('\n📋 Created views:');
            console.log('   - daily_distribution_summary');
            console.log('   - distributor_performance_today');
            
        } else {
            console.log('⚠️  Migration completed with some errors. Please check the logs above.');
        }
        
        // Test database connection and verify tables
        console.log('\n🔍 Verifying migration...');
        await verifyMigration();
        
    } catch (error) {
        console.error('💥 Migration failed:', error);
        logger.error('Distribution migration failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed');
    }
};

/**
 * Verify that all tables were created successfully
 */
const verifyMigration = async () => {
    try {
        const tablesToVerify = [
            'distribution_trips',
            'daily_distribution_schedule', 
            'location_tracking',
            'distribution_performance',
            'route_optimization_cache',
            'distribution_notifications',
            'distribution_settings'
        ];
        
        console.log('🔍 Checking table creation...');
        
        for (const tableName of tablesToVerify) {
            try {
                const [results] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
                if (results.length > 0) {
                    console.log(`✅ Table '${tableName}' exists`);
                } else {
                    console.log(`❌ Table '${tableName}' not found`);
                }
            } catch (error) {
                console.log(`❌ Error checking table '${tableName}':`, error.message);
            }
        }
        
        // Check views
        console.log('🔍 Checking view creation...');
        const viewsToVerify = [
            'daily_distribution_summary',
            'distributor_performance_today'
        ];
        
        for (const viewName of viewsToVerify) {
            try {
                const [results] = await sequelize.query(`SHOW TABLES LIKE '${viewName}'`);
                if (results.length > 0) {
                    console.log(`✅ View '${viewName}' exists`);
                } else {
                    console.log(`❌ View '${viewName}' not found`);
                }
            } catch (error) {
                console.log(`❌ Error checking view '${viewName}':`, error.message);
            }
        }
        
        // Check distribution settings
        console.log('🔍 Checking distribution settings...');
        const [settingsResults] = await sequelize.query('SELECT COUNT(*) as count FROM distribution_settings');
        console.log(`✅ Distribution settings count: ${settingsResults[0].count}`);
        
        console.log('✅ Migration verification completed');
        
    } catch (error) {
        console.error('❌ Migration verification failed:', error);
    }
};

// Run the migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    applyDistributionMigration();
}

export default applyDistributionMigration;