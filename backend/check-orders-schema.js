import sequelize from './config/database.js';

async function checkOrdersSchema() {
    try {
        const [results] = await sequelize.query('DESCRIBE orders');
        console.log('Current orders table schema:');
        console.table(results);

        // Check if specific columns exist
        const columns = results.map(row => row.Field);
        console.log('\nChecking for required columns:');

        const requiredColumns = [
            'total_cost_eur',
            'total_cost_syp',
            'commission_eur',
            'commission_syp',
            'priority',
            'scheduled_delivery_date'
        ];

        requiredColumns.forEach(col => {
            const exists = columns.includes(col);
            console.log(`${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await sequelize.close();
    }
}

checkOrdersSchema(); 