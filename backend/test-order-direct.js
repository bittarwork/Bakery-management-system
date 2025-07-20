import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testOrderCreation() {
    try {
        console.log('Testing order creation directly...');

        const orderData = {
            store_id: 1,
            items: [
                {
                    product_id: 16,
                    quantity: 2
                }
            ],
            notes: 'Test order from direct script',
            priority: 'normal'
        };

        console.log('Creating order with data:', orderData);

        const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
            headers: {
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