// Simple test script to check if routes are working
import axios from 'axios';

// Test multiple ports
const PORTS_TO_TEST = [5001, 8080, 3000, 5000];
const testPorts = async () => {
    for (const port of PORTS_TO_TEST) {
        try {
            console.log(`🔍 Testing port ${port}...`);
            const response = await axios.get(`http://127.0.0.1:${port}/api/health`, { timeout: 2000 });
            console.log(`✅ Server found on port ${port}!`);
            return `http://127.0.0.1:${port}/api`;
        } catch (error) {
            console.log(`❌ Port ${port} not available`);
        }
    }
    return null;
};

const BASE_URL = await testPorts() || 'http://127.0.0.1:5001/api';

const testRoutes = async () => {
    console.log('🧪 Testing API routes...\n');

    const tests = [
        { name: 'Health Check', url: `${BASE_URL}/health` },
        { name: 'Distribution Test Connection', url: `${BASE_URL}/distribution/test-connection` },
        { name: 'Distribution Auto Test', url: `${BASE_URL}/distribution/schedules/auto-test` },
        { name: 'Distribution Auto Schedules', url: `${BASE_URL}/distribution/schedules/auto?schedule_date=2025-08-01` },
        { name: 'Distribution Auto Direct', url: `${BASE_URL}/distribution/schedules/auto-direct?schedule_date=2025-08-01` }
    ];

    for (const test of tests) {
        try {
            console.log(`📡 Testing: ${test.name}`);
            console.log(`   URL: ${test.url}`);

            const response = await axios.get(test.url, { timeout: 5000 });
            console.log(`   ✅ SUCCESS: ${response.status} - ${response.statusText}`);

            if (response.data.success !== undefined) {
                console.log(`   📋 Response: ${response.data.success ? 'SUCCESS' : 'FAILED'} - ${response.data.message || 'No message'}`);
            }

        } catch (error) {
            console.log(`   ❌ FAILED: ${error.response?.status || 'Network Error'} - ${error.response?.statusText || error.message}`);

            if (error.response?.data) {
                console.log(`   📋 Error Details: ${JSON.stringify(error.response.data, null, 2)}`);
            }
        }
        console.log('');
    }

    console.log('🏁 Test completed!');
};

// Run the test
testRoutes().catch(console.error);