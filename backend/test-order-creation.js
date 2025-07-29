import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Test order data
const testOrderData = {
    store_id: 6,
    currency: "EUR",
    delivery_date: "2025-07-29",
    notes: "test order",
    items: [
        {
            product_id: 3,
            quantity: 25,
            notes: "test item"
        }
    ]
};

async function testOrderCreation() {
    try {
        console.log('🧪 Testing order creation...');
        console.log('📦 Order data:', JSON.stringify(testOrderData, null, 2));

        const response = await axios.post(`${API_BASE_URL}/orders`, testOrderData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token' // You'll need to replace this with a real token
            }
        });

        console.log('✅ Order created successfully!');
        console.log('📄 Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Error creating order:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message);
        console.error('Error:', error.response?.data?.error);
        console.error('Full error:', error.message);
    }
}

testOrderCreation();