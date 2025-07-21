/**
 * Comprehensive Delivery System Verification Script
 * Verifies all components of the delivery scheduling system are working correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration [[memory:3455676]]
const API_BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';
const DB_CONFIG = {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway'
};

class DeliverySystemVerification {
    constructor() {
        this.results = {
            files: { passed: 0, failed: 0 },
            database: { passed: 0, failed: 0 },
            api: { passed: 0, failed: 0 },
            models: { passed: 0, failed: 0 }
        };
        this.errors = [];
        this.details = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
        this.details.push({ timestamp, type, message });
    }

    async verifyFiles() {
        this.log('🔍 التحقق من الملفات الأساسية...', 'info');

        const requiredFiles = [
            'migrations/create-delivery-scheduling-tables.sql',
            'models/DeliverySchedule.js',
            'models/DeliveryCapacity.js',
            'models/DeliveryTracking.js',
            'controllers/deliverySchedulingController.js',
            'routes/deliverySchedulingRoutes.js',
            'scripts/setupDeliveryScheduling.js',
            'scripts/testDeliverySchedulingAPI.js'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(__dirname, '..', file);
            try {
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    this.log(`ملف موجود: ${file} (${stats.size} bytes)`, 'success');
                    this.results.files.passed++;
                } else {
                    this.log(`ملف مفقود: ${file}`, 'error');
                    this.results.files.failed++;
                    this.errors.push(`Missing file: ${file}`);
                }
            } catch (error) {
                this.log(`خطأ في التحقق من الملف ${file}: ${error.message}`, 'error');
                this.results.files.failed++;
                this.errors.push(`File check error: ${file} - ${error.message}`);
            }
        }

        // Verify model integration in index.js
        try {
            const indexPath = path.join(__dirname, '..', 'models', 'index.js');
            const indexContent = fs.readFileSync(indexPath, 'utf8');

            const requiredImports = ['DeliverySchedule', 'DeliveryCapacity', 'DeliveryTracking'];
            let importsFound = 0;

            for (const importName of requiredImports) {
                if (indexContent.includes(`import ${importName}`)) {
                    importsFound++;
                    this.log(`تم العثور على استيراد: ${importName}`, 'success');
                } else {
                    this.log(`استيراد مفقود: ${importName}`, 'error');
                    this.errors.push(`Missing import: ${importName}`);
                }
            }

            if (importsFound === requiredImports.length) {
                this.results.models.passed++;
            } else {
                this.results.models.failed++;
            }
        } catch (error) {
            this.log(`خطأ في التحقق من models/index.js: ${error.message}`, 'error');
            this.results.models.failed++;
        }

        // Verify routes registration
        try {
            const routesIndexPath = path.join(__dirname, '..', 'routes', 'index.js');
            const routesContent = fs.readFileSync(routesIndexPath, 'utf8');

            if (routesContent.includes('deliverySchedulingRoutes') &&
                routesContent.includes('router.use(\'/delivery\', deliverySchedulingRoutes)')) {
                this.log('تسجيل routes تم بنجاح', 'success');
                this.results.files.passed++;
            } else {
                this.log('تسجيل routes مفقود', 'error');
                this.results.files.failed++;
                this.errors.push('Delivery routes not registered');
            }
        } catch (error) {
            this.log(`خطأ في التحقق من تسجيل routes: ${error.message}`, 'error');
            this.results.files.failed++;
        }
    }

    async verifyDatabase() {
        this.log('🗄️ التحقق من قاعدة البيانات...', 'info');

        let connection;
        try {
            connection = await mysql.createConnection(DB_CONFIG);
            this.log('تم الاتصال بقاعدة البيانات بنجاح', 'success');
            this.results.database.passed++;

            // Check if delivery tables exist
            const requiredTables = [
                'delivery_schedules',
                'delivery_capacity',
                'delivery_tracking',
                'delivery_routes',
                'delivery_performance',
                'delivery_settings'
            ];

            for (const table of requiredTables) {
                try {
                    const [rows] = await connection.execute(
                        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = ? AND table_schema = ?',
                        [table, 'railway']
                    );

                    if (rows[0].count > 0) {
                        // Check table structure
                        const [columns] = await connection.execute(`DESCRIBE ${table}`);
                        this.log(`جدول موجود: ${table} (${columns.length} columns)`, 'success');
                        this.results.database.passed++;
                    } else {
                        this.log(`جدول مفقود: ${table}`, 'error');
                        this.results.database.failed++;
                        this.errors.push(`Missing table: ${table}`);
                    }
                } catch (error) {
                    this.log(`خطأ في التحقق من الجدول ${table}: ${error.message}`, 'error');
                    this.results.database.failed++;
                }
            }

            // Check for sample data
            try {
                const [capacityRows] = await connection.execute('SELECT COUNT(*) as count FROM delivery_capacity');
                if (capacityRows[0].count > 0) {
                    this.log(`بيانات السعة: ${capacityRows[0].count} سجل`, 'success');
                    this.results.database.passed++;
                } else {
                    this.log('لا توجد بيانات سعة', 'warn');
                }
            } catch (error) {
                this.log(`خطأ في فحص بيانات السعة: ${error.message}`, 'warn');
            }

        } catch (error) {
            this.log(`فشل الاتصال بقاعدة البيانات: ${error.message}`, 'error');
            this.results.database.failed++;
            this.errors.push(`Database connection failed: ${error.message}`);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }

    async verifyAPI() {
        this.log('🌐 التحقق من API endpoints...', 'info');

        // Test health endpoint
        try {
            const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 });
            if (response.data.success) {
                this.log('Health endpoint يعمل بنجاح', 'success');
                this.results.api.passed++;
            } else {
                this.log('Health endpoint لا يعمل بشكل صحيح', 'error');
                this.results.api.failed++;
            }
        } catch (error) {
            this.log(`خطأ في health endpoint: ${error.message}`, 'error');
            this.results.api.failed++;
            this.errors.push(`Health endpoint failed: ${error.message}`);
        }

        // Test delivery endpoints (basic access check - should require auth)
        const deliveryEndpoints = [
            '/delivery/schedules',
            '/delivery/capacity',
            '/delivery/tracking/live',
            '/delivery/schedules/analytics'
        ];

        for (const endpoint of deliveryEndpoints) {
            try {
                const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
                    timeout: 5000,
                    validateStatus: status => status < 500 // Accept auth errors (401, 403) as valid
                });

                if (response.status === 401 || response.status === 403) {
                    this.log(`Endpoint محمي بشكل صحيح: ${endpoint} (${response.status})`, 'success');
                    this.results.api.passed++;
                } else if (response.status === 200) {
                    this.log(`Endpoint متاح: ${endpoint}`, 'success');
                    this.results.api.passed++;
                } else {
                    this.log(`استجابة غير متوقعة من ${endpoint}: ${response.status}`, 'warn');
                }
            } catch (error) {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    this.log(`Endpoint محمي بشكل صحيح: ${endpoint} (${error.response.status})`, 'success');
                    this.results.api.passed++;
                } else {
                    this.log(`خطأ في endpoint ${endpoint}: ${error.message}`, 'error');
                    this.results.api.failed++;
                    this.errors.push(`API endpoint failed: ${endpoint} - ${error.message}`);
                }
            }
        }
    }

    async runAllVerifications() {
        this.log('🚀 بدء التحقق الشامل من نظام جدولة التسليم...', 'info');

        await this.verifyFiles();
        await this.verifyDatabase();
        await this.verifyAPI();

        this.printResults();
        return this.results;
    }

    printResults() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 نتائج التحقق من النظام');
        console.log('='.repeat(80));

        const categories = [
            { name: 'الملفات والمكونات', data: this.results.files },
            { name: 'قاعدة البيانات', data: this.results.database },
            { name: 'API Endpoints', data: this.results.api },
            { name: 'النماذج والتكامل', data: this.results.models }
        ];

        let totalPassed = 0;
        let totalFailed = 0;

        for (const category of categories) {
            const { name, data } = category;
            const total = data.passed + data.failed;
            const percentage = total > 0 ? ((data.passed / total) * 100).toFixed(1) : '0.0';

            console.log(`\n${name}:`);
            console.log(`  ✅ نجح: ${data.passed}`);
            console.log(`  ❌ فشل: ${data.failed}`);
            console.log(`  📈 نسبة النجاح: ${percentage}%`);

            totalPassed += data.passed;
            totalFailed += data.failed;
        }

        const overallTotal = totalPassed + totalFailed;
        const overallPercentage = overallTotal > 0 ? ((totalPassed / overallTotal) * 100).toFixed(1) : '0.0';

        console.log('\n' + '-'.repeat(40));
        console.log('📋 الإجمالي:');
        console.log(`  ✅ نجح: ${totalPassed}`);
        console.log(`  ❌ فشل: ${totalFailed}`);
        console.log(`  📈 نسبة النجاح الإجمالية: ${overallPercentage}%`);

        if (this.errors.length > 0) {
            console.log('\n❌ الأخطاء المكتشفة:');
            this.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        const status = overallPercentage >= 90 ? '🎉 ممتاز' :
            overallPercentage >= 70 ? '✅ جيد' :
                overallPercentage >= 50 ? '⚠️ مقبول' : '❌ يحتاج تحسين';

        console.log(`\n🎯 حالة النظام: ${status}`);
        console.log('='.repeat(80));

        // System health summary
        if (overallPercentage >= 90) {
            console.log('\n🎉 نظام جدولة التسليم جاهز ويعمل بكامل طاقته!');
            console.log('✨ جميع المكونات تعمل بشكل صحيح ويمكن البدء في الاستخدام.');
        } else if (overallPercentage >= 70) {
            console.log('\n✅ نظام جدولة التسليم يعمل بشكل جيد مع بعض التحسينات المطلوبة.');
        } else {
            console.log('\n⚠️ نظام جدولة التسليم يحتاج إلى مراجعة وإصلاح الأخطاء.');
        }
    }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const verifier = new DeliverySystemVerification();
    verifier.runAllVerifications()
        .then(() => {
            process.exit(verifier.results.files.failed + verifier.results.database.failed + verifier.results.api.failed + verifier.results.models.failed > 0 ? 1 : 0);
        })
        .catch((error) => {
            console.error('❌ فشل في التحقق من النظام:', error);
            process.exit(1);
        });
}

export default DeliverySystemVerification; 