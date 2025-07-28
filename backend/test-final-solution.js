import Product from './models/Product.js';
import sequelize from './config/database.js';

console.log('🧪 Testing final solution for product creation...');

const testCases = [
    {
        name: 'Test Case 1: Empty optional fields',
        data: {
            name: 'Test Product 1',
            description: 'Test Description',
            category: 'bread',
            unit: 'piece',
            price_eur: 1.50,
            // These fields will be sent as empty/undefined from frontend
            price_syp: '', // Empty string (common from frontend)
            weight_grams: '', // Empty string
            shelf_life_days: '', // Empty string
            cost_eur: 0, // Zero value (allowed)
            cost_syp: 0, // Zero value (allowed)
            stock_quantity: 0, // Zero value (allowed)
            minimum_stock: 0, // Zero value (allowed)
            barcode: null,
            is_featured: false,
            status: 'active',
            image_url: null,
            storage_conditions: null,
            created_by: 1,
            created_by_name: 'System',
            total_sold: 0,
            total_revenue_eur: 0.00,
            total_revenue_syp: 0.00
        }
    },
    {
        name: 'Test Case 2: With positive values',
        data: {
            name: 'Test Product 2',
            description: 'Test Description 2',
            category: 'pastry',
            unit: 'piece',
            price_eur: 2.50,
            price_syp: 1500, // Positive value
            weight_grams: 250, // Positive value
            shelf_life_days: 7, // Positive value
            cost_eur: 0.8,
            cost_syp: 800,
            stock_quantity: 100,
            minimum_stock: 10,
            barcode: 'TEST123',
            is_featured: true,
            status: 'active',
            image_url: null,
            storage_conditions: 'Cool, dry place',
            created_by: 1,
            created_by_name: 'System',
            total_sold: 0,
            total_revenue_eur: 0.00,
            total_revenue_syp: 0.00
        }
    }
];

// Helper functions (same as in controller)
const parseNumber = (value, defaultValue = null) => {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

const parseInteger = (value, defaultValue = null) => {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

const parsePositiveNumber = (value) => {
    const parsed = parseNumber(value, null);
    return parsed && parsed > 0 ? parsed : null;
};

const parsePositiveInteger = (value) => {
    const parsed = parseInteger(value, null);
    return parsed && parsed > 0 ? parsed : null;
};

async function runTests() {
    const createdProducts = [];
    
    for (const testCase of testCases) {
        try {
            console.log(`\n🔄 Running ${testCase.name}...`);
            
            // Process data the same way as controller
            const processedData = {
                ...testCase.data,
                price_syp: parsePositiveNumber(testCase.data.price_syp), // null if empty/invalid
                weight_grams: parsePositiveInteger(testCase.data.weight_grams), // null if empty/invalid
                shelf_life_days: parsePositiveInteger(testCase.data.shelf_life_days), // null if empty/invalid
                cost_eur: parseNumber(testCase.data.cost_eur, null),
                cost_syp: parseNumber(testCase.data.cost_syp, null),
                stock_quantity: parseInteger(testCase.data.stock_quantity, null),
                minimum_stock: parseInteger(testCase.data.minimum_stock, null),
            };
            
            console.log('📊 Processed data:');
            console.log('  price_syp:', processedData.price_syp);
            console.log('  weight_grams:', processedData.weight_grams);
            console.log('  shelf_life_days:', processedData.shelf_life_days);
            
            const product = await Product.create(processedData);
            createdProducts.push(product);
            
            console.log(`✅ ${testCase.name} PASSED!`);
            console.log(`   Product ID: ${product.id}`);
            console.log(`   Product Name: ${product.name}`);
            
        } catch (error) {
            console.log(`❌ ${testCase.name} FAILED!`);
            console.log(`   Error: ${error.message}`);
            if (error.errors) {
                console.log('   Validation errors:', error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                    value: e.value
                })));
            }
        }
    }
    
    // Cleanup
    for (const product of createdProducts) {
        try {
            await product.destroy();
            console.log(`🗑️  Cleaned up product: ${product.name}`);
        } catch (error) {
            console.log(`⚠️  Error cleaning up product ${product.id}: ${error.message}`);
        }
    }
}

try {
    await runTests();
} catch (error) {
    console.error('💥 Test suite failed:', error);
} finally {
    await sequelize.close();
    console.log('\n🔄 Database connection closed');
    console.log('🏁 Test completed!');
} 