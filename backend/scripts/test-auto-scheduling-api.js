import fetch from 'node-fetch';

const BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';

async function testAutoSchedulingAPI() {
    console.log('🧪 Testing Auto-Scheduling API...');
    console.log('📅 Date:', new Date().toISOString());
    console.log('🔗 Base URL:', BASE_URL);
    console.log('─'.repeat(60));

    try {
        // Test 1: Get pending reviews
        console.log('\n1️⃣ Testing GET /auto-scheduling/pending-reviews');

        const response1 = await fetch(`${BASE_URL}/auto-scheduling/pending-reviews?page=1&limit=5`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log(`   Status: ${response1.status} ${response1.statusText}`);

        if (response1.ok) {
            const data1 = await response1.json();
            console.log('   ✅ Response received successfully');
            console.log(`   📊 Data: ${JSON.stringify(data1, null, 2)}`);
        } else {
            const error1 = await response1.text();
            console.log('   ❌ Error response:');
            console.log(`   ${error1}`);
        }

        // Test 2: Get statistics
        console.log('\n2️⃣ Testing GET /auto-scheduling/statistics');

        const response2 = await fetch(`${BASE_URL}/auto-scheduling/statistics?period=month`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log(`   Status: ${response2.status} ${response2.statusText}`);

        if (response2.ok) {
            const data2 = await response2.json();
            console.log('   ✅ Statistics received successfully');
            console.log(`   📈 Stats: ${JSON.stringify(data2, null, 2)}`);
        } else {
            const error2 = await response2.text();
            console.log('   ❌ Error response:');
            console.log(`   ${error2}`);
        }

        console.log('\n🎉 API testing completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('   💡 Suggestion: Make sure the backend server is running');
        }
        if (error.code === 'ENOTFOUND') {
            console.error('   💡 Suggestion: Check your internet connection and API URL');
        }

        process.exit(1);
    }
}

// Add node-fetch if not available
try {
    await import('node-fetch');
} catch (importError) {
    console.error('❌ node-fetch is required but not installed');
    console.log('💡 Install it with: npm install node-fetch');
    process.exit(1);
}

// Run the test
testAutoSchedulingAPI(); 