import axios from 'axios';

const API_URL = 'https://bakery-management-system-production.up.railway.app/api';

async function testLogin() {
    console.log('🧪 Testing login functionality...\n');

    const testCases = [
        {
            username: 'admin',
            email: 'admin@bakery.com',
            password: 'admin123',
            description: 'Admin user with username'
        },
        {
            username: 'admin@bakery.com',
            email: 'admin@bakery.com',
            password: 'admin123',
            description: 'Admin user with email'
        },
        {
            username: 'distributor1',
            email: 'distributor1@bakery.com',
            password: 'distributor123',
            description: 'Distributor user with username'
        },
        {
            username: 'distributor1@bakery.com',
            email: 'distributor1@bakery.com',
            password: 'distributor123',
            description: 'Distributor user with email'
        }
    ];

    for (const testCase of testCases) {
        try {
            console.log(`🔍 Testing: ${testCase.description}`);
            console.log(`   Username: ${testCase.username}`);
            console.log(`   Email: ${testCase.email}`);
            console.log(`   Password: ${testCase.password}`);

            const response = await axios.post(`${API_URL}/auth/login`, {
                username: testCase.username,
                email: testCase.email,
                password: testCase.password
            });

            console.log(`   ✅ Success! User: ${response.data.data.user.username} (${response.data.data.user.email})`);
            console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
            console.log('---');

        } catch (error) {
            console.log(`   ❌ Failed: ${error.response?.data?.message || error.message}`);
            console.log('---');
        }
    }

    console.log('🎉 Login testing completed!');
}

// Run the test
testLogin().catch(console.error); 