// Test script to verify frontend order creation works with updated backend
import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

// Create a test token for admin user (ID: 1)
const createTestToken = () => {
    const payload = {
        userId: 1,
        username: 'admin',
        role: 'admin'
    };

    return jwt.sign(payload, 'bakery_belgium_super_secret_jwt_key_2024_distribution_system', {
        expiresIn: '1h'
    });
};

// Test order data that matches frontend format
const testOrderData = {
    store_id: 6,
    currency: "EUR",
    delivery_date: "2025-07-29",
    notes: "test order from frontend test script",
    items: [
        {
            product_id: 3,
            quantity: 10,
            notes: "test item from frontend"
        }
    ]
};

async function testFrontendOrderCreation() {
    try {
        console.log('🧪 Testing frontend order creation format...');

        // Create test token
        const token = createTestToken();
        console.log('🔑 Test token created');

        console.log('📦 Order data (frontend format):', JSON.stringify(testOrderData, null, 2));

        const response = await axios.post(`${API_BASE_URL}/orders`, testOrderData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Order created successfully!');
        console.log('📄 Response:', JSON.stringify(response.data, null, 2));

        // Verify the response structure matches what frontend expects
        if (response.data.success && response.data.data) {
            console.log('✅ Response structure is correct for frontend');
            console.log('📊 Order ID:', response.data.data.id);
            console.log('📊 Order Number:', response.data.data.order_number);
            console.log('📊 Items Count:', response.data.data.items_count);
            console.log('📊 Total Amount:', response.data.data.final_amount_eur);
        } else {
            console.log('⚠️ Response structure may not match frontend expectations');
        }

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

testFrontendOrderCreation();