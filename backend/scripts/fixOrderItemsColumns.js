import mysql from 'mysql2/promise';

async function fixOrderItemsColumns() {
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

        console.log('Adding missing columns to order_items table...');

        // Add missing columns for multi-currency support
        const alterQueries = [
            'ALTER TABLE order_items ADD COLUMN discount_amount_eur DECIMAL(10,2) DEFAULT 0.00 AFTER total_price_syp',
            'ALTER TABLE order_items ADD COLUMN discount_amount_syp DECIMAL(15,2) DEFAULT 0.00 AFTER discount_amount_eur',
            'ALTER TABLE order_items ADD COLUMN final_price_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER discount_amount_syp',
            'ALTER TABLE order_items ADD COLUMN final_price_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER final_price_eur'
        ];

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

        // Update existing data to populate new columns
        console.log('\nUpdating existing data...');

        // Copy discount_amount to discount_amount_eur
        await serverConnection.execute(`
            UPDATE order_items 
            SET discount_amount_eur = COALESCE(discount_amount, 0.00)
            WHERE discount_amount_eur = 0.00
        `);
        console.log('✅ Updated discount_amount_eur from discount_amount');

        // Copy final_price to final_price_eur
        await serverConnection.execute(`
            UPDATE order_items 
            SET final_price_eur = COALESCE(final_price, total_price_eur)
            WHERE final_price_eur = 0.00
        `);
        console.log('✅ Updated final_price_eur from final_price');

        // Calculate SYP values based on EUR values (assuming exchange rate of 1800)
        const exchangeRate = 1800;
        await serverConnection.execute(`
            UPDATE order_items 
            SET 
                discount_amount_syp = discount_amount_eur * ${exchangeRate},
                final_price_syp = final_price_eur * ${exchangeRate}
            WHERE discount_amount_syp = 0.00 AND final_price_syp = 0.00
        `);
        console.log('✅ Updated SYP values based on EUR values');

        // Verify the changes
        console.log('\nVerifying changes...');
        const [columns] = await serverConnection.execute("DESCRIBE order_items");
        const columnNames = columns.map(col => col.Field);

        console.log('Required columns check:');
        console.log(`- discount_amount_eur: ${columnNames.includes('discount_amount_eur') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- discount_amount_syp: ${columnNames.includes('discount_amount_syp') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- final_price_eur: ${columnNames.includes('final_price_eur') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- final_price_syp: ${columnNames.includes('final_price_syp') ? '✅ EXISTS' : '❌ MISSING'}`);

        // Show sample updated data
        console.log('\nSample updated data:');
        const [items] = await serverConnection.execute(`
            SELECT order_id, product_name, quantity, unit_price_eur, total_price_eur, 
                   discount_amount_eur, final_price_eur, discount_amount_syp, final_price_syp
            FROM order_items 
            LIMIT 3
        `);

        items.forEach((item, index) => {
            console.log(`\nItem ${index + 1}:`);
            console.log(`  Order ID: ${item.order_id}`);
            console.log(`  Product: ${item.product_name}`);
            console.log(`  Quantity: ${item.quantity}`);
            console.log(`  Unit Price EUR: ${item.unit_price_eur}`);
            console.log(`  Total Price EUR: ${item.total_price_eur}`);
            console.log(`  Discount EUR: ${item.discount_amount_eur}`);
            console.log(`  Final Price EUR: ${item.final_price_eur}`);
            console.log(`  Discount SYP: ${item.discount_amount_syp}`);
            console.log(`  Final Price SYP: ${item.final_price_syp}`);
        });

        console.log('\n✅ Order items table structure fixed successfully!');

    } catch (error) {
        console.error('Error fixing order_items columns:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

fixOrderItemsColumns(); 