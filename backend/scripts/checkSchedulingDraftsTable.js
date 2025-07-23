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

async function checkAndCreateSchedulingDraftsTable() {
    let connection;
    try {
        console.log('🔗 Connecting to Railway database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection established');

        // Check if scheduling_drafts table exists
        console.log('\n🔍 Checking if scheduling_drafts table exists...');
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'scheduling_drafts'
        `, [dbConfig.database]);

        if (tables.length > 0) {
            console.log('✅ scheduling_drafts table already exists');

            // Check table structure
            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'scheduling_drafts'
                ORDER BY COLUMN_NAME
            `, [dbConfig.database]);

            console.log('\n📋 Table structure:');
            columns.forEach(col => {
                console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });

            // Check if there's any sample data
            const [count] = await connection.execute('SELECT COUNT(*) as count FROM scheduling_drafts');
            console.log(`\n📊 Table contains ${count[0].count} records`);

        } else {
            console.log('❌ scheduling_drafts table does not exist');
            console.log('📦 Creating scheduling_drafts table...');

            // Read the migration file
            const migrationPath = path.join(__dirname, '..', 'migrations', 'create-scheduling-drafts-table.sql');
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            // Execute the migration
            const statements = migrationSQL.split(';').filter(stmt => stmt.trim());

            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        await connection.execute(statement);
                        console.log('✅ Executed SQL statement successfully');
                    } catch (error) {
                        // Ignore errors for conditional indexes or data insertion
                        if (!error.message.includes('Duplicate key name') &&
                            !error.message.includes('already exists') &&
                            !error.message.includes('Duplicate entry')) {
                            console.log(`⚠️  Warning: ${error.message}`);
                        }
                    }
                }
            }

            console.log('✅ scheduling_drafts table created successfully');
        }

        console.log('\n✅ Check completed successfully');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the check
checkAndCreateSchedulingDraftsTable(); 