import axios from 'axios';
import fs from 'fs';

// Base URL for local testing
const BASE_URL = 'http://localhost:5001/api';

// Test authentication token
let authToken = null;

// Test user credentials - استخدام username بدلاً من email
const testUser = {
    username: 'admin', // تم إصلاح المشكلة هنا
    password: 'admin123'
};

// Console colors
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

const log = (message, color = colors.reset) => {
    console.log(`${color}${message}${colors.reset}`);
};

// Authentication function
async function authenticate() {
    try {
        log('🔑 Testing authentication with correct credentials...', colors.blue);
        const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
        
        if (response.data.success && response.data.data.token) {
            authToken = response.data.data.token;
            log('✅ Authentication successful!', colors.green);
            log(`   Token: ${authToken.substring(0, 20)}...`, colors.cyan);
            return true;
        } else {
            log('❌ Authentication failed - no token returned', colors.red);
            return false;
        }
    } catch (error) {
        log(`❌ Authentication failed: ${error.message}`, colors.red);
        if (error.response?.data?.message) {
            log(`   Error details: ${error.response.data.message}`, colors.red);
        }
        return false;
    }
}

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null) {
    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        config.data = data;
    }
    
    return axios(config);
}

// Test system health
async function testSystemHealth() {
    log('\n💚 Testing Local System Health', colors.blue);
    
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.data.success) {
            log('✅ System Health: HEALTHY', colors.green);
            log(`   Uptime: ${Math.round(response.data.uptime)} seconds`, colors.cyan);
            log(`   Memory Usage: ${Math.round(response.data.memory.heapUsed / 1024 / 1024)}MB`, colors.cyan);
            log(`   Environment: ${response.data.environment}`, colors.cyan);
            return true;
        }
    } catch (error) {
        log(`❌ System Health: FAILED - ${error.message}`, colors.red);
        return false;
    }
}

// Test distribution endpoints with authentication
async function testDistributionEndpoints() {
    log('\n🚚 Testing Distribution System Endpoints (Authenticated)', colors.blue);
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    const tests = [
        {
            name: 'GET /distribution/test (Public)',
            method: 'GET',
            endpoint: '/distribution/test',
            expectAuth: false
        },
        {
            name: 'GET /distribution/schedules',
            method: 'GET', 
            endpoint: '/distribution/schedules',
            expectAuth: true
        },
        {
            name: 'GET /distribution/schedules/today',
            method: 'GET',
            endpoint: '/distribution/schedules/today',
            expectAuth: true
        },
        {
            name: 'GET /distribution/schedules/auto',
            method: 'GET',
            endpoint: '/distribution/schedules/auto',
            expectAuth: true
        },
        {
            name: 'GET /distribution/schedules/statistics',
            method: 'GET',
            endpoint: '/distribution/schedules/statistics',
            expectAuth: true
        },
        {
            name: 'GET /distribution/trips (FIXED)',
            method: 'GET',
            endpoint: '/distribution/trips',
            expectAuth: true
        },
        {
            name: 'GET /distribution/trips/today/active',
            method: 'GET',
            endpoint: '/distribution/trips/today/active',
            expectAuth: true
        },
        {
            name: 'GET /distribution/trips/statistics (FIXED)',
            method: 'GET',
            endpoint: '/distribution/trips/statistics',
            expectAuth: true
        },
        {
            name: 'GET /distribution/location/active',
            method: 'GET',
            endpoint: '/distribution/location/active',
            expectAuth: true
        },
        {
            name: 'GET /distribution/performance',
            method: 'GET',
            endpoint: '/distribution/performance',
            expectAuth: true
        },
        {
            name: 'GET /distribution/notifications',
            method: 'GET',
            endpoint: '/distribution/notifications',
            expectAuth: true
        },
        {
            name: 'GET /distribution/settings',
            method: 'GET',
            endpoint: '/distribution/settings',
            expectAuth: true
        }
    ];

    for (const test of tests) {
        results.total++;
        log(`\n🔍 Testing: ${test.name}`, colors.yellow);
        
        try {
            let response;
            if (test.expectAuth) {
                response = await makeRequest(test.method, test.endpoint);
            } else {
                response = await axios.get(`${BASE_URL}${test.endpoint}`);
            }
            
            if (response.status === 200 || response.status === 201) {
                log(`✅ ${test.name}: PASSED (${response.status})`, colors.green);
                
                // Log some response details
                if (response.data && response.data.data) {
                    const dataKeys = Object.keys(response.data.data);
                    log(`   📊 Response contains: ${dataKeys.join(', ')}`, colors.cyan);
                }
                
                results.passed++;
                results.tests.push({
                    name: test.name,
                    status: 'PASSED',
                    statusCode: response.status,
                    hasData: !!response.data
                });
            } else {
                log(`⚠️ ${test.name}: UNEXPECTED STATUS (${response.status})`, colors.yellow);
                results.failed++;
                results.tests.push({
                    name: test.name,
                    status: 'FAILED',
                    statusCode: response.status,
                    error: 'Unexpected status code'
                });
            }
        } catch (error) {
            log(`❌ ${test.name}: FAILED - ${error.message}`, colors.red);
            if (error.response?.status) {
                log(`   Status Code: ${error.response.status}`, colors.red);
            }
            if (error.response?.data?.message) {
                log(`   Error Message: ${error.response.data.message}`, colors.red);
            }
            results.failed++;
            results.tests.push({
                name: test.name,
                status: 'FAILED',
                error: error.message,
                statusCode: error.response?.status || 'No response'
            });
        }
    }

    return results;
}

// Test database models with authentication
async function testDatabaseModels() {
    log('\n🗄️ Testing Database Models & Tables (Authenticated)', colors.blue);
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    const modelTests = [
        {
            name: 'Check Users table',
            endpoint: '/users?limit=1',
            expectAuth: true
        },
        {
            name: 'Check Stores table', 
            endpoint: '/stores?limit=1',
            expectAuth: true
        },
        {
            name: 'Check Products table',
            endpoint: '/products?limit=1',
            expectAuth: false // Products doesn't require auth
        },
        {
            name: 'Check Orders table',
            endpoint: '/orders?limit=1',
            expectAuth: true
        },
        {
            name: 'Check Vehicles table',
            endpoint: '/vehicles?limit=1',
            expectAuth: true
        }
    ];

    for (const test of modelTests) {
        results.total++;
        log(`\n🔍 Testing: ${test.name}`, colors.yellow);
        
        try {
            let response;
            if (test.expectAuth) {
                response = await makeRequest('GET', test.endpoint);
            } else {
                response = await axios.get(`${BASE_URL}${test.endpoint}`);
            }
            
            if (response.status === 200) {
                log(`✅ ${test.name}: ACCESSIBLE`, colors.green);
                
                // Log data count if available
                if (response.data?.data) {
                    const dataCount = Array.isArray(response.data.data) ? response.data.data.length : 1;
                    log(`   📊 Records found: ${dataCount}`, colors.cyan);
                }
                
                results.passed++;
                results.tests.push({
                    name: test.name,
                    status: 'PASSED',
                    hasData: !!response.data?.data
                });
            }
        } catch (error) {
            log(`❌ ${test.name}: FAILED - ${error.message}`, colors.red);
            results.failed++;
            results.tests.push({
                name: test.name,
                status: 'FAILED',
                error: error.message
            });
        }
    }

    return results;
}

// Test CRUD operations for distribution system
async function testDistributionCRUD() {
    log('\n🔧 Testing Distribution CRUD Operations', colors.blue);
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test creating a distribution schedule
    try {
        results.total++;
        log('\n🔍 Testing: Create Distribution Schedule', colors.yellow);
        
        const scheduleData = {
            distributor_id: 1, // Assuming admin user exists
            schedule_date: new Date().toISOString().split('T')[0],
            stores_data: [
                {
                    store_id: 1,
                    estimated_duration: 30,
                    order_ids: [],
                    distance_from_previous: 5.2,
                    notes: 'Test visit'
                }
            ]
        };

        const response = await makeRequest('POST', '/distribution/schedules/generate', scheduleData);
        
        if (response.status === 201 || response.status === 409) { // 409 if already exists
            log(`✅ Create Distribution Schedule: ${response.status === 201 ? 'CREATED' : 'ALREADY EXISTS'}`, colors.green);
            results.passed++;
        } else {
            log(`⚠️ Create Distribution Schedule: UNEXPECTED STATUS (${response.status})`, colors.yellow);
            results.failed++;
        }
        
        results.tests.push({
            name: 'Create Distribution Schedule',
            status: response.status === 201 || response.status === 409 ? 'PASSED' : 'FAILED',
            statusCode: response.status
        });
        
    } catch (error) {
        log(`❌ Create Distribution Schedule: FAILED - ${error.message}`, colors.red);
        results.failed++;
        results.tests.push({
            name: 'Create Distribution Schedule',
            status: 'FAILED',
            error: error.message
        });
    }

    return results;
}

// Generate comprehensive report
function generateReport(testResults) {
    log('\n📊 COMPREHENSIVE DISTRIBUTION SYSTEM TEST REPORT', colors.blue);
    log('=' .repeat(60), colors.blue);
    
    const totalTests = testResults.distribution.total + testResults.models.total + (testResults.crud?.total || 0);
    const totalPassed = testResults.distribution.passed + testResults.models.passed + (testResults.crud?.passed || 0);
    const totalFailed = testResults.distribution.failed + testResults.models.failed + (testResults.crud?.failed || 0);
    
    log(`\n🎯 Overall Results:`, colors.blue);
    log(`Total Tests: ${totalTests}`);
    log(`Passed: ${totalPassed}`, colors.green);
    log(`Failed: ${totalFailed}`, totalFailed === 0 ? colors.green : colors.red);
    log(`Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`, colors.yellow);
    
    log(`\n🚚 Distribution Endpoints:`, colors.blue);
    log(`- Tests Run: ${testResults.distribution.total}`);
    log(`- Passed: ${testResults.distribution.passed}`, colors.green);
    log(`- Failed: ${testResults.distribution.failed}`, testResults.distribution.failed === 0 ? colors.green : colors.red);
    
    log(`\n🗄️ Database Models:`, colors.blue);
    log(`- Tests Run: ${testResults.models.total}`);
    log(`- Passed: ${testResults.models.passed}`, colors.green);
    log(`- Failed: ${testResults.models.failed}`, testResults.models.failed === 0 ? colors.green : colors.red);
    
    if (testResults.crud) {
        log(`\n🔧 CRUD Operations:`, colors.blue);
        log(`- Tests Run: ${testResults.crud.total}`);
        log(`- Passed: ${testResults.crud.passed}`, colors.green);
        log(`- Failed: ${testResults.crud.failed}`, testResults.crud.failed === 0 ? colors.green : colors.red);
    }
    
    // Save detailed report to file
    const reportData = {
        timestamp: new Date().toISOString(),
        testType: 'LOCAL_COMPREHENSIVE_TEST',
        serverUrl: BASE_URL,
        summary: {
            total: totalTests,
            passed: totalPassed,
            failed: totalFailed,
            successRate: Math.round((totalPassed / totalTests) * 100)
        },
        distribution: testResults.distribution,
        models: testResults.models,
        crud: testResults.crud,
        systemHealth: testResults.systemHealth,
        authenticated: testResults.authenticated
    };
    
    fs.writeFileSync('distribution-system-local-test-report.json', JSON.stringify(reportData, null, 2));
    log(`\n📄 Detailed report saved to: distribution-system-local-test-report.json`, colors.blue);
}

// Main test function
async function runComprehensiveDistributionTests() {
    log('🚀 Starting Comprehensive Distribution System Tests (LOCAL)', colors.blue);
    log('=' .repeat(60), colors.blue);
    log(`🎯 Testing against: ${BASE_URL}`, colors.cyan);
    
    // Test system health first
    const systemHealth = await testSystemHealth();
    
    if (!systemHealth) {
        log('❌ System health check failed. Aborting tests.', colors.red);
        return;
    }
    
    // Try to authenticate
    const authenticated = await authenticate();
    
    if (!authenticated) {
        log('❌ Authentication failed. Cannot proceed with authenticated tests.', colors.red);
        return;
    }
    
    // Run distribution endpoint tests
    const distributionResults = await testDistributionEndpoints();
    
    // Run database model tests
    const modelResults = await testDatabaseModels();
    
    // Run CRUD operations tests
    const crudResults = await testDistributionCRUD();
    
    // Generate comprehensive report
    const testResults = {
        distribution: distributionResults,
        models: modelResults,
        crud: crudResults,
        systemHealth: systemHealth,
        authenticated: authenticated
    };
    
    generateReport(testResults);
    
    log('\n🏁 Comprehensive Distribution System Tests Completed!', colors.green);
    
    const allTestsPassed = distributionResults.failed === 0 && modelResults.failed === 0 && crudResults.failed === 0;
    
    if (systemHealth && authenticated && allTestsPassed) {
        log('🎉 ALL TESTS PASSED! System is ready for production use!', colors.green);
    } else {
        log('⚠️ Some tests failed. Please review the report for details.', colors.yellow);
    }
}

// Run the tests
runComprehensiveDistributionTests().catch(error => {
    log(`💥 Test suite failed: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
});