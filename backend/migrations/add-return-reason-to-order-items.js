import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/bakery.db');

// Migration: Add return_reason column to order_items table
const addReturnReasonColumn = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);

        console.log('🔄 Adding return_reason column to order_items table...');

        db.serialize(() => {
            // Check if column already exists
            db.all('PRAGMA table_info(order_items)', (err, rows) => {
                if (err) {
                    console.error('❌ Error checking table info:', err);
                    db.close();
                    reject(err);
                    return;
                }

                const hasReturnReason = rows.some(row => row.name === 'return_reason');

                if (hasReturnReason) {
                    console.log('✅ return_reason column already exists, skipping...');
                    db.close();
                    resolve();
                    return;
                }

                // Add the column
                db.run('ALTER TABLE order_items ADD COLUMN return_reason VARCHAR(255)', (err) => {
                    if (err) {
                        console.error('❌ Error adding return_reason column:', err);
                        db.close();
                        reject(err);
                        return;
                    }

                    console.log('✅ Successfully added return_reason column to order_items table');
                    db.close();
                    resolve();
                });
            });
        });
    });
};

// Run migration
addReturnReasonColumn()
    .then(() => {
        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }); 