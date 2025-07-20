import axios from 'axios';

const PRODUCTION_API = 'https://bakery-management-system-production.up.railway.app/api';

async function testProductionServer() {
    try {
        console.log('Testing production server...');

        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${PRODUCTION_API}/health`);
        console.log('✅ Health check successful:', healthResponse.data);

        // Test authentication
        console.log('2. Testing authentication...');
        const loginResponse = await axios.post(`${PRODUCTION_API}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Authentication successful');

        // Test order creation
        console.log('3. Testing order creation...');
        const orderData = {
            store_id: 1,
            items: [
                {
                    product_id: 16,
                    quantity: 2
                }
            ],
            notes: 'Test order from production server',
            priority: 'normal'
        };

        const orderResponse = await axios.post(`${PRODUCTION_API}/orders`, orderData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Order created successfully!');
        console.log('Order response:', orderResponse.data);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Response data:', error.response.data);
        }
    }
}

testProductionServer(); 