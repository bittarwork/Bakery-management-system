import http from 'http';

// Simple test function
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && method === 'POST') {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve({ status: res.statusCode, data });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data && method === 'POST') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runSimpleTests() {
    console.log('🚀 Starting Simple Tests...\n');
    
    try {
        // Test 1: Health Check
        console.log('🔍 Testing Health Check...');
        const healthResponse = await makeRequest('/api/health');
        if (healthResponse.status === 200) {
            console.log('✅ Health check passed');
            console.log(`   Status: ${healthResponse.data.status}`);
        } else {
            console.log('❌ Health check failed');
        }
        
        // Test 2: AI Health Check
        console.log('\n🤖 Testing AI Health Check...');
        const aiHealthResponse = await makeRequest('/api/ai-chat/health');
        if (aiHealthResponse.status === 200) {
            console.log('✅ AI health check passed');
            console.log(`   Provider: ${aiHealthResponse.data.data.provider}`);
        } else {
            console.log('❌ AI health check failed');
        }
        
        // Test 3: Login Test
        console.log('\n🔐 Testing Login...');
        const loginResponse = await makeRequest('/api/auth/login', 'POST', {
            email: 'admin@bakery.com',
            password: 'admin123'
        });
        
        if (loginResponse.status === 200 && loginResponse.data.token) {
            console.log('✅ Login successful');
            const token = loginResponse.data.token;
            
            // Test 4: AI Config (requires auth)
            console.log('\n⚙️ Testing AI Config...');
            const configOptions = {
                hostname: 'localhost',
                port: 5001,
                path: '/api/ai-chat/config',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const configResponse = await new Promise((resolve, reject) => {
                const req = http.request(configOptions, (res) => {
                    let body = '';
                    res.on('data', (chunk) => body += chunk);
                    res.on('end', () => {
                        try {
                            resolve({ status: res.statusCode, data: JSON.parse(body) });
                        } catch (e) {
                            resolve({ status: res.statusCode, body });
                        }
                    });
                });
                req.on('error', reject);
                req.end();
            });
            
            if (configResponse.status === 200) {
                console.log('✅ AI config test passed');
                console.log(`   Bot name: ${configResponse.data.botName}`);
            } else {
                console.log('❌ AI config test failed');
            }
            
        } else {
            console.log('❌ Login failed');
        }
        
        console.log('\n🎉 Simple tests completed!');
        
    } catch (error) {
        console.log(`❌ Test error: ${error.message}`);
    }
}

runSimpleTests();