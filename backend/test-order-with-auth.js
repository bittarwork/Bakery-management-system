import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

// Create a test token for admin user (ID: 1)
const createTestToken = () => {
    const payload = {
        userId: 1,
        username: 'admin', // Changed from admin@bakery.com to admin
        role: 'admin'
    };

    return jwt.sign(payload, 'bakery_belgium_super_secret_jwt_key_2024_distribution_system', {
        expiresIn: '1h'
    });
};

// Test order data
const testOrderData = {
    store_id: 6,
    currency: "EUR",
    delivery_date: "2025-07-29",
    notes: "test order from script",
    items: [
        {
            product_id: 3,
            quantity: 25,
            notes: "test item from script"
        }
    ]
};

async function testOrderCreation() {
    try {
        console.log('🧪 Testing order creation with authentication...');

        // Create test token
        const token = createTestToken();
        console.log('🔑 Test token created');

        console.log('📦 Order data:', JSON.stringify(testOrderData, null, 2));

        const response = await axios.post(`${API_BASE_URL}/orders`, testOrderData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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

        if (error.response?.data) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testOrderCreation();