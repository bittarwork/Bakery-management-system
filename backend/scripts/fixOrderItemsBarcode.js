import mysql from 'mysql2/promise';

async function fixOrderItemsBarcode() {
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

        console.log('Current order_items columns:');
        columnNames.forEach(col => console.log(`- ${col}`));

        // Check for missing columns that might be needed
        const requiredColumns = [
            'product_barcode',
            'product_sku',
            'product_description',
            'supplier_id',
            'supplier_name'
        ];

        console.log('\nChecking for required columns...');
        const missingColumns = [];

        requiredColumns.forEach(col => {
            const exists = columnNames.includes(col);
            console.log(`- ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
            if (!exists) {
                missingColumns.push(col);
            }
        });

        if (missingColumns.length > 0) {
            console.log(`\nAdding ${missingColumns.length} missing columns...`);

            // Add missing columns
            const alterQueries = [];

            if (missingColumns.includes('product_barcode')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN product_barcode VARCHAR(100) NULL AFTER product_name');
            }

            if (missingColumns.includes('product_sku')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN product_sku VARCHAR(100) NULL AFTER product_barcode');
            }

            if (missingColumns.includes('product_description')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN product_description TEXT NULL AFTER product_sku');
            }

            if (missingColumns.includes('supplier_id')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN supplier_id INT NULL AFTER product_description');
            }

            if (missingColumns.includes('supplier_name')) {
                alterQueries.push('ALTER TABLE order_items ADD COLUMN supplier_name VARCHAR(100) NULL AFTER supplier_id');
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

            if (missingColumns.includes('product_barcode')) {
                updateQueries.push("UPDATE order_items SET product_barcode = CONCAT('BC-', id) WHERE product_barcode IS NULL");
            }

            if (missingColumns.includes('product_sku')) {
                updateQueries.push("UPDATE order_items SET product_sku = CONCAT('SKU-', id) WHERE product_sku IS NULL");
            }

            if (missingColumns.includes('product_description')) {
                updateQueries.push("UPDATE order_items SET product_description = product_name WHERE product_description IS NULL");
            }

            if (missingColumns.includes('supplier_id')) {
                updateQueries.push("UPDATE order_items SET supplier_id = 1 WHERE supplier_id IS NULL");
            }

            if (missingColumns.includes('supplier_name')) {
                updateQueries.push("UPDATE order_items SET supplier_name = 'Default Supplier' WHERE supplier_name IS NULL");
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
        requiredColumns.forEach(col => {
            const exists = updatedColumnNames.includes(col);
            console.log(`- ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });

        // Show sample data
        console.log('\nSample updated data:');
        const [items] = await serverConnection.execute(`
            SELECT order_id, product_name, product_barcode, product_sku, quantity, final_price_eur
            FROM order_items 
            LIMIT 5
        `);

        items.forEach((item, index) => {
            console.log(`${index + 1}. Order ${item.order_id}: ${item.product_name} [${item.product_barcode}] - ${item.quantity} x ${item.final_price_eur} EUR`);
        });

        console.log('\n✅ Order items table barcode columns fixed successfully!');

    } catch (error) {
        console.error('Error fixing order_items barcode columns:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

fixOrderItemsBarcode(); 