import axios from 'axios';

const API_BASE = 'https://bakery-management-system-production.up.railway.app/api';

// Test data
const testData = {
    credentials: {
        email: 'admin@bakery.com',
        password: 'admin123'
    }
};

let authToken = null;

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
            data
        };

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status
        };
    }
};

// Test functions
const testAuth = async () => {
    console.log('\n🔐 Testing Authentication...');

    const result = await makeRequest('POST', '/auth/login', testData.credentials);

    if (result.success && result.data.token) {
        authToken = result.data.token;
        console.log('✅ Authentication successful');
        return true;
    } else {
        console.log('❌ Authentication failed:', result.error);
        return false;
    }
};

const testDashboardStats = async () => {
    console.log('\n📊 Testing Dashboard Stats...');

    const result = await makeRequest('GET', '/dashboard/stats?dateFrom=2025-01-01&dateTo=2025-01-15&currency=EUR');

    if (result.success) {
        console.log('✅ Dashboard stats loaded successfully');
        console.log('   - Period:', result.data.data?.period);
        console.log('   - Currency:', result.data.data?.currency);
        return true;
    } else {
        console.log('❌ Dashboard stats failed:', result.error, `(${result.status})`);
        return false;
    }
};

const testStoreOrders = async () => {
    console.log('\n🛍️ Testing Store Orders...');

    const result = await makeRequest('GET', '/stores/1/orders?limit=5');

    if (result.success) {
        console.log('✅ Store orders loaded successfully');
        console.log('   - Orders count:', result.data.data?.orders?.length || 0);
        return true;
    } else {
        console.log('❌ Store orders failed:', result.error, `(${result.status})`);
        return false;
    }
};

const testStorePayments = async () => {
    console.log('\n💳 Testing Store Payments...');

    const result = await makeRequest('GET', '/stores/1/payments?limit=5');

    if (result.success) {
        console.log('✅ Store payments loaded successfully');
        console.log('   - Payments count:', result.data.data?.payments?.length || 0);
        return true;
    } else {
        console.log('❌ Store payments failed:', result.error, `(${result.status})`);
        return false;
    }
};

const testStoreSearch = async () => {
    console.log('\n🔍 Testing Store Search...');

    // Test Arabic search
    const result = await makeRequest('GET', '/stores?search=س&page=1&limit=10');

    if (result.success) {
        console.log('✅ Store search loaded successfully');
        console.log('   - Stores found:', result.data.data?.stores?.length || 0);
        return true;
    } else {
        console.log('❌ Store search failed:', result.error, `(${result.status})`);
        return false;
    }
};

const testAllStores = async () => {
    console.log('\n🏪 Testing All Stores...');

    const result = await makeRequest('GET', '/stores?page=1&limit=10');

    if (result.success) {
        console.log('✅ All stores loaded successfully');
        console.log('   - Total stores:', result.data.data?.stores?.length || 0);
        return true;
    } else {
        console.log('❌ All stores failed:', result.error, `(${result.status})`);
        return false;
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('🧪 Starting comprehensive API tests...');
    console.log('='.repeat(50));

    const results = {
        auth: false,
        dashboardStats: false,
        storeOrders: false,
        storePayments: false,
        storeSearch: false,
        allStores: false
    };

    // Test authentication first
    results.auth = await testAuth();

    if (!results.auth) {
        console.log('\n❌ Cannot proceed without authentication');
        return;
    }

    // Run all other tests
    results.dashboardStats = await testDashboardStats();
    results.storeOrders = await testStoreOrders();
    results.storePayments = await testStorePayments();
    results.storeSearch = await testStoreSearch();
    results.allStores = await testAllStores();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 Test Summary:');
    console.log('='.repeat(50));

    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;

    Object.entries(results).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
    });

    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('🎉 All tests passed! System is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the issues above.');
    }
};

// Run tests
runAllTests().catch(console.error); 