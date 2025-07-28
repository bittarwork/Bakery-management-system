import Product from './models/Product.js';
import sequelize from './config/database.js';

console.log('Testing product creation...');

const testProduct = {
    name: 'Test Product',
    description: 'Test Description',
    category: 'bread',
    unit: 'piece',
    price_eur: 1.50,
    price_syp: 0,  // Changed from null to 0
    cost_eur: 0,   // Changed from null to 0
    cost_syp: 0,   // Changed from null to 0
    stock_quantity: 0,  // Changed from null to 0
    minimum_stock: 0,   // Changed from null to 0
    barcode: null,
    is_featured: false,
    status: 'active',
    image_url: null,
    weight_grams: 0,      // Changed from null to 0
    shelf_life_days: 0,   // Changed from null to 0
    storage_conditions: null,
    created_by: 1,
    created_by_name: 'System',
    total_sold: 0,
    total_revenue_eur: 0.00,
    total_revenue_syp: 0.00
};

try {
    console.log('Creating product with data:', JSON.stringify(testProduct, null, 2));
    
    const product = await Product.create(testProduct);
    console.log('✅ Product created successfully!');
    console.log('Product ID:', product.id);
    console.log('Product Name:', product.name);
    
    // Clean up
    await product.destroy();
    console.log('✅ Test product cleaned up');
    
} catch (error) {
    console.error('❌ Error creating product:', error.message);
    if (error.errors) {
        console.error('Validation errors:', error.errors.map(e => ({
            field: e.path,
            message: e.message,
            value: e.value
        })));
    }
} finally {
    await sequelize.close();
    console.log('Database connection closed');
} 