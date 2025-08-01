#!/usr/bin/env node

/**
 * Database Manager - إدارة قاعدة البيانات وتطبيق الإصلاحات
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// إعدادات الاتصال بقاعدة البيانات
const DB_CONFIG = {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    ssl: false,
    connectTimeout: 30000,
    acquireTimeout: 30000
};

class DatabaseManager {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            console.log('🔌 Connecting to Railway MySQL database...');
            this.connection = await mysql.createConnection(DB_CONFIG);
            console.log('✅ Connected successfully!');
        } catch (error) {
            console.error('❌ Connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 Database connection closed');
        }
    }

    async showTables() {
        try {
            console.log('\n📋 Showing all tables...');
            const [tables] = await this.connection.execute('SHOW TABLES');

            console.log('Available tables:');
            tables.forEach((table, index) => {
                const tableName = Object.values(table)[0];
                console.log(`${index + 1}. ${tableName}`);
            });

            return tables.map(table => Object.values(table)[0]);
        } catch (error) {
            console.error('❌ Error showing tables:', error.message);
            throw error;
        }
    }

    async describeTable(tableName) {
        try {
            const [columns] = await this.connection.execute(`DESCRIBE ${tableName}`);
            console.log(`\n📊 Table: ${tableName}`);
            console.log('Columns:');
            columns.forEach(col => {
                console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
            });
            return columns;
        } catch (error) {
            console.error(`❌ Error describing table ${tableName}:`, error.message);
            throw error;
        }
    }

    async checkTableExists(tableName) {
        try {
            const [result] = await this.connection.execute(
                `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
                [DB_CONFIG.database, tableName]
            );
            return result[0].count > 0;
        } catch (error) {
            console.error(`❌ Error checking table ${tableName}:`, error.message);
            return false;
        }
    }

    async applyFixTripNumber() {
        try {
            console.log('\n🔧 Applying trip_number fix...');

            // Check if distribution_trips table exists
            const tableExists = await this.checkTableExists('distribution_trips');
            if (!tableExists) {
                console.log('⚠️  distribution_trips table does not exist, skipping fix');
                return;
            }

            // Check if trip_number column already exists
            const [columns] = await this.connection.execute(`DESCRIBE distribution_trips`);
            const tripNumberExists = columns.some(col => col.Field === 'trip_number');

            if (tripNumberExists) {
                console.log('✅ trip_number column already exists');
                return;
            }

            // Add trip_number column
            await this.connection.execute(`
                ALTER TABLE distribution_trips 
                ADD COLUMN trip_number VARCHAR(20) 
                DEFAULT 'TRIP-DEFAULT'
                AFTER id
            `);
            console.log('✅ Added trip_number column');

            // Update existing rows
            await this.connection.execute(`
                UPDATE distribution_trips 
                SET trip_number = CONCAT(
                    'TRIP-', 
                    DATE_FORMAT(COALESCE(created_at, NOW()), '%Y%m%d'), 
                    '-', 
                    TIME_FORMAT(COALESCE(created_at, NOW()), '%H%i%s'), 
                    '-', 
                    LPAD(id, 3, '0')
                )
                WHERE trip_number = 'TRIP-DEFAULT' OR trip_number IS NULL
            `);
            console.log('✅ Updated existing rows with unique trip numbers');

            // Add unique index
            try {
                await this.connection.execute(`
                    ALTER TABLE distribution_trips 
                    ADD UNIQUE INDEX idx_trip_number (trip_number)
                `);
                console.log('✅ Added unique index for trip_number');
            } catch (error) {
                if (!error.message.includes('Duplicate key name')) {
                    throw error;
                }
            }

            console.log('🎉 trip_number fix applied successfully!');

        } catch (error) {
            console.error('❌ Error applying trip_number fix:', error.message);
            throw error;
        }
    }

    async identifyUnusedTables() {
        try {
            console.log('\n🔍 Identifying unused tables...');
            const tables = await this.showTables();

            // Core tables that should be kept
            const coreTables = [
                'users', 'stores', 'products', 'orders', 'order_items',
                'payments', 'vehicles', 'notifications', 'user_sessions',
                'daily_distribution_schedule', 'distribution_trips',
                'location_tracking', 'distribution_notifications',
                'distribution_settings', 'distribution_performance'
            ];

            const unusedTables = tables.filter(table => !coreTables.includes(table));

            console.log('\n📊 Table Analysis:');
            console.log('Core tables (will be kept):');
            coreTables.forEach(table => {
                if (tables.includes(table)) {
                    console.log(`  ✅ ${table}`);
                } else {
                    console.log(`  ⚠️  ${table} (missing)`);
                }
            });

            if (unusedTables.length > 0) {
                console.log('\nPotentially unused tables:');
                for (const table of unusedTables) {
                    const [rows] = await this.connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
                    console.log(`  🗑️  ${table} (${rows[0].count} rows)`);
                }
            } else {
                console.log('\n✅ No unused tables found');
            }

            return unusedTables;
        } catch (error) {
            console.error('❌ Error identifying unused tables:', error.message);
            throw error;
        }
    }

    async dropUnusedTables(tablesToDrop) {
        try {
            if (tablesToDrop.length === 0) {
                console.log('✅ No tables to drop');
                return;
            }

            console.log('\n🗑️  Dropping unused tables...');
            for (const table of tablesToDrop) {
                try {
                    await this.connection.execute(`DROP TABLE IF EXISTS ${table}`);
                    console.log(`✅ Dropped table: ${table}`);
                } catch (error) {
                    console.error(`❌ Error dropping table ${table}:`, error.message);
                }
            }
        } catch (error) {
            console.error('❌ Error dropping tables:', error.message);
            throw error;
        }
    }

    async getTableRowCounts() {
        try {
            console.log('\n📊 Table row counts:');
            const tables = await this.showTables();

            for (const table of tables) {
                try {
                    const [rows] = await this.connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
                    console.log(`  ${table}: ${rows[0].count} rows`);
                } catch (error) {
                    console.log(`  ${table}: Error - ${error.message}`);
                }
            }
        } catch (error) {
            console.error('❌ Error getting row counts:', error.message);
        }
    }
}

// Main execution
async function main() {
    const dbManager = new DatabaseManager();

    try {
        await dbManager.connect();

        // Show current state
        await dbManager.showTables();
        await dbManager.getTableRowCounts();

        // Apply fixes
        await dbManager.applyFixTripNumber();

        // Identify and handle unused tables
        const unusedTables = await dbManager.identifyUnusedTables();

        // Ask for confirmation before dropping tables (in this case, we'll be conservative)
        console.log('\n⚠️  Note: Table dropping is commented out for safety');
        console.log('Uncomment the next line if you want to drop unused tables:');
        console.log(' await dbManager.dropUnusedTables(unusedTables);');

        console.log('\n🎉 Database management completed successfully!');

    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    } finally {
        await dbManager.disconnect();
    }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} else {
    // Also run for Node.js direct execution
    main().catch(console.error);
}

export default DatabaseManager;