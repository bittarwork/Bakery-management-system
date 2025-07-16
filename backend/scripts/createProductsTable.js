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

async function createProductsTable() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // Drop existing table
        console.log('\n🗑️  Dropping existing products table...');
        await connection.execute('DROP TABLE IF EXISTS products');
        console.log('✅ Products table dropped');

        // Create new table with correct structure
        console.log('\n📦 Creating products table...');

        const createTableQuery = `
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category ENUM('bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other') DEFAULT 'other',
        unit VARCHAR(20) DEFAULT 'piece',
        price_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        price_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        cost_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        cost_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        stock_quantity INT DEFAULT 0,
        minimum_stock INT DEFAULT 0,
        total_sold INT DEFAULT 0,
        total_revenue_eur DECIMAL(15,2) DEFAULT 0.00,
        total_revenue_syp DECIMAL(20,2) DEFAULT 0.00,
        supplier_info JSON,
        expiry_date DATE,
        production_date DATE,
        shelf_life_days INT,
        weight_grams INT,
        dimensions JSON,
        nutritional_info JSON,
        allergen_info JSON,
        storage_conditions TEXT,
        image_url VARCHAR(500),
        barcode VARCHAR(50) UNIQUE,
        is_featured BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
        created_by INT,
        created_by_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_name (name),
        INDEX idx_price_eur (price_eur),
        INDEX idx_price_syp (price_syp),
        INDEX idx_is_featured (is_featured),
        INDEX idx_barcode (barcode)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

        await connection.execute(createTableQuery);
        console.log('✅ Products table created successfully');

        // Verify table structure
        console.log('\n📊 Verifying table structure...');
        const [structure] = await connection.execute('DESCRIBE products');
        console.table(structure);

        console.log('\n✅ Products table is ready for data!');

    } catch (error) {
        console.error('❌ Error creating products table:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createProductsTable(); 