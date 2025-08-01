#!/usr/bin/env node

/**
 * Distribution API Testing Script
 * Tests all distribution-related endpoints to ensure they work correctly
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';
const API_BASE = `${BASE_URL}/api/distribution`;

// Test configuration
const TEST_CONFIG = {
    timeout: 10000,
    retries: 3
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

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`)
};

/**
 * Test API endpoint
 */
async function testEndpoint(name, method, endpoint, expectedStatus = 200, body = null) {
    try {
        log.test(`Testing ${name}: ${method} ${endpoint}`);

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Distribution-API-Test/1.0'
            },
            timeout: TEST_CONFIG.timeout
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();

        if (response.status === expectedStatus) {
            log.success(`${name} - Status: ${response.status}`);
            if (data.success) {
                log.info(`Response: ${data.message || 'Success'}`);
            }
            return { success: true, data, status: response.status };
        } else {
            log.error(`${name} - Expected ${expectedStatus}, got ${response.status}`);
            log.error(`Error: ${data.message || 'Unknown error'}`);
            return { success: false, data, status: response.status };
        }
    } catch (error) {
        log.error(`${name} - Network/Timeout Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Main testing function
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 Distribution API Testing Suite');
    console.log('='.repeat(60));

    const results = [];

    try {
        // Test 1: Health check
        const healthTest = await testEndpoint(
            'Health Check',
            'GET',
            '/health'
        );
        results.push({ name: 'Health Check', ...healthTest });

        // Test 2: Connection test
        const connectionTest = await testEndpoint(
            'Connection Test',
            'GET',
            '/test-connection'
        );
        results.push({ name: 'Connection Test', ...connectionTest });

        // Test 3: Auto schedules (main feature)
        const autoSchedulesTest = await testEndpoint(
            'Auto Schedules',
            'GET',
            '/schedules/auto'
        );
        results.push({ name: 'Auto Schedules', ...autoSchedulesTest });

        // Test 4: Auto schedules direct
        const autoDirectTest = await testEndpoint(
            'Auto Schedules Direct',
            'GET',
            '/schedules/auto-direct'
        );
        results.push({ name: 'Auto Schedules Direct', ...autoDirectTest });

        // Test 5: Schedule statistics
        const statsTest = await testEndpoint(
            'Schedule Statistics',
            'GET',
            '/schedules/statistics'
        );
        results.push({ name: 'Schedule Statistics', ...statsTest });

        // Test 6: Distribution schedules
        const schedulesTest = await testEndpoint(
            'Distribution Schedules',
            'GET',
            '/schedules'
        );
        results.push({ name: 'Distribution Schedules', ...schedulesTest });

        // Test 7: Today's schedules
        const todayTest = await testEndpoint(
            'Today Schedules',
            'GET',
            '/schedules/today'
        );
        results.push({ name: 'Today Schedules', ...todayTest });

    } catch (error) {
        log.error(`Test suite error: ${error.message}`);
    }

    // Results summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const statusText = result.success ? 'PASSED' : 'FAILED';
        console.log(`${status} ${result.name}: ${statusText}`);

        if (!result.success && result.data?.message) {
            console.log(`   Error: ${result.data.message}`);
        }
    });

    console.log(`\n📈 Overall: ${passed}/${results.length} tests passed`);

    if (failed === 0) {
        log.success('🎉 All tests passed! Distribution API is working correctly.');
    } else {
        log.warn(`⚠️  ${failed} test(s) failed. Check the errors above.`);
    }

    console.log('='.repeat(60) + '\n');

    return { passed, failed, total: results.length };
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests()
        .then(results => {
            process.exit(results.failed === 0 ? 0 : 1);
        })
        .catch(error => {
            log.error(`Test runner error: ${error.message}`);
            process.exit(1);
        });
}

export default runTests;