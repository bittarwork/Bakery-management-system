import axios from 'axios';

const RAILWAY_BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

// Test credentials
const TEST_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

async function getAuthToken() {
    try {
        console.log('🔐 Getting authentication token...');
        const response = await axios.post(`${RAILWAY_BASE_URL}/auth/login`, TEST_CREDENTIALS, {
            timeout: 10000
        });
        
        if (response.data.success && response.data.token) {
            console.log('✅ Authentication successful');
            return response.data.token;
        } else {
            throw new Error('Authentication failed - no token received');
        }
    } catch (error) {
        console.error('❌ Authentication failed:', error.response?.data || error.message);
        return null;
    }
}

async function testAIChatWithAuth(token) {
    console.log('\n🤖 Testing AI Chat with authentication...');
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // Test 1: Health check
        console.log('\n1️⃣ Testing AI Chat health...');
        try {
            const healthResponse = await axios.get(`${RAILWAY_BASE_URL}/ai-chat/health`, {
                headers,
                timeout: 10000
            });
            console.log('✅ AI Chat health response:', healthResponse.data);
        } catch (error) {
            console.error('❌ AI Chat health failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }

        // Test 2: Get suggested questions
        console.log('\n2️⃣ Testing suggested questions...');
        try {
            const questionsResponse = await axios.get(`${RAILWAY_BASE_URL}/ai-chat/suggested-questions`, {
                headers,
                timeout: 10000
            });
            console.log('✅ Suggested questions:', questionsResponse.data);
        } catch (error) {
            console.error('❌ Suggested questions failed:', error.response?.data || error.message);
        }

        // Test 3: Get chat config
        console.log('\n3️⃣ Testing chat config...');
        try {
            const configResponse = await axios.get(`${RAILWAY_BASE_URL}/ai-chat/config`, {
                headers,
                timeout: 10000
            });
            console.log('✅ Chat config:', configResponse.data);
        } catch (error) {
            console.error('❌ Chat config failed:', error.response?.data || error.message);
        }

        // Test 4: Send a test message
        console.log('\n4️⃣ Testing AI message...');
        try {
            const messageResponse = await axios.post(`${RAILWAY_BASE_URL}/ai-chat/message`, {
                message: 'مرحباً، كيف حالك؟'
            }, {
                headers,
                timeout: 30000 // Longer timeout for AI response
            });
            console.log('✅ AI message response:', messageResponse.data);
        } catch (error) {
            console.error('❌ AI message failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

async function runFullTest() {
    console.log('🧪 Running comprehensive AI Chat test...');
    console.log('🌐 Base URL:', RAILWAY_BASE_URL);
    
    const token = await getAuthToken();
    
    if (token) {
        await testAIChatWithAuth(token);
        
        console.log('\n📋 النتائج:');
        console.log('✅ إذا نجح health: المتغيرات البيئية تعمل');
        console.log('✅ إذا نجح suggested questions: النظام جاهز');
        console.log('✅ إذا نجح AI message: Gemini AI يعمل بشكل طبيعي');
        console.log('❌ إذا فشل أي اختبار: تحقق من Railway logs');
    } else {
        console.log('❌ Cannot proceed without authentication token');
    }
}

runFullTest(); 