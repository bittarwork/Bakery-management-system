import fetch from 'node-fetch';

const BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBiYWtlcnkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM4MTMzMzUyLCJleHAiOjE3MzgyMTk3NTJ9.iyLTnRBEI1mwR8dRJiVsVeSDFEFCc32-oFgS0DM3Zcs';

async function testAPI() {
    console.log('🔍 Testing Distribution API Endpoints...\n');

    // Test 1: Health check
    try {
        console.log('1. Testing API health...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        console.log(`   Status: ${healthResponse.status}`);
        if (healthResponse.ok) {
            const data = await healthResponse.json();
            console.log('   ✅ API is healthy:', data.status);
        } else {
            console.log('   ❌ API health check failed');
        }
    } catch (error) {
        console.log('   ❌ Health check error:', error.message);
    }

    // Test 2: Distribution health
    try {
        console.log('\n2. Testing distribution system health...');
        const distHealthResponse = await fetch(`${BASE_URL}/distribution/health`);
        console.log(`   Status: ${distHealthResponse.status}`);
        if (distHealthResponse.ok) {
            const data = await distHealthResponse.json();
            console.log('   ✅ Distribution system is operational');
            console.log('   Available routes:', data.availableRoutes);
        } else {
            console.log('   ❌ Distribution health check failed');
        }
    } catch (error) {
        console.log('   ❌ Distribution health error:', error.message);
    }

    // Test 3: Auto test endpoint
    try {
        console.log('\n3. Testing auto-test endpoint...');
        const autoTestResponse = await fetch(`${BASE_URL}/distribution/schedules/auto-test`);
        console.log(`   Status: ${autoTestResponse.status}`);
        if (autoTestResponse.ok) {
            const data = await autoTestResponse.json();
            console.log('   ✅ Auto-test endpoint works');
            console.log('   Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('   ❌ Auto-test endpoint failed');
            const text = await autoTestResponse.text();
            console.log('   Response:', text);
        }
    } catch (error) {
        console.log('   ❌ Auto-test error:', error.message);
    }

    // Test 4: Auto schedules with auth
    try {
        console.log('\n4. Testing auto schedules endpoint with auth...');
        const autoResponse = await fetch(`${BASE_URL}/distribution/schedules/auto?schedule_date=2025-07-29`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`   Status: ${autoResponse.status}`);
        if (autoResponse.ok) {
            const data = await autoResponse.json();
            console.log('   ✅ Auto schedules endpoint works');
            console.log('   Distributors found:', data.data?.distributors_schedules?.length || 0);
        } else {
            console.log('   ❌ Auto schedules endpoint failed');
            const text = await autoResponse.text();
            console.log('   Response:', text.substring(0, 500));
        }
    } catch (error) {
        console.log('   ❌ Auto schedules error:', error.message);
    }

    // Test 5: Routes listing
    try {
        console.log('\n5. Testing routes status...');
        const statusResponse = await fetch(`${BASE_URL}/status`);
        console.log(`   Status: ${statusResponse.status}`);
        if (statusResponse.ok) {
            const data = await statusResponse.json();
            console.log('   ✅ System status retrieved');
            console.log('   Distribution route status:', data.routes?.mounted_routes?.find(r => r.path === '/distribution')?.status || 'not found');
        } else {
            console.log('   ❌ Status endpoint failed');
        }
    } catch (error) {
        console.log('   ❌ Status check error:', error.message);
    }

    console.log('\n🏁 Test completed!');
}

testAPI().catch(console.error);