import sequelize from './config/database.js';
import Payment from './models/Payment.js';
import Store from './models/Store.js';

async function testPaymentModel() {
    try {
        console.log('Testing Payment model...');

        // Test basic query
        const payments = await Payment.findAll({
            where: { store_id: 4 },
            limit: 5,
            order: [['payment_date', 'DESC']]
        });

        console.log(`Found ${payments.length} payments for store 4`);

        if (payments.length > 0) {
            console.log('Sample payment:', {
                id: payments[0].id,
                payment_number: payments[0].payment_number,
                amount_eur: payments[0].amount_eur,
                amount_syp: payments[0].amount_syp,
                status: payments[0].status,
                payment_date: payments[0].payment_date
            });
        }

        // Test count
        const count = await Payment.count({
            where: { store_id: 4 }
        });

        console.log(`Total payments for store 4: ${count}`);

        // Test store exists
        const store = await Store.findByPk(4);
        if (store) {
            console.log(`Store 4 exists: ${store.name}`);
        } else {
            console.log('Store 4 not found');
        }

        await sequelize.close();
        console.log('✅ Payment model test completed successfully');

    } catch (error) {
        console.error('❌ Payment model test failed:', error.message);
        console.error('Stack:', error.stack);
        await sequelize.close();
        process.exit(1);
    }
}

testPaymentModel(); 