import mysql from 'mysql2/promise';

async function fixOrderItemsFinalPrice() {
    let serverConnection;
    try {
        console.log('🔧 Fixing order_items table - ensuring all required columns have defaults...');

        serverConnection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        // Get current table structure
        const [columns] = await serverConnection.execute("DESCRIBE order_items");
        console.log(`📊 Current table has ${columns.length} columns`);

        // Check which columns are missing or need default values
        const columnNames = columns.map(col => col.Field);
        const columnDefaults = {};
        columns.forEach(col => {
            columnDefaults[col.Field] = col.Default;
        });

        // List of columns that should have default values
        const requiredDefaults = {
            'unit_price': 'DECIMAL(10,2) DEFAULT 0.00',
            'total_price': 'DECIMAL(10,2) DEFAULT 0.00',
            'discount_amount': 'DECIMAL(10,2) DEFAULT 0.00',
            'final_price': 'DECIMAL(10,2) DEFAULT 0.00',
            'gift_quantity': 'INT DEFAULT 0',
            'delivered_quantity': 'INT DEFAULT 0',
            'returned_quantity': 'INT DEFAULT 0',
            'damaged_quantity': 'INT DEFAULT 0'
        };

        // Fix columns that need default values
        for (const [columnName, columnDef] of Object.entries(requiredDefaults)) {
            if (columnNames.includes(columnName)) {
                // Column exists, check if it has proper default
                const currentColumn = columns.find(col => col.Field === columnName);
                if (currentColumn.Null === 'NO' && currentColumn.Default === null) {
                    console.log(`🔧 Fixing ${columnName} - adding default value...`);
                    try {
                        await serverConnection.execute(`ALTER TABLE order_items MODIFY COLUMN ${columnName} ${columnDef}`);
                        console.log(`✅ Fixed ${columnName}`);
                    } catch (error) {
                        console.error(`❌ Error fixing ${columnName}:`, error.message);
                    }
                } else {
                    console.log(`✅ ${columnName} already has proper default`);
                }
            } else {
                // Column doesn't exist, add it
                console.log(`➕ Adding missing column ${columnName}...`);
                try {
                    await serverConnection.execute(`ALTER TABLE order_items ADD COLUMN ${columnName} ${columnDef}`);
                    console.log(`✅ Added ${columnName}`);
                } catch (error) {
                    console.error(`❌ Error adding ${columnName}:`, error.message);
                }
            }
        }

        // Verify the fixes
        console.log('\n🔍 Verifying fixes...');
        const [updatedColumns] = await serverConnection.execute("DESCRIBE order_items");

        const problematicColumns = updatedColumns.filter(col =>
            requiredDefaults[col.Field] && col.Null === 'NO' && col.Default === null
        );

        if (problematicColumns.length === 0) {
            console.log('🎉 All required columns now have proper default values!');

            // Test creating a minimal order item
            console.log('\n🧪 Testing minimal order item creation...');

            // Get the first order ID for testing
            const [orders] = await serverConnection.execute("SELECT id FROM orders LIMIT 1");
            const [products] = await serverConnection.execute("SELECT id, name, price_eur FROM products LIMIT 1");

            if (orders.length > 0 && products.length > 0) {
                const testOrderId = orders[0].id;
                const testProduct = products[0];

                try {
                    await serverConnection.execute(`
                        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price_eur, total_price_eur, final_price_eur, unit_price_syp, total_price_syp, final_price_syp) 
                        VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
                    `, [
                        testOrderId,
                        testProduct.id,
                        testProduct.name,
                        testProduct.price_eur,
                        testProduct.price_eur,
                        testProduct.price_eur,
                        testProduct.price_eur * 1800, // SYP price
                        testProduct.price_eur * 1800, // SYP total
                        testProduct.price_eur * 1800  // SYP final
                    ]);

                    console.log('✅ Test order item created successfully!');

                    // Clean up test data
                    await serverConnection.execute(`
                        DELETE FROM order_items 
                        WHERE order_id = ? AND product_id = ? AND quantity = 1 
                        ORDER BY id DESC LIMIT 1
                    `, [testOrderId, testProduct.id]);

                    console.log('✅ Test data cleaned up');

                } catch (error) {
                    console.error('❌ Test failed:', error.message);
                }
            }

        } else {
            console.log('❌ Some columns still need fixes:');
            problematicColumns.forEach(col => {
                console.log(`   - ${col.Field}: ${col.Type} ${col.Null} ${col.Default}`);
            });
        }

        await serverConnection.end();
        console.log('🎉 Order items table fix completed!');

    } catch (error) {
        console.error('❌ Error fixing order items table:', error.message);
        if (serverConnection) {
            await serverConnection.end();
        }
        process.exit(1);
    }
}

// Run the fix
fixOrderItemsFinalPrice(); 