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

async function checkProductsTable() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        console.log(`Host: ${config.host}:${config.port}`);
        console.log(`Database: ${config.database}`);

        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // Check if products table exists
        console.log('\n=== CHECKING PRODUCTS TABLE ===');
        const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'
    `, [config.database]);

        if (tables.length === 0) {
            console.log('❌ Products table does not exist');

            // List all tables
            const [allTables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ?
      `, [config.database]);

            console.log('\n📋 Available tables:');
            allTables.forEach(table => {
                console.log(`  - ${table.TABLE_NAME}`);
            });

            return;
        }

        console.log('✅ Products table exists');

        // Get table structure
        console.log('\n=== PRODUCTS TABLE STRUCTURE ===');
        const [structure] = await connection.execute('DESCRIBE products');
        console.table(structure);

        // Get products count
        console.log('\n=== PRODUCTS COUNT ===');
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM products');
        console.log(`Total products: ${count[0].count}`);

        if (count[0].count > 0) {
            // Get sample products
            console.log('\n=== SAMPLE PRODUCTS ===');
            const [products] = await connection.execute('SELECT * FROM products LIMIT 3');
            console.log(JSON.stringify(products, null, 2));
        } else {
            console.log('⚠️  No products found in the table');
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

checkProductsTable();
