import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

async function checkDistributionTables() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        console.log(`Host: ${config.host}:${config.port}`);
        console.log(`Database: ${config.database}`);

        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // List all tables
        console.log('\n=== ALL TABLES IN DATABASE ===');
        const [allTables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_NAME
        `, [config.database]);

        if (allTables.length === 0) {
            console.log('❌ No tables found in database');
            return;
        }

        console.log(`Total tables found: ${allTables.length}`);
        allTables.forEach(table => {
            console.log(`  📋 ${table.TABLE_NAME}`);
        });

        // Check for distribution-related tables
        console.log('\n=== DISTRIBUTION SYSTEM TABLES ===');
        const distributionTables = [
            'daily_distribution_schedules',
            'dailydistributionschedules',
            'DailyDistributionSchedule',
            'distribution_trips',
            'location_tracking',
            'distribution_notifications',
            'distribution_settings',
            'distribution_performance'
        ];

        const existingDistributionTables = [];

        for (const tableName of distributionTables) {
            const found = allTables.find(t =>
                t.TABLE_NAME.toLowerCase() === tableName.toLowerCase()
            );
            if (found) {
                existingDistributionTables.push(found.TABLE_NAME);
                console.log(`✅ ${found.TABLE_NAME} - EXISTS`);

                // Get table structure
                try {
                    const [structure] = await connection.execute(`DESCRIBE ${found.TABLE_NAME}`);
                    console.log(`   Columns: ${structure.length}`);

                    // Show first few columns
                    structure.slice(0, 5).forEach(col => {
                        console.log(`     - ${col.Field} (${col.Type})`);
                    });
                    if (structure.length > 5) {
                        console.log(`     ... and ${structure.length - 5} more columns`);
                    }
                } catch (err) {
                    console.log(`   ⚠️  Could not describe table: ${err.message}`);
                }
            } else {
                console.log(`❌ ${tableName} - NOT FOUND`);
            }
        }

        // Check core tables
        console.log('\n=== CORE SYSTEM TABLES ===');
        const coreTables = ['users', 'stores', 'products', 'orders', 'order_items'];

        for (const tableName of coreTables) {
            const found = allTables.find(t =>
                t.TABLE_NAME.toLowerCase() === tableName.toLowerCase()
            );
            if (found) {
                console.log(`✅ ${found.TABLE_NAME} - EXISTS`);

                // Get count
                try {
                    const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${found.TABLE_NAME}`);
                    console.log(`   Records: ${count[0].count}`);
                } catch (err) {
                    console.log(`   ⚠️  Could not count records: ${err.message}`);
                }
            } else {
                console.log(`❌ ${tableName} - NOT FOUND`);
            }
        }

        console.log('\n=== SUMMARY ===');
        console.log(`Distribution tables found: ${existingDistributionTables.length}`);
        console.log(`Distribution tables missing: ${distributionTables.length - existingDistributionTables.length}`);

        if (existingDistributionTables.length === 0) {
            console.log('\n⚠️  NO DISTRIBUTION TABLES FOUND!');
            console.log('This explains why the distribution endpoints are failing.');
            console.log('You need to run the distribution system migration.');
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkDistributionTables();