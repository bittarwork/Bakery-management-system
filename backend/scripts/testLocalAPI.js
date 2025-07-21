import http from 'http';
import https from 'https';

const LOCAL_API_BASE = 'http://localhost:5001';

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;

        const req = protocol.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        data: jsonData,
                        text: data
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        text: data,
                        data: null
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function testLocalAPI() {
    console.log('🧪 Testing Local API endpoints...\n');

    try {
        // Test 1: Health endpoint
        console.log('1. Testing health endpoint...');
        try {
            const healthResponse = await makeRequest(`${LOCAL_API_BASE}/api/health`);
            if (healthResponse.ok) {
                console.log('✅ Health:', healthResponse.data?.status || 'OK');
            } else {
                console.log('❌ Health failed:', healthResponse.status);
            }
        } catch (error) {
            console.log('❌ Health error:', error.message);
        }

        // Test 2: Root endpoint
        console.log('\n2. Testing root API endpoint...');
        try {
            const rootResponse = await makeRequest(`${LOCAL_API_BASE}/api`);
            console.log('📊 Root status:', rootResponse.status);

            if (rootResponse.ok) {
                console.log('✅ Root API response received');
                console.log('📋 Message:', rootResponse.data?.message || 'Success');
            } else {
                console.log('❌ Root failed with status:', rootResponse.status);
            }
        } catch (error) {
            console.log('❌ Root error:', error.message);
        }

        // Test 3: Distributors endpoint  
        console.log('\n3. Testing distributors endpoint...');
        try {
            const distributorsResponse = await makeRequest(`${LOCAL_API_BASE}/api/distributors`);
            console.log('👥 Distributors status:', distributorsResponse.status);

            if (distributorsResponse.ok) {
                console.log('✅ Distributors response received');
                if (distributorsResponse.data) {
                    console.log('📋 Response keys:', Object.keys(distributorsResponse.data));
                }
            } else {
                console.log('❌ Distributors failed with status:', distributorsResponse.status);
                console.log('Error details:', distributorsResponse.text?.substring(0, 200) + '...');
            }
        } catch (error) {
            console.log('❌ Distributors error:', error.message);
        }

        // Test 4: Delivery scheduling endpoint
        console.log('\n4. Testing delivery scheduling endpoint...');
        try {
            const deliveryResponse = await makeRequest(`${LOCAL_API_BASE}/api/delivery/schedules`);
            console.log('📅 Delivery status:', deliveryResponse.status);

            if (deliveryResponse.ok) {
                console.log('✅ Delivery response received');
                if (deliveryResponse.data) {
                    console.log('📋 Response keys:', Object.keys(deliveryResponse.data));
                }
            } else {
                console.log('❌ Delivery failed with status:', deliveryResponse.status);
                console.log('Error details:', deliveryResponse.text?.substring(0, 200) + '...');
            }
        } catch (error) {
            console.log('❌ Delivery error:', error.message);
        }

        // Test 5: Database status
        console.log('\n5. Testing database status...');
        try {
            const statusResponse = await makeRequest(`${LOCAL_API_BASE}/api/status`);
            if (statusResponse.ok) {
                console.log('✅ Database:', statusResponse.data?.database || 'Unknown');
                console.log('✅ System:', statusResponse.data?.system || 'Unknown');
            } else {
                console.log('❌ Status failed:', statusResponse.status);
            }
        } catch (error) {
            console.log('❌ Status error:', error.message);
        }

        console.log('\n🎉 Local API testing completed!');
        console.log('\n💡 If all tests pass, the issue is with Railway deployment.');
        console.log('💡 If tests fail, there are local issues to fix first.');

    } catch (error) {
        console.error('❌ Overall test failed:', error.message);
    }
}

// Wait a bit for server to start, then run tests
setTimeout(() => {
    testLocalAPI();
}, 3000); 