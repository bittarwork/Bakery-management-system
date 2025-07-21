/**
 * Test Delivery Scheduling API
 * Comprehensive testing of the delivery scheduling system APIs
 */

import axios from 'axios';

// API Base URL [[memory:3077652]]
const API_BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

// Test credentials [[memory:2647906]]
const TEST_CREDENTIALS = {
    admin: { email: 'admin@bakery.com', password: 'admin123' },
    distributor: { email: 'distributor1@bakery.com', password: 'distributor123' }
};

let authTokens = {
    admin: null,
    distributor: null
};

class DeliverySchedulingAPITest {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    // Test authentication
    async testAuthentication() {
        console.log('🔐 اختبار المصادقة...');

        try {
            // Test admin login
            const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS.admin);
            authTokens.admin = adminLogin.data.token;
            console.log('✅ تسجيل دخول المدير نجح');
            this.results.passed++;

            // Test distributor login
            const distributorLogin = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS.distributor);
            authTokens.distributor = distributorLogin.data.token;
            console.log('✅ تسجيل دخول الموزع نجح');
            this.results.passed++;

        } catch (error) {
            console.error('❌ فشل في المصادقة:', error.response?.data?.message || error.message);
            this.results.failed++;
            this.results.errors.push('Authentication failed');
        }
    }

    // Test delivery schedules API
    async testDeliverySchedules() {
        console.log('📅 اختبار جداول التسليم...');

        if (!authTokens.admin) {
            console.log('❌ لا يوجد token للمدير');
            return;
        }

        const headers = { 'Authorization': `Bearer ${authTokens.admin}` };

        try {
            // Test get schedules (list view)
            const listResponse = await axios.get(`${API_BASE_URL}/delivery/schedules?view=list`, { headers });
            console.log('✅ جلب الجداول (عرض قائمة) نجح');
            console.log(`   📊 ${listResponse.data.data.schedules.length} جدولة موجودة`);
            this.results.passed++;

            // Test get schedules (calendar view)
            const calendarResponse = await axios.get(`${API_BASE_URL}/delivery/schedules?view=calendar`, { headers });
            console.log('✅ جلب الجداول (عرض تقويم) نجح');
            this.results.passed++;

            // Test create delivery schedule (if we have orders)
            await this.testCreateDeliverySchedule(headers);

        } catch (error) {
            console.error('❌ فشل في اختبار الجداول:', error.response?.data?.message || error.message);
            this.results.failed++;
            this.results.errors.push('Delivery schedules test failed');
        }
    }

    // Test creating a delivery schedule
    async testCreateDeliverySchedule(headers) {
        try {
            // First, get available orders
            const ordersResponse = await axios.get(`${API_BASE_URL}/orders?status=confirmed&limit=1`, { headers });

            if (ordersResponse.data.data && ordersResponse.data.data.length > 0) {
                const order = ordersResponse.data.data[0];

                // Get available distributor
                const usersResponse = await axios.get(`${API_BASE_URL}/users?role=distributor&limit=1`, { headers });
                const distributor = usersResponse.data.data?.[0];

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];

                const newSchedule = {
                    order_id: order.id,
                    distributor_id: distributor?.id,
                    scheduled_date: tomorrowStr,
                    scheduled_time_start: '10:00:00',
                    scheduled_time_end: '11:00:00',
                    time_slot: 'morning',
                    delivery_type: 'standard',
                    priority: 'normal',
                    delivery_fee_eur: 5.50,
                    contact_person: 'اختبار API',
                    contact_phone: '+32123456789'
                };

                const createResponse = await axios.post(`${API_BASE_URL}/delivery/schedules`, newSchedule, { headers });
                console.log('✅ إنشاء جدولة تسليم نجح');
                console.log(`   🆔 معرف الجدولة: ${createResponse.data.data.id}`);
                this.results.passed++;

                // Test schedule update
                await this.testUpdateDeliverySchedule(createResponse.data.data.id, headers);

            } else {
                console.log('⚠️ لا توجد طلبات متاحة للاختبار');
            }

        } catch (error) {
            console.error('❌ فشل في إنشاء جدولة:', error.response?.data?.message || error.message);
            this.results.failed++;
        }
    }

    // Test updating a delivery schedule
    async testUpdateDeliverySchedule(scheduleId, headers) {
        try {
            const updateData = {
                scheduled_time_start: '11:00:00',
                scheduled_time_end: '12:00:00',
                delivery_instructions: 'تحديث من اختبار API'
            };

            await axios.put(`${API_BASE_URL}/delivery/schedules/${scheduleId}`, updateData, { headers });
            console.log('✅ تحديث الجدولة نجح');
            this.results.passed++;

        } catch (error) {
            console.error('❌ فشل في تحديث الجدولة:', error.response?.data?.message || error.message);
            this.results.failed++;
        }
    }

    // Test delivery capacity API
    async testDeliveryCapacity() {
        console.log('📊 اختبار سعة التسليم...');

        if (!authTokens.admin) return;

        const headers = { 'Authorization': `Bearer ${authTokens.admin}` };

        try {
            const response = await axios.get(`${API_BASE_URL}/delivery/capacity`, { headers });
            console.log('✅ جلب سعة التسليم نجح');
            console.log(`   📈 ${response.data.data.capacity_data.length} سجل سعة`);
            console.log(`   💡 ${response.data.data.suggested_slots.length} فترة مقترحة`);
            this.results.passed++;

        } catch (error) {
            console.error('❌ فشل في اختبار السعة:', error.response?.data?.message || error.message);
            this.results.failed++;
            this.results.errors.push('Delivery capacity test failed');
        }
    }

    // Test delivery analytics
    async testDeliveryAnalytics() {
        console.log('📈 اختبار التحليلات...');

        if (!authTokens.admin) return;

        const headers = { 'Authorization': `Bearer ${authTokens.admin}` };

        try {
            const response = await axios.get(`${API_BASE_URL}/delivery/schedules/analytics`, { headers });
            console.log('✅ جلب التحليلات نجح');
            console.log(`   📊 ${response.data.data.overall_stats.total_schedules} إجمالي الجداول`);
            console.log(`   ✅ ${response.data.data.overall_stats.completion_rate}% معدل الإنجاز`);
            this.results.passed++;

        } catch (error) {
            console.error('❌ فشل في اختبار التحليلات:', error.response?.data?.message || error.message);
            this.results.failed++;
            this.results.errors.push('Delivery analytics test failed');
        }
    }

    // Test live tracking
    async testLiveTracking() {
        console.log('🚚 اختبار التتبع المباشر...');

        if (!authTokens.distributor) return;

        const headers = { 'Authorization': `Bearer ${authTokens.distributor}` };

        try {
            const response = await axios.get(`${API_BASE_URL}/delivery/tracking/live`, { headers });
            console.log('✅ جلب التتبع المباشر نجح');
            console.log(`   🚛 ${response.data.data.active_deliveries.length} تسليم نشط`);
            this.results.passed++;

        } catch (error) {
            console.error('❌ فشل في اختبار التتبع:', error.response?.data?.message || error.message);
            this.results.failed++;
            this.results.errors.push('Live tracking test failed');
        }
    }

    // Test time slot availability
    async testTimeSlotAvailability() {
        console.log('⏰ اختبار توفر الأوقات...');

        if (!authTokens.admin) return;

        const headers = { 'Authorization': `Bearer ${authTokens.admin}` };

        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            const checkData = {
                date: tomorrowStr,
                start_time: '09:00:00',
                end_time: '10:00:00'
            };

            const response = await axios.post(`${API_BASE_URL}/delivery/check-availability`, checkData, { headers });
            console.log('✅ فحص توفر الوقت نجح');
            console.log(`   ✅ متوفر: ${response.data.data.is_available}`);
            this.results.passed++;

        } catch (error) {
            console.error('❌ فشل في فحص التوفر:', error.response?.data?.message || error.message);
            this.results.failed++;
            this.results.errors.push('Time slot availability test failed');
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 بدء اختبار نظام جدولة التسليم...');
        console.log('='.repeat(50));

        await this.testAuthentication();
        await this.testDeliverySchedules();
        await this.testDeliveryCapacity();
        await this.testDeliveryAnalytics();
        await this.testLiveTracking();
        await this.testTimeSlotAvailability();

        this.printResults();
    }

    // Print test results
    printResults() {
        console.log('='.repeat(50));
        console.log('📋 نتائج الاختبار:');
        console.log(`✅ نجح: ${this.results.passed}`);
        console.log(`❌ فشل: ${this.results.failed}`);

        if (this.results.errors.length > 0) {
            console.log('\n🐛 الأخطاء:');
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        const total = this.results.passed + this.results.failed;
        const successRate = total > 0 ? (this.results.passed / total * 100).toFixed(1) : 0;

        console.log(`\n📊 معدل النجاح: ${successRate}%`);

        if (this.results.failed === 0) {
            console.log('🎉 جميع الاختبارات نجحت!');
        } else {
            console.log('⚠️ بعض الاختبارات فشلت - يرجى مراجعة الأخطاء أعلاه');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new DeliverySchedulingAPITest();
    tester.runAllTests()
        .then(() => {
            process.exit(tester.results.failed > 0 ? 1 : 0);
        })
        .catch((error) => {
            console.error('❌ خطأ في تشغيل الاختبارات:', error);
            process.exit(1);
        });
}

export default DeliverySchedulingAPITest; 