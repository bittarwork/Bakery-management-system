import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../config.env') });

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

async function checkOrdersStructure() {
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to database');

        // Check orders table structure
        console.log('\n=== ORDERS TABLE STRUCTURE ===');
        const [columns] = await connection.execute('DESCRIBE orders');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Sample recent orders
        console.log('\n=== SAMPLE ORDERS ===');
        const [orders] = await connection.execute('SELECT * FROM orders LIMIT 3');
        console.log(`Found ${orders.length} orders in database`);

        if (orders.length > 0) {
            console.log('First order keys:', Object.keys(orders[0]));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkOrdersStructure();