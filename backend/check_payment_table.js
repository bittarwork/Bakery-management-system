import sequelize from './config/database.js';
import Payment from './models/Payment.js';

async function checkPaymentTable() {
    try {
        console.log('Checking payment table structure...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('payments');

        console.log('Payment table columns:');
        Object.keys(tableDescription).forEach(column => {
            console.log(`- ${column}: ${tableDescription[column].type}`);
        });

        // Check if due_date column exists
        if (tableDescription.due_date) {
            console.log('✅ due_date column exists');
        } else {
            console.log('❌ due_date column is missing');
        }

        // Try to run a simple query to see what fails
        console.log('\nTrying to query payments table...');
        const result = await sequelize.query('SELECT * FROM payments LIMIT 1', {
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Query successful, sample result:', result);

        await sequelize.close();
    } catch (error) {
        console.error('Error checking payment table:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

checkPaymentTable(); 