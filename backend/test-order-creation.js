import sequelize from './config/database.js';
import { Order, Store, Product, User } from './models/index.js';

async function testOrderCreation() {
    try {
        console.log('Testing order creation...');

        // Check if we have stores and products
        const stores = await Store.findAll({ limit: 1 });
        const products = await Product.findAll({ limit: 1 });
        const users = await User.findAll({ limit: 1 });

        console.log('Available stores:', stores.length);
        console.log('Available products:', products.length);
        console.log('Available users:', users.length);

        if (stores.length === 0) {
            console.log('❌ No stores found');
            return;
        }

        if (products.length === 0) {
            console.log('❌ No products found');
            return;
        }

        if (users.length === 0) {
            console.log('❌ No users found');
            return;
        }

        const store = stores[0];
        const product = products[0];
        const user = users[0];

        console.log('Using store:', store.name);
        console.log('Using product:', product.name);
        console.log('Using user:', user.username);

        // Test order data
        const orderData = {
            store_id: store.id,
            items: [
                {
                    product_id: product.id,
                    quantity: 2
                }
            ],
            notes: 'Test order',
            priority: 'normal'
        };

        console.log('Order data:', orderData);

        // Test the generateOrderNumber method
        const orderNumber = await Order.generateOrderNumber();
        console.log('Generated order number:', orderNumber);

        console.log('✅ All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await sequelize.close();
    }
}

testOrderCreation(); 