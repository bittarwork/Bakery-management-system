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

async function fixProductsTable() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // Add missing columns to products table
        console.log('\n🔧 Adding missing columns to products table...');

        const columnsToAdd = [
            'ADD COLUMN stock_quantity INT DEFAULT 0',
            'ADD COLUMN minimum_stock INT DEFAULT 0',
            'ADD COLUMN total_sold INT DEFAULT 0',
            'ADD COLUMN total_revenue_eur DECIMAL(15,2) DEFAULT 0.00',
            'ADD COLUMN total_revenue_syp DECIMAL(20,2) DEFAULT 0.00',
            'ADD COLUMN supplier_info JSON',
            'ADD COLUMN expiry_date DATE',
            'ADD COLUMN production_date DATE',
            'ADD COLUMN shelf_life_days INT',
            'ADD COLUMN weight_grams INT',
            'ADD COLUMN dimensions JSON',
            'ADD COLUMN nutritional_info JSON',
            'ADD COLUMN allergen_info JSON',
            'ADD COLUMN storage_conditions TEXT',
            'ADD COLUMN is_featured BOOLEAN DEFAULT FALSE',
            'ADD COLUMN status ENUM("active", "inactive", "discontinued") DEFAULT "active"',
            'ADD COLUMN created_by INT',
            'ADD COLUMN created_by_name VARCHAR(255)'
        ];

        for (const column of columnsToAdd) {
            try {
                await connection.execute(`ALTER TABLE products ${column}`);
                console.log(`✅ Added column: ${column.split(' ')[2]}`);
            } catch (error) {
                if (error.message.includes('Duplicate column name')) {
                    console.log(`⚠️  Column already exists: ${column.split(' ')[2]}`);
                } else {
                    console.error(`❌ Error adding column: ${error.message}`);
                }
            }
        }

        // Update existing products to have proper status
        console.log('\n🔄 Updating existing products...');
        await connection.execute(`
      UPDATE products 
      SET status = 'active' 
      WHERE status IS NULL OR status = ''
    `);

        // Change is_active to match status
        try {
            await connection.execute(`
        UPDATE products 
        SET status = CASE 
          WHEN is_active = 1 THEN 'active' 
          ELSE 'inactive' 
        END
      `);
            console.log('✅ Updated status based on is_active');
        } catch (error) {
            console.log('⚠️  is_active column might not exist');
        }

        // Verify table structure
        console.log('\n📊 Final table structure:');
        const [structure] = await connection.execute('DESCRIBE products');
        console.table(structure);

        console.log('\n✅ Products table fixed successfully!');

    } catch (error) {
        console.error('❌ Error fixing products table:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixProductsTable(); 