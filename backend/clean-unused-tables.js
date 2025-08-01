#!/usr/bin/env node

/**
 * Clean Unused Tables - حذف الجداول والملفات غير المستخدمة
 */

import DatabaseManager from './database-manager.js';
import fs from 'fs';
import path from 'path';

async function cleanUnusedTables() {
    const dbManager = new DatabaseManager();

    // الجداول المراد حذفها (فارغة أو غير مستخدمة)
    const tablesToDrop = [
        'delivery_schedules',
        'distribution_routes',
        'distributor_assignments',
        'distributor_payments',
        'distributor_statistics',
        'distributor_store_assignments',
        'route_optimization_cache',
        'route_stores',
        'scheduling_drafts',
        'store_visits'
    ];

    try {
        await dbManager.connect();

        console.log('🧹 Starting cleanup of unused tables and files...');

        // Drop unused tables
        console.log('\n🗑️  Dropping unused tables...');
        for (const table of tablesToDrop) {
            try {
                await dbManager.connection.execute(`DROP TABLE IF EXISTS ${table}`);
                console.log(`✅ Dropped table: ${table}`);
            } catch (error) {
                console.error(`❌ Error dropping table ${table}:`, error.message);
            }
        }

        console.log('\n🎉 Database cleanup completed!');

    } catch (error) {
        console.error('💥 Error during cleanup:', error.message);
    } finally {
        await dbManager.disconnect();
    }
}

// تشغيل التنظيف
cleanUnusedTables().catch(console.error);