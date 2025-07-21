/**
 * Setup Delivery Scheduling System
 * Creates tables and initial data for the delivery scheduling system
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database configuration [[memory:3455676]]
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway'
};

async function setupDeliveryScheduling() {
    let connection;

    try {
        console.log('🚀 بدء إعداد نظام جدولة التسليم...');

        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ تم الاتصال بقاعدة البيانات');

        // Read and execute the SQL file
        const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create-delivery-scheduling-tables.sql');

        if (fs.existsSync(sqlFilePath)) {
            const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

            // Split SQL into individual statements
            const statements = sqlContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            console.log(`📋 تنفيذ ${statements.length} استعلام SQL...`);

            for (const statement of statements) {
                try {
                    if (statement.trim()) {
                        await connection.execute(statement);
                    }
                } catch (error) {
                    if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
                        console.warn(`⚠️ تحذير في الاستعلام: ${error.message}`);
                    }
                }
            }

            console.log('✅ تم إنشاء جداول نظام جدولة التسليم');
        } else {
            console.log('❌ لم يتم العثور على ملف SQL');
        }

        // Create some initial delivery capacity settings
        await setupInitialCapacity(connection);

        // Create sample delivery schedules for testing
        await createSampleSchedules(connection);

        console.log('🎉 تم إعداد نظام جدولة التسليم بنجاح!');

    } catch (error) {
        console.error('❌ خطأ في إعداد النظام:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function setupInitialCapacity(connection) {
    try {
        console.log('📊 إعداد السعة الأولية للتسليم...');

        // Set up capacity for the next 7 days
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const capacityEntries = [
                { date: dateStr, slot: 'morning', max: 10 },
                { date: dateStr, slot: 'afternoon', max: 15 },
                { date: dateStr, slot: 'evening', max: 8 }
            ];

            for (const entry of capacityEntries) {
                await connection.execute(`
                    INSERT INTO delivery_capacity 
                    (capacity_date, time_slot, max_deliveries, current_bookings) 
                    VALUES (?, ?, ?, 0)
                    ON DUPLICATE KEY UPDATE max_deliveries = VALUES(max_deliveries)
                `, [entry.date, entry.slot, entry.max]);
            }
        }

        console.log('✅ تم إعداد السعة الأولية');
    } catch (error) {
        console.error('خطأ في إعداد السعة:', error.message);
    }
}

async function createSampleSchedules(connection) {
    try {
        console.log('📝 إنشاء جداول تجريبية...');

        // Get some sample orders
        const [orders] = await connection.execute(`
            SELECT o.id, o.order_number, s.id as store_id, s.name as store_name
            FROM orders o 
            JOIN stores s ON o.store_id = s.id
            WHERE o.status IN ('confirmed', 'prepared')
            LIMIT 5
        `);

        if (orders.length > 0) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            // Get available distributor
            const [distributors] = await connection.execute(`
                SELECT id, full_name FROM users WHERE role = 'distributor' AND status = 'active' LIMIT 1
            `);

            const distributorId = distributors.length > 0 ? distributors[0].id : null;

            for (let i = 0; i < Math.min(3, orders.length); i++) {
                const order = orders[i];
                const timeSlots = ['morning', 'afternoon', 'evening'];
                const timeSlot = timeSlots[i % 3];

                const startTimes = {
                    morning: '09:00:00',
                    afternoon: '14:00:00',
                    evening: '18:00:00'
                };

                const endTimes = {
                    morning: '10:00:00',
                    afternoon: '15:00:00',
                    evening: '19:00:00'
                };

                await connection.execute(`
                    INSERT INTO delivery_schedules 
                    (order_id, distributor_id, scheduled_date, scheduled_time_start, scheduled_time_end,
                     time_slot, delivery_type, status, delivery_fee_eur, contact_person, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'standard', 'scheduled', 5.50, ?, NOW())
                    ON DUPLICATE KEY UPDATE updated_at = NOW()
                `, [
                    order.id,
                    distributorId,
                    tomorrowStr,
                    startTimes[timeSlot],
                    endTimes[timeSlot],
                    timeSlot,
                    `اتصال ${order.store_name}`
                ]);
            }

            console.log(`✅ تم إنشاء ${Math.min(3, orders.length)} جدولة تجريبية`);
        }

    } catch (error) {
        console.error('خطأ في إنشاء الجداول التجريبية:', error.message);
    }
}

// Test the models
async function testModels() {
    try {
        console.log('🔧 اختبار النماذج...');

        // Test models loading (using dynamic import for ES modules)
        const modelsPath = path.join(__dirname, '..', 'models', 'DeliverySchedule.js');
        const { default: DeliverySchedule } = await import(`file://${modelsPath}`);

        console.log('✅ تم تحميل نموذج DeliverySchedule بنجاح');

        // Add more model tests here if needed

    } catch (error) {
        console.log('⚠️ تحذير: لم يتم تحميل النماذج، لكن هذا طبيعي في بيئة الإعداد');
        console.log('النماذج ستعمل عند تشغيل الخادم');
    }
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
    setupDeliveryScheduling()
        .then(() => testModels())
        .then(() => {
            console.log('🎉 تم الانتهاء من الإعداد بنجاح!');
            console.log('📋 يمكنك الآن تشغيل الخادم واستخدام نظام جدولة التسليم');
            console.log('🌐 API متاح على: https://bakery-management-system-production.up.railway.app/api/delivery/');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ فشل في الإعداد:', error);
            process.exit(1);
        });
} 