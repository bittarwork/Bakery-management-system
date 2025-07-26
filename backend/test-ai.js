const axios = require('axios');

async function testAIEndpoint() {
    try {
        console.log('🧪 Testing AI Chat endpoint...');

        // First, test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:5001/api/ai-chat/health', {
            headers: {
                'Authorization': 'Bearer your_test_token_here',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Health endpoint response:', healthResponse.data);

        // Test message endpoint
        console.log('2. Testing message endpoint...');
        const messageResponse = await axios.post('http://localhost:5001/api/ai-chat/message', {
            message: 'مرحبا',
            context: {}
        }, {
            headers: {
                'Authorization': 'Bearer your_test_token_here',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Message endpoint response:', messageResponse.data);

    } catch (error) {
        console.error('❌ Test failed:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
    }
}

testAIEndpoint(); 