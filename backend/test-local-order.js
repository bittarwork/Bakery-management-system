import { initializeModels } from './models/index.js';
import Order from './models/Order.js';
import OrderItem from './models/OrderItem.js';
import Store from './models/Store.js';
import Product from './models/Product.js';
import User from './models/User.js';
import sequelize from './config/database.js';
import { Transaction } from 'sequelize';

async function testLocalOrderCreation() {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    timeout: 30000
  });

  try {
    console.log('🧪 Testing local order creation...');
    
    // Initialize models
    await initializeModels();
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Get test data
    const store = await Store.findByPk(6);
    const product = await Product.findByPk(3);
    const user = await User.findByPk(1);
    
    console.log('📋 Test data:');
    console.log('  Store:', store ? `${store.id} - ${store.name}` : 'NOT FOUND');
    console.log('  Product:', product ? `${product.id} - ${product.name}` : 'NOT FOUND');
    console.log('  User:', user ? `${user.id} - ${user.username}` : 'NOT FOUND');
    
    if (!store || !product || !user) {
      throw new Error('Required test data not found');
    }
    
    // Generate order number
    const orderNumber = await Order.generateOrderNumber();
    console.log('🔢 Generated order number:', orderNumber);
    
    // Calculate totals
    const quantity = 25;
    const unitPriceEur = parseFloat(product.price_eur) || 0;
    const itemTotalEur = unitPriceEur * quantity;
    
    console.log('💰 Pricing calculation:');
    console.log(`  Quantity: ${quantity}`);
    console.log(`  Unit Price: €${unitPriceEur}`);
    console.log(`  Total: €${itemTotalEur}`);
    
    // Create order
    console.log('🏗️ Creating order...');
    const order = await Order.create({
      order_number: orderNumber,
      store_id: store.id,
      store_name: store.name,
      total_amount_eur: itemTotalEur,
      total_amount_syp: 0,
      final_amount_eur: itemTotalEur,
      final_amount_syp: 0,
      currency: 'EUR',
      status: 'draft',
      payment_status: 'pending',
      delivery_date: '2025-07-29',
      notes: 'test order from local script',
      created_by: user.id,
      created_by_name: user.full_name || user.username
    }, { transaction });
    
    console.log('✅ Order created successfully:', {
      id: order.id,
      order_number: order.order_number
    });
    
    // Create order item with exact field names from database
    console.log('📦 Creating order item...');
    const orderItem = await OrderItem.create({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      unit: product.unit || 'piece',
      quantity: quantity,
      unit_price_eur: unitPriceEur,
      unit_price_syp: 0,
      total_price_eur: itemTotalEur,
      total_price_syp: 0,
      final_price_eur: itemTotalEur,
      notes: 'test item from local script'
    }, { transaction });
    
    console.log('✅ Order item created successfully:', {
      id: orderItem.id,
      product_name: orderItem.product_name,
      quantity: orderItem.quantity
    });
    
    // Commit transaction
    await transaction.commit();
    console.log('✅ Transaction committed successfully');
    
    console.log('🎉 Local order creation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in local order creation:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    try {
      await transaction.rollback();
      console.log('✅ Transaction rolled back');
    } catch (rollbackError) {
      console.error('❌ Error rolling back transaction:', rollbackError);
    }
  } finally {
    await sequelize.close();
  }
}

testLocalOrderCreation();