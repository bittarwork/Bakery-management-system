import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    multipleStatements: true
};

async function runMigration() {
    let connection;
    
    try {
        console.log('🚀 Starting database migration...');
        
        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/add_enhanced_ai_tables.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split SQL into individual statements (excluding DELIMITER blocks)
        const statements = migrationSQL
            .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/) // Split on semicolons not inside strings
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.includes('DELIMITER'));
        
        // Create connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Execute each statement
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip delimiter and procedure creation for now
            if (statement.includes('DELIMITER') || 
                statement.includes('CREATE PROCEDURE') ||
                statement.includes('CREATE TRIGGER') ||
                statement.includes('CREATE EVENT')) {
                console.log(`⏭️  Skipping complex statement ${i + 1}...`);
                continue;
            }
            
            try {
                await connection.execute(statement);
                successCount++;
                console.log(`✅ Statement ${i + 1} executed successfully`);
            } catch (error) {
                if (error.message.includes('already exists') || 
                    error.message.includes('Duplicate column') ||
                    error.message.includes('Duplicate key')) {
                    console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
                } else {
                    console.error(`❌ Error in statement ${i + 1}:`, error.message);
                    errorCount++;
                }
            }
        }
        
        console.log(`\n📊 Migration Summary:`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`⏭️  Skipped: ${statements.length - successCount - errorCount}`);
        
        if (errorCount === 0) {
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('\n⚠️  Migration completed with some errors');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run migration
runMigration();