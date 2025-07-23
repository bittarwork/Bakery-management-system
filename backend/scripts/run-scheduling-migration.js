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
    port: 24785,
    multipleStatements: true
};

async function runSchedulingMigration() {
    let connection;

    try {
        console.log('🔄 Connecting to Railway database...');
        connection = await mysql.createConnection(dbConfig);

        console.log('✅ Connected to database successfully');

        // Read the migration file
        const migrationPath = path.join(__dirname, '../migrations/create-scheduling-drafts-table.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📖 Reading migration file...');

        // Split SQL commands (some databases have issues with multiple statements)
        const sqlCommands = migrationSQL
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`🚀 Executing ${sqlCommands.length} SQL commands...`);

        // Execute each command separately
        for (let i = 0; i < sqlCommands.length; i++) {
            const command = sqlCommands[i];
            if (command) {
                try {
                    console.log(`📝 Executing command ${i + 1}/${sqlCommands.length}...`);
                    await connection.execute(command);
                } catch (cmdError) {
                    // Skip errors for things that already exist
                    if (cmdError.message.includes('already exists') ||
                        cmdError.message.includes('Duplicate key name')) {
                        console.log(`⚠️ Skipping: ${cmdError.message}`);
                        continue;
                    }
                    throw cmdError;
                }
            }
        }

        // Verify the table was created
        console.log('🔍 Verifying table creation...');
        const [tables] = await connection.execute("SHOW TABLES LIKE 'scheduling_drafts'");

        if (tables.length > 0) {
            console.log('✅ scheduling_drafts table created successfully!');

            // Show table structure
            const [structure] = await connection.execute('DESCRIBE scheduling_drafts');
            console.log('\n📋 Table structure:');
            structure.forEach(column => {
                console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'}`);
            });

            // Check if sample data was inserted
            const [count] = await connection.execute('SELECT COUNT(*) as count FROM scheduling_drafts');
            console.log(`\n📊 Sample data: ${count[0].count} records inserted`);

        } else {
            throw new Error('Table was not created successfully');
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);

        if (error.code) {
            console.error(`   Error Code: ${error.code}`);
        }

        if (error.sqlMessage) {
            console.error(`   SQL Message: ${error.sqlMessage}`);
        }

        process.exit(1);

    } finally {
        if (connection) {
            await connection.end();
            console.log('🔒 Database connection closed');
        }
    }
}

// Run the migration
console.log('🚀 Starting scheduling_drafts table migration...');
console.log('📅 Date:', new Date().toISOString());
console.log('🏗️ Target: Railway production database\n');

runSchedulingMigration(); 