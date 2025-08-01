#!/usr/bin/env node

/**
 * Final Cleanup - التنظيف النهائي للجداول والملفات
 */

import DatabaseManager from './database-manager.js';

async function finalCleanup() {
    const dbManager = new DatabaseManager();

    try {
        await dbManager.connect();

        console.log('🧹 Final cleanup - removing remaining unused tables...');

        // إزالة foreign key constraints أولاً ثم حذف الجداول
        const cleanupSteps = [
            // 1. حذف store_visits (تنظيف المراجع أولاً)
            {
                name: 'Remove store_visits foreign key from payments',
                sql: `ALTER TABLE payments DROP FOREIGN KEY IF EXISTS payments_ibfk_4`
            },
            {
                name: 'Drop store_visits table',
                sql: `DROP TABLE IF EXISTS store_visits`
            },

            // 2. حذف distribution_routes
            {
                name: 'Drop distribution_routes table',
                sql: `DROP TABLE IF EXISTS distribution_routes`
            }
        ];

        for (const step of cleanupSteps) {
            try {
                await dbManager.connection.execute(step.sql);
                console.log(`✅ ${step.name}`);
            } catch (error) {
                if (error.message.includes("doesn't exist") || error.message.includes("check that column/key exists")) {
                    console.log(`⚠️  ${step.name} - Already cleaned`);
                } else {
                    console.error(`❌ ${step.name}:`, error.message);
                }
            }
        }

        // التحقق من الحالة النهائية
        console.log('\n📊 Final database state:');
        const [tables] = await dbManager.connection.execute('SHOW TABLES');
        console.log(`Total tables: ${tables.length}`);

        console.log('\nRemaining tables:');
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`${index + 1}. ${tableName}`);
        });

        console.log('\n🎉 Final cleanup completed successfully!');

    } catch (error) {
        console.error('💥 Error during final cleanup:', error.message);
    } finally {
        await dbManager.disconnect();
    }
}

// تشغيل التنظيف النهائي
finalCleanup().catch(console.error);