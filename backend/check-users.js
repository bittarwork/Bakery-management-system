import { initializeModels } from './models/index.js';
import User from './models/User.js';
import Store from './models/Store.js';
import Product from './models/Product.js';
import sequelize from './config/database.js';

async function checkDatabase() {
    try {
        console.log('🔍 Checking database connection and data...');

        // Initialize models
        await initializeModels();

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Check users
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'full_name', 'role', 'status'],
            limit: 10
        });

        console.log('👥 Users found:', users.length);
        users.forEach(user => {
            console.log(`  - ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Status: ${user.status}`);
        });

        // Check stores
        const stores = await Store.findAll({
            attributes: ['id', 'name', 'status'],
            limit: 10
        });

        console.log('🏪 Stores found:', stores.length);
        stores.forEach(store => {
            console.log(`  - ID: ${store.id}, Name: ${store.name}, Status: ${store.status}`);
        });

        // Check products
        const products = await Product.findAll({
            attributes: ['id', 'name', 'status', 'stock_quantity'],
            limit: 10
        });

        console.log('📦 Products found:', products.length);
        products.forEach(product => {
            console.log(`  - ID: ${product.id}, Name: ${product.name}, Status: ${product.status}, Stock: ${product.stock_quantity}`);
        });

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        await sequelize.close();
    }
}

checkDatabase();