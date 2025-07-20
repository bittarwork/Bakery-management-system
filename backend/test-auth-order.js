import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testOrderCreation() {
    try {
        console.log('Testing order creation with authentication...');

        // Step 1: Login to get token
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Authentication successful');

        // Step 2: Test order creation
        const orderData = {
            store_id: 1,
            items: [
                {
                    product_id: 16,
                    quantity: 2
                }
            ],
            notes: 'Test order from script',
            priority: 'normal'
        };

        console.log('Creating order with data:', orderData);

        const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
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
        }
    }
}

testOrderCreation(); 