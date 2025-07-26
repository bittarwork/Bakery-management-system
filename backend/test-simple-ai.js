import axios from 'axios';

const RAILWAY_BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

async function testSimpleAI() {
    console.log('🧪 Testing simple AI functionality...');
    
    try {
        // First, get a token
        console.log('1️⃣ Getting authentication token...');
        const loginResponse = await axios.post(`${RAILWAY_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Token obtained');
        
        // Test AI health
        console.log('\n2️⃣ Testing AI health...');
        const healthResponse = await axios.get(`${RAILWAY_BASE_URL}/ai-chat/health`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ AI Health:', healthResponse.data);
        
        // Test AI config
        console.log('\n3️⃣ Testing AI config...');
        const configResponse = await axios.get(`${RAILWAY_BASE_URL}/ai-chat/config`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ AI Config:', configResponse.data);
        
        // Test suggested questions
        console.log('\n4️⃣ Testing suggested questions...');
        const questionsResponse = await axios.get(`${RAILWAY_BASE_URL}/ai-chat/suggested-questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Suggested Questions:', questionsResponse.data);
        
        // Test AI message with detailed error handling
        console.log('\n5️⃣ Testing AI message...');
        try {
            const messageResponse = await axios.post(`${RAILWAY_BASE_URL}/ai-chat/message`, {
                message: 'مرحباً، كيف حالك؟'
            }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            console.log('✅ AI Message Response:', messageResponse.data);
        } catch (error) {
            console.error('❌ AI Message Error Details:');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Response Data:', error.response?.data);
            console.error('Error Message:', error.message);
            
            if (error.response?.data?.details) {
                console.error('Error Details:', error.response.data.details);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testSimpleAI(); 