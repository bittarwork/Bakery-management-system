const axios = require('axios');

const BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBiYWtlcnkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM4MTMzMzUyLCJleHAiOjE3MzgyMTk3NTJ9.iyLTnRBEI1mwR8dRJiVsVeSDFEFCc32-oFgS0DM3Zcs';

async function testDistributionAPI() {
    console.log('🔍 Testing Distribution API Endpoints...\n');

    try {
        console.log('1. Testing distribution health endpoint...');
        const response = await axios.get(`${BASE_URL}/distribution/health`);
        console.log('   Status:', response.status);
        console.log('   ✅ Distribution health endpoint works');
        console.log('   Available routes:', response.data.availableRoutes);
    } catch (error) {
        console.log('   ❌ Distribution health failed:', error.response?.status || error.message);
    }

    try {
        console.log('\n2. Testing auto-test endpoint...');
        const response = await axios.get(`${BASE_URL}/distribution/schedules/auto-test`);
        console.log('   Status:', response.status);
        console.log('   ✅ Auto-test endpoint works');
        console.log('   Response:', response.data);
    } catch (error) {
        console.log('   ❌ Auto-test failed:', error.response?.status || error.message);
        if (error.response?.data) {
            console.log('   Error details:', error.response.data);
        }
    }

    try {
        console.log('\n3. Testing auto schedules endpoint (with auth)...');
        const response = await axios.get(`${BASE_URL}/distribution/schedules/auto?schedule_date=2025-07-29`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
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
            console.log('   🚨 This is the exact error the frontend is experiencing!');
        }
    }

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

    console.log('\n🏁 Test completed!');
}

testDistributionAPI().catch(console.error);