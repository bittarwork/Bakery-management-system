import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration for Railway
const dbConfig = {
    host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: process.env.DB_NAME || 'railway',
    port: process.env.DB_PORT || 24785,
    multipleStatements: true,
    ssl: false,
    timezone: '+00:00'
};

async function runMigration() {
    let connection = null;
    
    try {
        console.log('🔗 Connecting to Railway MySQL database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected successfully!');

        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/update-distribution-system.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📦 Running distribution system migration...');
        console.log('⚠️  This will update your database structure!');

        // Split SQL statements and execute them
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.length > 0) {
                try {
                    console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
                    const [results] = await connection.execute(statement);
                    
                    // If it's a SELECT statement, show results
                    if (statement.trim().toUpperCase().startsWith('SELECT')) {
                        console.log('📊 Results:', results);
                    }
                } catch (error) {
                    console.error(`❌ Error in statement ${i + 1}:`, error.message);
                    console.error('📄 Statement:', statement.substring(0, 100) + '...');
                    
                    // Continue with next statement for non-critical errors
                    if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log('ℹ️  Skipping duplicate/existing item...');
                        continue;
                    } else {
                        throw error;
                    }
                }
            }
        }

        console.log('✅ Migration completed successfully!');
        
        // Run verification
        console.log('🔍 Running verification...');
        const verificationPath = path.join(__dirname, '../migrations/verify-distribution-migration.sql');
        const verificationSQL = fs.readFileSync(verificationPath, 'utf8');
        
        const verificationStatements = verificationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt.toUpperCase().startsWith('SELECT'));

        for (const statement of verificationStatements) {
            try {
                const [results] = await connection.execute(statement);
                console.log('🔍 Verification:', results);
            } catch (error) {
                console.warn('⚠️  Verification warning:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('📋 Full error:', error);
        
        console.log('🔄 To rollback changes, run:');
        console.log('node scripts/rollback-distribution-migration.js');
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔚 Database connection closed');
        }
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Starting Distribution System Migration');
    console.log('📅 Date:', new Date().toISOString());
    console.log('🗄️  Database:', dbConfig.database);
    console.log('🖥️  Host:', dbConfig.host);
    
    runMigration()
        .then(() => {
            console.log('🎉 Migration process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration process failed:', error);
            process.exit(1);
        });
}

export default runMigration; 