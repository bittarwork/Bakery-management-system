// Simple API testing script
const API_BASE = 'https://bakery-management-system-production.up.railway.app/api';

async function testAPI() {
    console.log('🧪 Testing API endpoints...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health:', healthData.status);

        // Test auth/me endpoint
        console.log('\n2. Testing auth endpoint...');
        const authResponse = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': 'Bearer test-token'
            }
        });
        console.log('📊 Auth status:', authResponse.status);

        // Test distributors endpoint
        console.log('\n3. Testing distributors endpoint...');
        const distributorsResponse = await fetch(`${API_BASE}/distributors`);
        console.log('👥 Distributors status:', distributorsResponse.status);
        console.log('📄 Response headers:', Object.fromEntries(distributorsResponse.headers));

        // Test delivery scheduling endpoint
        console.log('\n4. Testing delivery scheduling endpoint...');
        const deliveryResponse = await fetch(`${API_BASE}/delivery/schedules`);
        console.log('📅 Delivery status:', deliveryResponse.status);

        console.log('\n🎉 API testing completed!');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run in browser console
if (typeof window !== 'undefined') {
    window.testAPI = testAPI;
    console.log('Run testAPI() in console to test endpoints');
}

// Run in Node.js
if (typeof module !== 'undefined') {
    testAPI();
} 