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

async function runBasicMigration() {
    let connection;
    
    try {
        console.log('🚀 Starting basic database migration...');
        
        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/basic_ai_migration.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split SQL into individual statements
        const statements = migrationSQL
            .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/)
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'COMMIT');
        
        // Create connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Execute each statement
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            try {
                await connection.execute(statement);
                successCount++;
                console.log(`✅ Statement ${i + 1} executed successfully`);
            } catch (error) {
                if (error.message.includes('already exists') || 
                    error.message.includes('Duplicate column') ||
                    error.message.includes('Duplicate key name') ||
                    error.message.includes('Duplicate entry')) {
                    console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
                    skippedCount++;
                } else {
                    console.error(`❌ Error in statement ${i + 1}:`, error.message);
                    errorCount++;
                }
            }
        }
        
        console.log(`\n📊 Migration Summary:`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`⚠️  Skipped: ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📄 Total statements: ${statements.length}`);
        
        if (errorCount === 0) {
            console.log('\n🎉 Migration completed successfully!');
            console.log('✨ Enhanced AI system tables are ready!');
        } else if (errorCount < statements.length / 2) {
            console.log('\n⚠️  Migration completed with some errors (mostly successful)');
        } else {
            console.log('\n❌ Migration had many errors');
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
runBasicMigration();