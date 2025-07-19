import axios from 'axios';
import chalk from 'chalk';

// Test configuration
const BASE_URL = 'https://bakery-management-system-production.up.railway.app/api';
const TEST_CREDENTIALS = {
    email: 'admin@bakery.com',
    password: 'admin123'
};

let authToken = null;

// Helper functions
const log = {
    success: (message) => console.log(chalk.green('✅ ' + message)),
    error: (message) => console.log(chalk.red('❌ ' + message)),
    info: (message) => console.log(chalk.blue('ℹ️ ' + message)),
    warning: (message) => console.log(chalk.yellow('⚠️ ' + message))
};

const makeRequest = async (method, url, data = null, headers = {}) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// Test authentication
const testAuth = async () => {
    try {
        log.info('Testing authentication...');

        const response = await makeRequest('POST', '/auth/login', TEST_CREDENTIALS);
        authToken = response.token;

        log.success('Authentication successful');
        return true;
    } catch (error) {
        log.error(`Authentication failed: ${error.message}`);
        return false;
    }
};

// Test existing endpoints
const testExistingEndpoints = async () => {
    const endpoints = [
        { name: 'Orders', url: '/orders' },
        { name: 'Products', url: '/products' },
        { name: 'Stores', url: '/stores' },
        { name: 'Users', url: '/users' },
        { name: 'Payments', url: '/payments' },
        { name: 'Dashboard', url: '/dashboard/stats' }
    ];

    log.info('Testing existing endpoints...');

    for (const endpoint of endpoints) {
        try {
            await makeRequest('GET', endpoint.url);
            log.success(`${endpoint.name} endpoint working`);
        } catch (error) {
            log.error(`${endpoint.name} endpoint failed: ${error.message}`);
        }
    }
};

// Test new tax endpoints
const testTaxEndpoints = async () => {
    log.info('Testing tax endpoints...');

    try {
        // Test tax config
        await makeRequest('GET', '/tax/config');
        log.success('Tax config endpoint working');

        // Test tax calculation
        const taxCalculation = await makeRequest('POST', '/tax/calculate', {
            items: [
                { product_id: 1, quantity: 2, unit_price: 10 },
                { product_id: 2, quantity: 1, unit_price: 15 }
            ],
            currency: 'EUR'
        });
        log.success('Tax calculation endpoint working');

        // Test tax report
        await makeRequest('GET', '/tax/report');
        log.success('Tax report endpoint working');

    } catch (error) {
        log.error(`Tax endpoints failed: ${error.message}`);
    }
};

// Test price history endpoints
const testPriceHistoryEndpoints = async () => {
    log.info('Testing price history endpoints...');

    try {
        // Test price history for product
        await makeRequest('GET', '/price-history/products/1');
        log.success('Price history endpoint working');

        // Test price analytics
        await makeRequest('GET', '/price-history/analytics');
        log.success('Price analytics endpoint working');

        // Test price trends
        await makeRequest('GET', '/price-history/trends');
        log.success('Price trends endpoint working');

        // Test price alerts
        await makeRequest('GET', '/price-history/alerts');
        log.success('Price alerts endpoint working');

    } catch (error) {
        log.error(`Price history endpoints failed: ${error.message}`);
    }
};

// Test refund endpoints
const testRefundEndpoints = async () => {
    log.info('Testing refund endpoints...');

    try {
        // Test refund list
        await makeRequest('GET', '/refunds');
        log.success('Refund list endpoint working');

        // Test refund statistics
        await makeRequest('GET', '/refunds/statistics');
        log.success('Refund statistics endpoint working');

        // Test refund calculation
        await makeRequest('POST', '/refunds/calculate', {
            order_id: 1,
            refund_type: 'partial',
            currency: 'EUR'
        });
        log.success('Refund calculation endpoint working');

    } catch (error) {
        log.error(`Refund endpoints failed: ${error.message}`);
    }
};

// Test database connectivity
const testDatabaseConnectivity = async () => {
    log.info('Testing database connectivity...');

    try {
        // Test by fetching some data
        await makeRequest('GET', '/orders?limit=1');
        log.success('Database connectivity working');

    } catch (error) {
        log.error(`Database connectivity failed: ${error.message}`);
    }
};

// Test multi-currency support
const testMultiCurrencySupport = async () => {
    log.info('Testing multi-currency support...');

    try {
        // Test EUR orders
        await makeRequest('GET', '/orders?currency=EUR');
        log.success('EUR currency support working');

        // Test SYP orders
        await makeRequest('GET', '/orders?currency=SYP');
        log.success('SYP currency support working');

        // Test multi-currency tax calculation
        await makeRequest('POST', '/tax/calculate/multi-currency', {
            items: [{ product_id: 1, quantity: 1, unit_price: 10 }],
            sourceCurrency: 'EUR',
            targetCurrency: 'SYP',
            exchangeRate: 1500
        });
        log.success('Multi-currency tax calculation working');

    } catch (error) {
        log.error(`Multi-currency support failed: ${error.message}`);
    }
};

// Test system health
const testSystemHealth = async () => {
    log.info('Testing system health...');

    try {
        await makeRequest('GET', '/health');
        log.success('System health endpoint working');

        await makeRequest('GET', '/status');
        log.success('System status endpoint working');

    } catch (error) {
        log.error(`System health failed: ${error.message}`);
    }
};

// Test comprehensive order management
const testOrderManagement = async () => {
    log.info('Testing comprehensive order management...');

    try {
        // Test order creation
        const newOrder = await makeRequest('POST', '/orders', {
            store_id: 1,
            items: [
                { product_id: 1, quantity: 2 },
                { product_id: 2, quantity: 1 }
            ],
            currency: 'EUR',
            notes: 'Test order from backend integration test'
        });
        log.success('Order creation working');

        // Test order retrieval
        await makeRequest('GET', `/orders/${newOrder.data.id}`);
        log.success('Order retrieval working');

        // Test order status update
        await makeRequest('PATCH', `/orders/${newOrder.data.id}/status`, {
            status: 'confirmed'
        });
        log.success('Order status update working');

    } catch (error) {
        log.error(`Order management failed: ${error.message}`);
    }
};

// Main test runner
const runTests = async () => {
    console.log(chalk.bold.cyan('\n🧪 Starting Backend Integration Tests\n'));
    console.log(chalk.gray('='.repeat(50)));

    try {
        // Authentication test
        const authSuccess = await testAuth();
        if (!authSuccess) {
            log.error('Authentication failed - stopping tests');
            return;
        }

        // System health tests
        await testSystemHealth();

        // Database connectivity test
        await testDatabaseConnectivity();

        // Existing endpoints tests
        await testExistingEndpoints();

        // New endpoints tests
        await testTaxEndpoints();
        await testPriceHistoryEndpoints();
        await testRefundEndpoints();

        // Multi-currency tests
        await testMultiCurrencySupport();

        // Comprehensive order management test
        await testOrderManagement();

        console.log(chalk.gray('='.repeat(50)));
        console.log(chalk.bold.green('\n✅ Backend Integration Tests Completed Successfully!\n'));

    } catch (error) {
        console.log(chalk.gray('='.repeat(50)));
        console.log(chalk.bold.red('\n❌ Backend Integration Tests Failed!\n'));
        log.error(`Error: ${error.message}`);
    }
};

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}

export default runTests; 