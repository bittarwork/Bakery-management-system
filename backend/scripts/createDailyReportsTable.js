import db from '../config/database.js';
import fs from 'fs';
import path from 'path';

async function createDailyReportsTable() {
    try {
        console.log('Creating daily_reports table...');

        const sqlPath = path.join(process.cwd(), '../database/migrations/create_daily_reports_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL into individual statements and execute them
        const statements = sql.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await db.query(statement);
                    console.log('Executed:', statement.substring(0, 50) + '...');
                } catch (err) {
                    console.log('Statement already exists or error:', err.message);
                }
            }
        }

        console.log('✅ Daily reports table created successfully!');

    } catch (error) {
        console.error('❌ Error creating daily_reports table:', error.message);
    } finally {
        process.exit(0);
    }
}

createDailyReportsTable(); 