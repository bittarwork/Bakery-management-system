const axios = require('axios');

const BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBiYWtlcnkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM4MTMzMzUyLCJleHAiOjE3MzgyMTk3NTJ9.iyLTnRBEI1mwR8dRJiVsVeSDFEFCc32-oFgS0DM3Zcs';

async function testDistributionAPI() {
    console.log('🔍 Testing Distribution API Endpoints...\n');

    // Test 1: Distribution health
    try {
        console.log('1. Testing distribution health endpoint...');
        const response = await axios.get(`${BASE_URL}/distribution/health`);
        console.log('   Status:', response.status);
        console.log('   ✅ Distribution health endpoint works');
        console.log('   Available routes:', response.data.availableRoutes);
    } catch (error) {
        console.log('   ❌ Distribution health failed:', error.response?.status || error.message);
        if (error.response?.data) {
            console.log('   Error details:', error.response.data);
        }
    }

    // Test 2: Auto-test endpoint  
    try {
        console.log('\n2. Testing auto-test endpoint...');
        const response = await axios.get(`${BASE_URL}/distribution/schedules/auto-test`);
        console.log('   Status:', response.status);
        console.log('   ✅ Auto-test endpoint works');
        console.log('   Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('   ❌ Auto-test failed:', error.response?.status || error.message);
        if (error.response?.data) {
            console.log('   Error details:', error.response.data);
        }
    }

    // Test 3: Auto schedules endpoint (the problematic one)
    try {
        console.log('\n3. Testing auto schedules endpoint (the problematic one)...');
        const response = await axios.get(`${BASE_URL}/distribution/schedules/auto?schedule_date=2025-07-29`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        console.log('   Status:', response.status);
        console.log('   ✅ Auto schedules endpoint works');
        console.log('   Distributors found:', response.data.data?.distributors_schedules?.length || 0);
        console.log('   Schedule date:', response.data.data?.schedule_date);
    } catch (error) {
        console.log('   ❌ Auto schedules failed:', error.response?.status || error.message);
        if (error.response?.data) {
            console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.response?.status === 404) {
            console.log('   🚨 This is the exact 404 error the frontend is experiencing!');
            console.log('   🔍 The route seems to not be found on the server');
        }
        if (error.response?.status === 401) {
            console.log('   🚨 Authentication failed - token might be expired');
        }
    }

    // Test 4: Basic schedules endpoint
    try {
        console.log('\n4. Testing basic schedules endpoint...');
        const response = await axios.get(`${BASE_URL}/distribution/schedules`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('   Status:', response.status);
        console.log('   ✅ Basic schedules endpoint works');
        console.log('   Schedules found:', response.data.data?.schedules?.length || 0);
    } catch (error) {
        console.log('   ❌ Basic schedules failed:', error.response?.status || error.message);
    }

    // Test 5: Check all available routes
    try {
        console.log('\n5. Checking system status and routes...');
        const response = await axios.get(`${BASE_URL}/status`);
        console.log('   Status:', response.status);
        console.log('   ✅ System status retrieved');
        const distributionRoute = response.data.routes?.mounted_routes?.find(r => r.path === '/distribution');
        console.log('   Distribution route status:', distributionRoute?.status || 'NOT FOUND');
        
        if (response.data.routes?.mounted_routes) {
            console.log('   All mounted routes:', response.data.routes.mounted_routes.map(r => r.path));
        }
    } catch (error) {
        console.log('   ❌ Status check failed:', error.response?.status || error.message);
    }

    console.log('\n🏁 Distribution API test completed!');
}

testDistributionAPI().catch(console.error);