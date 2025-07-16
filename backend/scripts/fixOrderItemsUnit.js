import mysql from 'mysql2/promise';

async function fixOrderItemsUnit() {
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

        // Check if unit column exists
        const [columns] = await serverConnection.execute("DESCRIBE order_items");
        const columnNames = columns.map(col => col.Field);

        console.log('Checking for unit column...');
        const hasUnit = columnNames.includes('unit');
        console.log(`- unit column: ${hasUnit ? '✅ EXISTS' : '❌ MISSING'}`);

        if (!hasUnit) {
            console.log('Adding unit column to order_items table...');

            // Add unit column
            await serverConnection.execute(`
                ALTER TABLE order_items 
                ADD COLUMN unit VARCHAR(50) NULL DEFAULT 'piece' 
                AFTER product_name
            `);
            console.log('✅ Added unit column');

            // Update existing data with default unit values
            await serverConnection.execute(`
                UPDATE order_items 
                SET unit = 'piece' 
                WHERE unit IS NULL
            `);
            console.log('✅ Updated existing rows with default unit');
        }

        // Check if product_category column exists (also might be needed)
        const hasProductCategory = columnNames.includes('product_category');
        console.log(`- product_category column: ${hasProductCategory ? '✅ EXISTS' : '❌ MISSING'}`);

        if (!hasProductCategory) {
            console.log('Adding product_category column to order_items table...');

            await serverConnection.execute(`
                ALTER TABLE order_items 
                ADD COLUMN product_category VARCHAR(50) NULL DEFAULT 'bakery' 
                AFTER unit
            `);
            console.log('✅ Added product_category column');

            // Update existing data with default category
            await serverConnection.execute(`
                UPDATE order_items 
                SET product_category = 'bakery' 
                WHERE product_category IS NULL
            `);
            console.log('✅ Updated existing rows with default category');
        }

        // Verify the changes
        console.log('\nVerifying changes...');
        const [updatedColumns] = await serverConnection.execute("DESCRIBE order_items");
        const updatedColumnNames = updatedColumns.map(col => col.Field);

        console.log('Updated columns check:');
        console.log(`- unit: ${updatedColumnNames.includes('unit') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- product_category: ${updatedColumnNames.includes('product_category') ? '✅ EXISTS' : '❌ MISSING'}`);

        // Show sample data
        console.log('\nSample updated data:');
        const [items] = await serverConnection.execute(`
            SELECT order_id, product_name, unit, product_category, quantity, final_price_eur
            FROM order_items 
            LIMIT 5
        `);

        items.forEach((item, index) => {
            console.log(`${index + 1}. Order ${item.order_id}: ${item.product_name} (${item.unit}) - ${item.product_category} - ${item.quantity} x ${item.final_price_eur} EUR`);
        });

        console.log('\n✅ Order items table unit column fixed successfully!');

    } catch (error) {
        console.error('Error fixing order_items unit column:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

fixOrderItemsUnit(); 