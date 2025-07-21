// Test Railway API directly
const RAILWAY_API = 'https://bakery-management-system-production.up.railway.app/api';

async function testRailwayAPI() {
    console.log('🧪 Testing Railway API endpoints...\n');

    try {
        // Test 1: Root API endpoint
        console.log('1. Testing root API endpoint...');
        try {
            const rootResponse = await fetch(`${RAILWAY_API}/`);
            console.log('📊 Root status:', rootResponse.status);

            if (rootResponse.ok) {
                const rootData = await rootResponse.json();
                console.log('✅ Root API response received');
                console.log('📋 Message:', rootData.message);
                console.log('📋 Available endpoints:', rootData.endpoints);
            } else {
                const errorText = await rootResponse.text();
                console.log('❌ Root failed:', rootResponse.status, errorText.substring(0, 200));
            }
        } catch (error) {
            console.log('❌ Root error:', error.message);
        }

        // Test 2: Health endpoint
        console.log('\n2. Testing health endpoint...');
        try {
            const healthResponse = await fetch(`${RAILWAY_API}/health`);
            console.log('❤️ Health status:', healthResponse.status);

            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log('✅ Health:', healthData.status);
                console.log('📊 System:', healthData.system);
            } else {
                console.log('❌ Health failed:', healthResponse.status);
            }
        } catch (error) {
            console.log('❌ Health error:', error.message);
        }

        // Test 3: Distributors endpoint
        console.log('\n3. Testing distributors endpoint...');
        try {
            const distributorsResponse = await fetch(`${RAILWAY_API}/distributors`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                }
            });

            console.log('👥 Distributors status:', distributorsResponse.status);
            console.log('📄 CORS headers present:', {
                'Access-Control-Allow-Origin': distributorsResponse.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': distributorsResponse.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': distributorsResponse.headers.get('Access-Control-Allow-Headers')
            });

            if (distributorsResponse.ok) {
                const distributorsData = await distributorsResponse.json();
                console.log('✅ Distributors response received');
                console.log('📋 Success:', distributorsData.success);
                console.log('📋 Data keys:', Object.keys(distributorsData.data || {}));
            } else {
                const errorText = await distributorsResponse.text();
                console.log('❌ Distributors failed:', distributorsResponse.status);
                console.log('Error details:', errorText.substring(0, 300));
            }
        } catch (error) {
            console.log('❌ Distributors error:', error.message);
        }

        // Test 4: Delivery scheduling endpoint
        console.log('\n4. Testing delivery scheduling endpoint...');
        try {
            const deliveryResponse = await fetch(`${RAILWAY_API}/delivery/schedules`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                }
            });

            console.log('📅 Delivery status:', deliveryResponse.status);

            if (deliveryResponse.ok) {
                const deliveryData = await deliveryResponse.json();
                console.log('✅ Delivery response received');
                console.log('📋 Success:', deliveryData.success);
                console.log('📋 Data keys:', Object.keys(deliveryData.data || {}));
            } else {
                const errorText = await deliveryResponse.text();
                console.log('❌ Delivery failed:', deliveryResponse.status);
                console.log('Error details:', errorText.substring(0, 300));
            }
        } catch (error) {
            console.log('❌ Delivery error:', error.message);
        }

        // Test 5: Status endpoint
        console.log('\n5. Testing system status endpoint...');
        try {
            const statusResponse = await fetch(`${RAILWAY_API}/status`);
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log('✅ Database:', statusData.database);
                console.log('✅ System:', statusData.system);
                console.log('📊 Services:', statusData.services);
            } else {
                console.log('❌ Status failed:', statusResponse.status);
            }
        } catch (error) {
            console.log('❌ Status error:', error.message);
        }

        console.log('\n🎉 Railway API testing completed!');
        console.log('💡 Check the results above to identify any issues.');

    } catch (error) {
        console.error('❌ Overall test failed:', error.message);
    }
}

// Make function available globally
window.testRailwayAPI = testRailwayAPI;

// Auto-run if in development
if (window.location.hostname === 'localhost') {
    console.log('🚀 Run testRailwayAPI() in console to test Railway endpoints');
}

export default testRailwayAPI; 