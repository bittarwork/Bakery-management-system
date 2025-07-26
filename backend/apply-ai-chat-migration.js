import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bakery_management',
        multipleStatements: true
    };

    let connection;

    try {
        console.log('🤖 Starting AI Chat Migration...');
        console.log('================================\n');

        // Connect to database
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected successfully\n');

        // Read and execute migration
        console.log('📋 Reading migration file...');
        const migrationPath = path.join(__dirname, 'migrations', 'create_ai_conversations.sql');

        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found: ${migrationPath}`);
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log('✅ Migration file loaded\n');

        console.log('⚡ Executing migration...');
        await connection.execute(migrationSQL);
        console.log('✅ Migration executed successfully\n');

        // Verify tables
        console.log('🔍 Verifying created tables...');
        const tables = ['ai_conversations', 'ai_conversation_stats', 'ai_context_memory', 'ai_chat_analytics'];

        for (const table of tables) {
            const [result] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            `, [dbConfig.database, table]);

            if (result[0].count > 0) {
                console.log(`  ✅ ${table}`);
            } else {
                console.log(`  ❌ ${table} - Not found`);
            }
        }

        console.log('\n🎉 AI Chat migration completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('1. Restart your backend server');
        console.log('2. Test the AI chat functionality');
        console.log('3. Check the conversation history features');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

runMigration();
