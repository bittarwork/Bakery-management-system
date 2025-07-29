import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api';

// Test configuration
const testConfig = {
    timeout: 10000,
    verbose: true
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test functions
const tests = {
    async healthCheck() {
        log('\n🔍 Testing Health Check...', 'blue');
        try {
            const response = await fetch(`${BASE_URL}/health`, {
                method: 'GET',
                timeout: testConfig.timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                log('✅ Health check passed', 'green');
                if (testConfig.verbose) {
                    log(`   Status: ${data.status}`, 'cyan');
                    log(`   Uptime: ${Math.round(data.uptime)}s`, 'cyan');
                }
                return true;
            } else {
                log(`❌ Health check failed: ${response.status}`, 'red');
                return false;
            }
        } catch (error) {
            log(`❌ Health check error: ${error.message}`, 'red');
            return false;
        }
    },

    async aiHealthCheck() {
        log('\n🤖 Testing AI Health Check...', 'blue');
        try {
            const response = await fetch(`${BASE_URL}/ai-chat/health`, {
                method: 'GET',
                timeout: testConfig.timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                log('✅ AI health check passed', 'green');
                if (testConfig.verbose) {
                    log(`   Provider: ${data.data.provider}`, 'cyan');
                    log(`   Cache: ${data.data.cacheEnabled ? 'enabled' : 'disabled'}`, 'cyan');
                }
                return true;
            } else {
                log(`❌ AI health check failed: ${response.status}`, 'red');
                return false;
            }
        } catch (error) {
            log(`❌ AI health check error: ${error.message}`, 'red');
            return false;
        }
    },

    async testBasicLogin() {
        log('\n🔐 Testing Basic Login...', 'blue');
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'admin@bakery.com',
                    password: 'admin123'
                }),
                timeout: testConfig.timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                log('✅ Login test passed', 'green');
                if (testConfig.verbose && data.token) {
                    log('   Token received', 'cyan');
                }
                return data.token;
            } else {
                const errorData = await response.json().catch(() => null);
                log(`❌ Login failed: ${response.status}`, 'red');
                if (errorData) {
                    log(`   Error: ${errorData.message}`, 'red');
                }
                return null;
            }
        } catch (error) {
            log(`❌ Login error: ${error.message}`, 'red');
            return null;
        }
    },

    async testAIConfig(token) {
        log('\n⚙️ Testing AI Config...', 'blue');
        try {
            const response = await fetch(`${BASE_URL}/ai-chat/config`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: testConfig.timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                log('✅ AI config test passed', 'green');
                if (testConfig.verbose) {
                    log(`   Bot name: ${data.botName}`, 'cyan');
                    log(`   Features: ${data.enabledFeatures.join(', ')}`, 'cyan');
                }
                return true;
            } else {
                log(`❌ AI config failed: ${response.status}`, 'red');
                return false;
            }
        } catch (error) {
            log(`❌ AI config error: ${error.message}`, 'red');
            return false;
        }
    },

    async testAIMessage(token) {
        log('\n💬 Testing AI Message...', 'blue');
        try {
            const testMessage = 'مرحبا، هل يمكنك إعطائي نظرة عامة على النظام؟';
            const response = await fetch(`${BASE_URL}/ai-chat/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: testMessage,
                    context: {
                        sessionId: 'test_session_' + Date.now()
                    }
                }),
                timeout: 30000 // AI responses can take longer
            });
            
            if (response.ok) {
                const data = await response.json();
                log('✅ AI message test passed', 'green');
                if (testConfig.verbose) {
                    log(`   Response length: ${data.response.length} chars`, 'cyan');
                    log(`   Intent: ${data.intent || 'not detected'}`, 'cyan');
                }
                return true;
            } else {
                log(`❌ AI message failed: ${response.status}`, 'red');
                const errorData = await response.json().catch(() => null);
                if (errorData) {
                    log(`   Error: ${errorData.message}`, 'red');
                }
                return false;
            }
        } catch (error) {
            log(`❌ AI message error: ${error.message}`, 'red');
            return false;
        }
    },

    async testAIActions(token) {
        log('\n🎬 Testing AI Actions...', 'blue');
        try {
            const response = await fetch(`${BASE_URL}/ai-chat/actions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: testConfig.timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                log('✅ AI actions test passed', 'green');
                if (testConfig.verbose && data.actions) {
                    log(`   Available actions: ${data.actions.length}`, 'cyan');
                }
                return true;
            } else {
                log(`❌ AI actions failed: ${response.status}`, 'red');
                return false;
            }
        } catch (error) {
            log(`❌ AI actions error: ${error.message}`, 'red');
            return false;
        }
    }
};

// Main test runner
async function runTests() {
    log('🚀 Starting Enhanced AI System Tests', 'yellow');
    log('=' * 50, 'yellow');
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };
    
    // Run basic tests
    results.total++;
    if (await tests.healthCheck()) results.passed++;
    else results.failed++;
    
    results.total++;
    if (await tests.aiHealthCheck()) results.passed++;
    else results.failed++;
    
    // Get auth token
    const token = await tests.testBasicLogin();
    results.total++;
    if (token) results.passed++;
    else results.failed++;
    
    if (token) {
        // Run authenticated tests
        results.total++;
        if (await tests.testAIConfig(token)) results.passed++;
        else results.failed++;
        
        results.total++;
        if (await tests.testAIMessage(token)) results.passed++;
        else results.failed++;
        
        results.total++;
        if (await tests.testAIActions(token)) results.passed++;
        else results.failed++;
    } else {
        log('\n⚠️ Skipping authenticated tests due to login failure', 'yellow');
        results.failed += 3; // Skip 3 tests
        results.total += 3;
    }
    
    // Print results
    log('\n' + '='.repeat(50), 'yellow');
    log('📊 Test Results Summary', 'yellow');
    log('='.repeat(50), 'yellow');
    log(`Total Tests: ${results.total}`, 'cyan');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, 'red');
    log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`, 
        results.failed === 0 ? 'green' : results.passed > results.failed ? 'yellow' : 'red');
    
    if (results.failed === 0) {
        log('\n🎉 All tests passed! Enhanced AI system is working perfectly!', 'green');
    } else if (results.passed > results.failed) {
        log('\n⚠️ Most tests passed, but some issues detected.', 'yellow');
    } else {
        log('\n❌ Multiple test failures detected. System needs attention.', 'red');
    }
    
    log('\n🏁 Testing completed.', 'blue');
    
    process.exit(results.failed === 0 ? 0 : 1);
}

// Add error handling
process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
    process.exit(1);
});

// Run tests
runTests().catch(error => {
    log(`❌ Test runner failed: ${error.message}`, 'red');
    process.exit(1);
});