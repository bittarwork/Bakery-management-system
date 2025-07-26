import axios from 'axios';

const RAILWAY_BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

async function testLoginDirect() {
    console.log('🔐 Testing direct login...');
    
    const testCases = [
        {
            username: 'admin',
            password: 'admin123',
            description: 'Admin with username'
        },
        {
            email: 'admin@bakery.com',
            password: 'admin123',
            description: 'Admin with email'
        },
        {
            username: 'admin@bakery.com',
            password: 'admin123',
            description: 'Admin with email as username'
        }
    ];

    for (const testCase of testCases) {
        try {
            console.log(`\n🧪 Testing: ${testCase.description}`);
            console.log(`   Data:`, testCase);
            
            const response = await axios.post(`${RAILWAY_BASE_URL}/auth/login`, testCase, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   ✅ Success! Status: ${response.status}`);
            console.log(`   Response:`, response.data);
            
            if (response.data.success && response.data.data?.token) {
                console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
                return response.data.data.token;
            }
            
        } catch (error) {
            console.log(`   ❌ Failed: ${error.response?.status} ${error.response?.statusText}`);
            console.log(`   Error:`, error.response?.data || error.message);
        }
    }
    
    return null;
}

async function testAIChatWithToken(token) {
    if (!token) {
        console.log('❌ No token available for AI Chat test');
        return;
    }
    
    console.log('\n🤖 Testing AI Chat with token...');
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // Test AI Chat health
        console.log('\n1️⃣ Testing AI Chat health...');
        const healthResponse = await axios.get(`${RAILWAY_BASE_URL}/ai-chat/health`, {
            headers,
            timeout: 10000
        });
        console.log('✅ AI Chat health:', healthResponse.data);
        
        // Test AI message
        console.log('\n2️⃣ Testing AI message...');
        const messageResponse = await axios.post(`${RAILWAY_BASE_URL}/ai-chat/message`, {
            message: 'مرحباً، كيف حالك؟'
        }, {
            headers,
            timeout: 30000
        });
        console.log('✅ AI message response:', messageResponse.data);
        
    } catch (error) {
        console.error('❌ AI Chat test failed:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
    }
}

async function runTest() {
    console.log('🧪 Running comprehensive login and AI Chat test...');
    
    const token = await testLoginDirect();
    if (token) {
        await testAIChatWithToken(token);
    }
}

runTest(); 