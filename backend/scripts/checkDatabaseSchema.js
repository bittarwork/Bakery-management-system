import sequelize from '../config/database.js';
import Product from '../models/Product.js';

// Check database schema for Product table
async function checkProductSchema() {
    try {
        console.log('🔍 Checking Product table schema...\n');

        // Get table description
        const [results] = await sequelize.query("DESCRIBE Products");

        console.log('📋 Current Product table schema:');
        console.log('='.repeat(80));

        results.forEach(column => {
            const isNullable = column.Null === 'YES' ? '✅ NULL' : '❌ NOT NULL';
            const defaultValue = column.Default !== null ? `(default: ${column.Default})` : '(no default)';

            console.log(`${column.Field.padEnd(20)} | ${column.Type.padEnd(20)} | ${isNullable.padEnd(12)} | ${defaultValue}`);
        });

        console.log('='.repeat(80));

        // Check specific problematic columns
        console.log('\n🔍 Checking problematic columns:');
        const problematicColumns = ['cost_eur', 'cost_syp', 'price_syp', 'weight_grams', 'shelf_life_days'];

        problematicColumns.forEach(colName => {
            const column = results.find(col => col.Field === colName);
            if (column) {
                const status = column.Null === 'YES' ? '✅' : '⚠️ ';
                console.log(`${status} ${colName}: ${column.Type}, NULL=${column.Null}, Default=${column.Default}`);
            } else {
                console.log(`❌ ${colName}: Column not found`);
            }
        });

        console.log('\n📊 Summary:');
        const notNullColumns = results.filter(col => col.Null === 'NO');
        console.log(`Total columns: ${results.length}`);
        console.log(`NOT NULL columns: ${notNullColumns.length}`);
        console.log(`Nullable columns: ${results.length - notNullColumns.length}`);

        if (notNullColumns.length > 0) {
            console.log('\n⚠️  NOT NULL columns that might cause issues:');
            notNullColumns.forEach(col => {
                if (!['id', 'name', 'price_eur', 'created_at', 'updated_at'].includes(col.Field)) {
                    console.log(`   - ${col.Field} (${col.Type})`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Error checking schema:', error.message);
    }
}

// Check if we can create a test product
async function testProductCreation() {
    console.log('\n🧪 Testing product creation with minimal data...');

    try {
        const testProduct = {
            name: 'Test Product ' + Date.now(),
            category: 'other',
            unit: 'piece',
            price_eur: 1.00,
            price_syp: 0,
            cost_eur: 0,
            cost_syp: 0,
            stock_quantity: 0,
            minimum_stock: 0,
            is_featured: false,
            status: 'active',
            weight_grams: 0,
            shelf_life_days: 0,
            created_by: 1,
            created_by_name: 'System Test'
        };

        console.log('📝 Test product data:', JSON.stringify(testProduct, null, 2));

        const product = await Product.create(testProduct);
        console.log('✅ Test product created successfully with ID:', product.id);

        // Clean up
        await product.destroy();
        console.log('🧹 Test product deleted');

    } catch (error) {
        console.error('❌ Test product creation failed:', error.message);
        if (error.name === 'SequelizeDatabaseError') {
            console.error('💾 Database error details:', {
                errno: error.parent?.errno,
                code: error.parent?.code,
                sqlMessage: error.parent?.sqlMessage
            });
        }
    }
}

// Main execution
async function main() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        await checkProductSchema();
        await testProductCreation();

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await sequelize.close();
        console.log('\n🔚 Database connection closed');
    }
}

// Run the script
main(); 