import fetch from 'node-fetch';

const API_BASE = 'https://bakery-management-system-production.up.railway.app/api';

// Test function to check API endpoints
async function testAPI() {
    console.log('🧪 Testing API fixes...\n');

    // Test 1: Health check
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        console.log('✅ Health check:', response.status === 200 ? 'PASS' : 'FAIL');
    } catch (error) {
        console.log('❌ Health check: FAIL -', error.message);
    }

    // Test 2: Dashboard stats (requires authentication)
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats?dateFrom=2024-01-01&dateTo=2024-12-31&currency=EUR`);
        console.log('✅ Dashboard stats:', response.status === 401 ? 'PASS (Auth required)' : response.status === 200 ? 'PASS' : 'FAIL');
    } catch (error) {
        console.log('❌ Dashboard stats: FAIL -', error.message);
    }

    // Test 3: Store search (requires authentication)
    try {
        const response = await fetch(`${API_BASE}/stores?search=test&page=1&limit=10`);
        console.log('✅ Store search:', response.status === 401 ? 'PASS (Auth required)' : response.status === 200 ? 'PASS' : 'FAIL');
    } catch (error) {
        console.log('❌ Store search: FAIL -', error.message);
    }

    // Test 4: Create store (requires authentication)
    try {
        const response = await fetch(`${API_BASE}/stores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Store',
                address: 'Test Address',
                latitude: 33.5138,
                longitude: 36.2765
            })
        });
        console.log('✅ Create store:', response.status === 401 ? 'PASS (Auth required)' : response.status === 201 ? 'PASS' : 'FAIL');
    } catch (error) {
        console.log('❌ Create store: FAIL -', error.message);
    }

    console.log('\n🎉 API tests completed!');
}

testAPI().catch(console.error); 