console.log('🧪 Testing Local Server...');

const BASE_URL = 'http://localhost:5000/api';

// Test local server endpoints
const testLocalEndpoints = async () => {
    console.log('Testing local server endpoints...');

    try {
        // Test basic health check
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health check:', data.status);

        // Test main API info
        const apiResponse = await fetch(`${BASE_URL}/`);
        const apiData = await apiResponse.json();
        console.log('✅ API version:', apiData.version);
        console.log('✅ Available endpoints:', Object.keys(apiData.endpoints));

        // Test new endpoints
        console.log('\n🔍 Testing new endpoints...');

        // Check if tax endpoint is available
        if (apiData.endpoints.tax) {
            console.log('✅ Tax endpoint available:', apiData.endpoints.tax);
        } else {
            console.log('❌ Tax endpoint not found');
        }

        // Check if price-history endpoint is available
        if (apiData.endpoints.priceHistory) {
            console.log('✅ Price History endpoint available:', apiData.endpoints.priceHistory);
        } else {
            console.log('❌ Price History endpoint not found');
        }

        // Check if refunds endpoint is available
        if (apiData.endpoints.refunds) {
            console.log('✅ Refunds endpoint available:', apiData.endpoints.refunds);
        } else {
            console.log('❌ Refunds endpoint not found');
        }

    } catch (error) {
        console.log('❌ Local server test failed:', error.message);
    }
};

// Wait a bit and then run the test
setTimeout(() => {
    testLocalEndpoints();
}, 2000); 