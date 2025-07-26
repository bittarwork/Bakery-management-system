import axios from 'axios';

const RAILWAY_BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

async function testRailwayDeployment() {
    console.log('🧪 Testing Railway AI Chat deployment...');
    console.log('🌐 Base URL:', RAILWAY_BASE_URL);
    
    try {
        // Test 1: Health check
        console.log('\n1️⃣ Testing health endpoint...');
        try {
            const healthResponse = await axios.get(`${RAILWAY_BASE_URL}/ai-chat/health`, {
                timeout: 10000
            });
            console.log('✅ Health endpoint response:', healthResponse.data);
        } catch (error) {
            console.error('❌ Health endpoint failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }

        // Test 2: General API health
        console.log('\n2️⃣ Testing general API health...');
        try {
            const generalHealthResponse = await axios.get(`${RAILWAY_BASE_URL}/health`, {
                timeout: 10000
            });
            console.log('✅ General API health:', generalHealthResponse.data);
        } catch (error) {
            console.error('❌ General API health failed:', error.message);
        }

        // Test 3: Root API info
        console.log('\n3️⃣ Testing API info...');
        try {
            const apiInfoResponse = await axios.get(`${RAILWAY_BASE_URL}/`, {
                timeout: 10000
            });
            console.log('✅ API info:', apiInfoResponse.data);
        } catch (error) {
            console.error('❌ API info failed:', error.message);
        }

        console.log('\n📋 التشخيص:');
        console.log('- إذا فشل health endpoint: المتغيرات البيئية مفقودة');
        console.log('- إذا نجح general health: الباك إند يعمل');
        console.log('- تحقق من Railway Variables وأعد النشر');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRailwayDeployment(); 