import mysql from 'mysql2/promise';

async function fixOrderItemsDelivery() {
    let serverConnection;
    try {
        console.log('Connecting to Railway database...');

        serverConnection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        // Check current columns
        const [columns] = await serverConnection.execute("DESCRIBE order_items");
        const columnNames = columns.map(col => col.Field);

        console.log('Current order_items columns count:', columnNames.length);

        // Check for missing delivery-related columns
        const deliveryColumns = [
            'delivered_quantity',
            'returned_quantity',
            'damaged_quantity',
            'delivery_date',
            'delivery_status',
            'delivery_notes',
            'delivery_confirmed_by',
            'delivery_confirmed_at',
            'tracking_number',
            'delivery_method',
            'estimated_delivery_date',
            'actual_delivery_date'
        ];

        console.log('\nChecking for delivery-related columns...');
        const missingColumns = [];

        deliveryColumns.forEach(col => {
            const exists = columnNames.includes(col);
            console.log(`- ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
            if (!exists) {
                missingColumns.push(col);
            }
        });

        if (missingColumns.length > 0) {
            console.log(`\nAdding ${missingColumns.length} missing delivery columns...`);

            // Add missing columns
            const alterQueries = [];

            if (missingColumns.includes('delivered_quantity')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN delivered_quantity INT DEFAULT 0 AFTER quantity');
            }

            if (missingColumns.includes('returned_quantity')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN returned_quantity INT DEFAULT 0 AFTER delivered_quantity');
            }

            if (missingColumns.includes('damaged_quantity')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN damaged_quantity INT DEFAULT 0 AFTER returned_quantity');
            }

            if (missingColumns.includes('delivery_date')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN delivery_date DATE NULL AFTER damaged_quantity');
            }

            if (missingColumns.includes('delivery_status')) {
                alterQueries.push("ALTER TABLE order_items ADD COLUMN delivery_status ENUM('pending', 'in_transit', 'delivered', 'returned', 'cancelled') DEFAULT 'pending' AFTER delivery_date");
            }

            if (missingColumns.includes('delivery_notes')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN delivery_notes TEXT NULL AFTER delivery_status');
            }

            if (missingColumns.includes('delivery_confirmed_by')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN delivery_confirmed_by INT NULL AFTER delivery_notes');
            }

            if (missingColumns.includes('delivery_confirmed_at')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN delivery_confirmed_at TIMESTAMP NULL AFTER delivery_confirmed_by');
            }

            if (missingColumns.includes('tracking_number')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN tracking_number VARCHAR(100) NULL AFTER delivery_confirmed_at');
            }

            if (missingColumns.includes('delivery_method')) {
                alterQueries.push("ALTER TABLE order_items ADD COLUMN delivery_method ENUM('pickup', 'delivery', 'shipping') DEFAULT 'delivery' AFTER tracking_number");
            }

            if (missingColumns.includes('estimated_delivery_date')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN estimated_delivery_date DATE NULL AFTER delivery_method');
            }

            if (missingColumns.includes('actual_delivery_date')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN actual_delivery_date DATE NULL AFTER estimated_delivery_date');
            }

            for (const query of alterQueries) {
                try {
                    await serverConnection.execute(query);
                    console.log(`✅ Executed: ${query}`);
                } catch (error) {
                    if (error.message.includes('Duplicate column name')) {
                        console.log(`⚠️  Column already exists: ${query}`);
                    } else {
                        console.error(`❌ Error executing: ${query}`);
                        console.error(`   Error: ${error.message}`);
                    }
                }
            }

            // Update existing data with default values
            console.log('\nUpdating existing data with default values...');

            const updateQueries = [];

            if (missingColumns.includes('delivered_quantity')) {
                updateQueries.push("UPDATE order_items SET delivered_quantity = quantity WHERE delivered_quantity = 0");
            }

            if (missingColumns.includes('delivery_status')) {
                updateQueries.push("UPDATE order_items SET delivery_status = 'delivered' WHERE delivery_status = 'pending'");
            }

            if (missingColumns.includes('delivery_method')) {
                updateQueries.push("UPDATE order_items SET delivery_method = 'delivery' WHERE delivery_method IS NULL");
            }

            if (missingColumns.includes('delivery_date')) {
                updateQueries.push("UPDATE order_items SET delivery_date = DATE(created_at) WHERE delivery_date IS NULL");
            }

            if (missingColumns.includes('actual_delivery_date')) {
                updateQueries.push("UPDATE order_items SET actual_delivery_date = DATE(created_at) WHERE actual_delivery_date IS NULL");
            }

            for (const query of updateQueries) {
                try {
                    await serverConnection.execute(query);
                    console.log(`✅ Updated: ${query}`);
                } catch (error) {
                    console.error(`❌ Error updating: ${query}`);
                    console.error(`   Error: ${error.message}`);
                }
            }
        }

        // Verify the changes
        console.log('\nVerifying changes...');
        const [updatedColumns] = await serverConnection.execute("DESCRIBE order_items");
        const updatedColumnNames = updatedColumns.map(col => col.Field);

        console.log('Updated columns check:');
        deliveryColumns.forEach(col => {
            const exists = updatedColumnNames.includes(col);
            console.log(`- ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });

        console.log(`\nTotal columns in order_items: ${updatedColumnNames.length}`);

        // Show sample data
        console.log('\nSample updated data:');
        const [items] = await serverConnection.execute(`
            SELECT order_id, product_name, quantity, delivered_quantity, 
                   delivery_status, delivery_method, final_price_eur
            FROM order_items 
            LIMIT 5
        `);

        items.forEach((item, index) => {
            console.log(`${index + 1}. Order ${item.order_id}: ${item.product_name} - ${item.quantity}/${item.delivered_quantity} - ${item.delivery_status} - ${item.final_price_eur} EUR`);
        });

        console.log('\n✅ Order items table delivery columns fixed successfully!');

    } catch (error) {
        console.error('Error fixing order_items delivery columns:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

fixOrderItemsDelivery(); 