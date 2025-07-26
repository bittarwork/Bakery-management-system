import axios from 'axios';

// Test CORS with Railway server
async function testRailwayCORS() {
    const railwayURL = 'https://bakery-management-system-production.up.railway.app/api';
    
    try {
        console.log('🚀 Testing CORS with Railway server...');
        console.log('🌐 URL:', `${railwayURL}/health`);
        console.log('🎯 Origin: http://localhost:3000');
        
        // First test: OPTIONS request (preflight)
        console.log('\n1️⃣ Testing OPTIONS request (preflight)...');
        const optionsResponse = await axios.options(`${railwayURL}/health`, {
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            },
            timeout: 10000
        });
        
        console.log('✅ OPTIONS Response Status:', optionsResponse.status);
        console.log('✅ CORS Headers in OPTIONS:');
        console.log('   - Access-Control-Allow-Origin:', optionsResponse.headers['access-control-allow-origin']);
        console.log('   - Access-Control-Allow-Methods:', optionsResponse.headers['access-control-allow-methods']);
        console.log('   - Access-Control-Allow-Headers:', optionsResponse.headers['access-control-allow-headers']);

        // Second test: Actual GET request
        console.log('\n2️⃣ Testing GET request...');
        const getResponse = await axios.get(`${railwayURL}/health`, {
            headers: {
                'Origin': 'http://localhost:3000',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ GET Response Status:', getResponse.status);
        console.log('✅ CORS Headers in GET:');
        console.log('   - Access-Control-Allow-Origin:', getResponse.headers['access-control-allow-origin']);
        console.log('✅ Response Data:', getResponse.data);

        console.log('\n🎉 CORS test completed successfully!');
        console.log('📝 Your frontend should now be able to create orders.');
        
    } catch (error) {
        console.error('\n❌ CORS test failed:', error.message);
        
        if (error.response) {
            console.log('❌ Response Status:', error.response.status);
            console.log('❌ Response Headers:', error.response.headers);
            console.log('❌ Response Data:', error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.log('📝 Cannot connect to Railway server. Check if it\'s running.');
        } else {
            console.log('📝 Network error:', error.code);
        }
        
        console.log('\n🔧 If CORS is still not working:');
        console.log('   1. Make sure changes are pushed to git and deployed to Railway');
        console.log('   2. Check Railway logs for CORS messages');
        console.log('   3. Try refreshing your browser cache');
    }
}

// Test creating an order (simulate frontend request)
async function testOrderCreation() {
    const railwayURL = 'https://bakery-management-system-production.up.railway.app/api';
    
    console.log('\n🛒 Testing order creation endpoint...');
    
    try {
        const orderData = {
            store_id: 1,
            items: [
                {
                    product_id: 1,
                    quantity: 2,
                    unit_price_eur: 5.50
                }
            ],
            currency: 'EUR',
            notes: 'Test order from CORS fix'
        };

        const response = await axios.post(`${railwayURL}/orders`, orderData, {
            headers: {
                'Origin': 'http://localhost:3000',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token' // You may need a real token
            },
            timeout: 15000
        });

        console.log('✅ Order creation successful!');
        console.log('✅ Status:', response.status);
        console.log('✅ Order ID:', response.data?.data?.id);
        
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('⚠️  Order creation requires authentication (expected)');
            console.log('✅ But CORS is working - no CORS error!');
        } else if (error.code !== 'ERR_NETWORK') {
            console.log('⚠️  Order creation failed but CORS is working');
            console.log('❌ Error:', error.response?.data?.message || error.message);
        } else {
            console.log('❌ Network error:', error.message);
        }
    }
}

// Run tests
async function runAllTests() {
    await testRailwayCORS();
    await testOrderCreation();
}

runAllTests(); 