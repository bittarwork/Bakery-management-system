console.log('🧪 Starting Quick API Test...');

const BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

// Test API endpoints
const testEndpoints = async () => {
    console.log('Testing API endpoints...');

    try {
        // Test basic health check
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health check:', data.status);

        // Test status endpoint
        const statusResponse = await fetch(`${BASE_URL}/status`);
        const statusData = await statusResponse.json();
        console.log('✅ System status:', statusData.system);

        // Test main API info
        const apiResponse = await fetch(`${BASE_URL}/`);
        const apiData = await apiResponse.json();
        console.log('✅ API version:', apiData.version);
        console.log('✅ Available endpoints:', Object.keys(apiData.endpoints));

    } catch (error) {
        console.log('❌ API test failed:', error.message);
    }
};

// Run the test
testEndpoints(); 