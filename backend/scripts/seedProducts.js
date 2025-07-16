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

const sampleProducts = [
    {
        name: 'Fresh Bread',
        description: 'Daily fresh bread made with premium flour',
        category: 'bread',
        unit: 'piece',
        price_eur: 1.50,
        price_syp: 3750,
        cost_eur: 0.80,
        cost_syp: 2000,
        stock_quantity: 100,
        minimum_stock: 20,
        status: 'active',
        is_featured: true,
        barcode: 'BR001',
        weight_grams: 500,
        shelf_life_days: 3,
        storage_conditions: 'Store in cool, dry place',
        created_by_name: 'System Admin'
    },
    {
        name: 'Chocolate Croissant',
        description: 'Buttery croissant filled with premium chocolate',
        category: 'pastry',
        unit: 'piece',
        price_eur: 2.50,
        price_syp: 6250,
        cost_eur: 1.20,
        cost_syp: 3000,
        stock_quantity: 50,
        minimum_stock: 10,
        status: 'active',
        is_featured: true,
        barcode: 'CR001',
        weight_grams: 120,
        shelf_life_days: 2,
        storage_conditions: 'Store in cool, dry place',
        created_by_name: 'System Admin'
    },
    {
        name: 'Birthday Cake',
        description: 'Custom birthday cake with vanilla and chocolate layers',
        category: 'cake',
        unit: 'piece',
        price_eur: 25.00,
        price_syp: 62500,
        cost_eur: 15.00,
        cost_syp: 37500,
        stock_quantity: 5,
        minimum_stock: 2,
        status: 'active',
        is_featured: false,
        barcode: 'CK001',
        weight_grams: 1500,
        shelf_life_days: 5,
        storage_conditions: 'Refrigerate',
        created_by_name: 'System Admin'
    },
    {
        name: 'Orange Juice',
        description: 'Fresh squeezed orange juice',
        category: 'drink',
        unit: 'bottle',
        price_eur: 3.00,
        price_syp: 7500,
        cost_eur: 1.50,
        cost_syp: 3750,
        stock_quantity: 30,
        minimum_stock: 10,
        status: 'active',
        is_featured: false,
        barcode: 'DR001',
        weight_grams: 500,
        shelf_life_days: 7,
        storage_conditions: 'Refrigerate',
        created_by_name: 'System Admin'
    },
    {
        name: 'Cheese Danish',
        description: 'Flaky pastry with cream cheese filling',
        category: 'pastry',
        unit: 'piece',
        price_eur: 2.00,
        price_syp: 5000,
        cost_eur: 1.00,
        cost_syp: 2500,
        stock_quantity: 25,
        minimum_stock: 5,
        status: 'active',
        is_featured: false,
        barcode: 'DN001',
        weight_grams: 150,
        shelf_life_days: 2,
        storage_conditions: 'Store in cool, dry place',
        created_by_name: 'System Admin'
    }
];

async function seedProducts() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // Clear existing products
        console.log('\n🗑️  Clearing existing products...');
        await connection.execute('DELETE FROM products');
        console.log('✅ Products cleared');

        // Insert sample products
        console.log('\n📦 Inserting sample products...');

        const insertQuery = `
      INSERT INTO products (
        name, description, category, unit, price_eur, price_syp, 
        cost_eur, cost_syp, stock_quantity, minimum_stock, 
        status, is_featured, barcode, weight_grams, shelf_life_days, 
        storage_conditions, created_by_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

        for (const product of sampleProducts) {
            await connection.execute(insertQuery, [
                product.name,
                product.description,
                product.category,
                product.unit,
                product.price_eur,
                product.price_syp,
                product.cost_eur,
                product.cost_syp,
                product.stock_quantity,
                product.minimum_stock,
                product.status,
                product.is_featured,
                product.barcode,
                product.weight_grams,
                product.shelf_life_days,
                product.storage_conditions,
                product.created_by_name
            ]);

            console.log(`✅ Inserted: ${product.name}`);
        }

        // Verify insertion
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM products');
        console.log(`\n📊 Total products inserted: ${count[0].count}`);

        // Show sample data
        const [products] = await connection.execute('SELECT id, name, price_eur, stock_quantity FROM products LIMIT 5');
        console.log('\n📋 Sample products:');
        console.table(products);

    } catch (error) {
        console.error('❌ Error seeding products:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

seedProducts(); 