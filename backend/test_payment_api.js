import { createServer } from 'http';
import app from './app.js';

const server = createServer(app);

// Test the payment API locally
async function testPaymentAPI() {
    try {
        // Start server
        server.listen(3001, () => {
            console.log('Test server running on port 3001');
        });

        // Wait a bit for server to start
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test the store payments endpoint
        const response = await fetch('http://localhost:3001/api/stores/4/payments?limit=5', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

        // Close server
        server.close();

    } catch (error) {
        console.error('Test failed:', error.message);
        server.close();
    }
}

testPaymentAPI(); 