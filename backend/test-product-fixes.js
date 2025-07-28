/**
 * Test Product Management Fixes
 * This script tests all the fixes applied to the product management system
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_TOKEN = process.env.TEST_TOKEN; // You need to provide a valid JWT token

// Test data with Arabic content
const testProductData = {
    name: "خبز عربي مميز",
    description: "خبز طازج مصنوع من أجود أنواع الدقيق",
    category: "bread",
    unit: "piece",
    price_eur: 2.50,
    price_syp: 3500,
    cost_eur: 1.20,
    cost_syp: 1800,
    stock_quantity: 50,
    minimum_stock: 10,
    barcode: "TEST123456",
    is_featured: true,
    status: "active",
    weight_grams: 250,
    shelf_life_days: 3,
    storage_conditions: "يحفظ في مكان بارد وجاف",
    supplier_info: "مخبز الأصالة - هاتف: 123456789",
    nutritional_info: "سعرات حرارية: 150 - بروتين: 5 جرام",
    allergen_info: "يحتوي على الجلوتين"
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, isFormData = false) => {
    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            ...(!isFormData && { 'Content-Type': 'application/json' })
        }
    };

    if (data) {
        if (isFormData) {
            config.data = data;
            config.headers = { ...config.headers, ...data.getHeaders() };
        } else {
            config.data = data;
        }
    }

    try {
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
};

// Test functions
const tests = {
    // Test 1: Create product with Arabic content
    async testArabicContent() {
        console.log('\n🧪 Test 1: Creating product with Arabic content...');
        
        const result = await makeRequest('POST', '/products', testProductData);
        
        if (result.success) {
            console.log('✅ Product created successfully with Arabic content');
            console.log(`📋 Product ID: ${result.data.data.id}`);
            console.log(`📋 Product Name: ${result.data.data.name}`);
            return result.data.data.id;
        } else {
            console.log('❌ Failed to create product with Arabic content');
            console.log('Error:', result.error);
            return null;
        }
    },

    // Test 2: Test null handling for optional fields
    async testNullHandling() {
        console.log('\n🧪 Test 2: Testing null handling for optional fields...');
        
        const minimalProductData = {
            name: "Minimal Test Product",
            category: "other",
            unit: "piece",
            price_eur: 1.00,
            // All other fields are intentionally omitted or null
            price_syp: null,
            cost_eur: null,
            cost_syp: null,
            stock_quantity: null,
            minimum_stock: null,
            weight_grams: null,
            shelf_life_days: null
        };

        const result = await makeRequest('POST', '/products', minimalProductData);
        
        if (result.success) {
            console.log('✅ Product created successfully with null optional fields');
            console.log(`📋 Product ID: ${result.data.data.id}`);
            return result.data.data.id;
        } else {
            console.log('❌ Failed to create product with null optional fields');
            console.log('Error:', result.error);
            return null;
        }
    },

    // Test 3: Test JSON field processing
    async testJsonFields() {
        console.log('\n🧪 Test 3: Testing JSON field processing...');
        
        const jsonTestData = {
            name: "JSON Test Product",
            category: "other",
            unit: "piece",
            price_eur: 1.50,
            supplier_info: JSON.stringify({
                name: "Test Supplier",
                contact: "test@supplier.com",
                notes: "Test supplier notes"
            }),
            nutritional_info: JSON.stringify({
                description: "Test nutrition info",
                calories: 200,
                protein: 8.5,
                carbs: 30.2,
                fat: 5.1
            }),
            allergen_info: JSON.stringify({
                description: "Contains test allergens",
                contains: ["gluten", "nuts"],
                may_contain: ["dairy", "soy"]
            })
        };

        const result = await makeRequest('POST', '/products', jsonTestData);
        
        if (result.success) {
            console.log('✅ Product created successfully with JSON fields');
            console.log(`📋 Product ID: ${result.data.data.id}`);
            console.log('📋 Supplier Info:', JSON.stringify(result.data.data.supplier_info, null, 2));
            return result.data.data.id;
        } else {
            console.log('❌ Failed to create product with JSON fields');
            console.log('Error:', result.error);
            return null;
        }
    },

    // Test 4: Test duplicate handling
    async testDuplicateHandling() {
        console.log('\n🧪 Test 4: Testing duplicate name/barcode handling...');
        
        // Try to create a product with the same name as test 1
        const duplicateData = {
            ...testProductData,
            barcode: "DUPLICATE123"
        };

        const result = await makeRequest('POST', '/products', duplicateData);
        
        if (!result.success && result.status === 400) {
            console.log('✅ Duplicate handling working correctly');
            console.log('📋 Error message:', result.error.message);
            return true;
        } else {
            console.log('❌ Duplicate handling not working correctly');
            console.log('Result:', result);
            return false;
        }
    },

    // Test 5: Test image upload (if test image exists)
    async testImageUpload(productId) {
        console.log('\n🧪 Test 5: Testing image upload...');
        
        if (!productId) {
            console.log('❌ No product ID provided for image upload test');
            return false;
        }

        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAOtpUqwAAAABJRU5ErkJggg==',
            'base64'
        );

        const formData = new FormData();
        formData.append('image', testImageBuffer, {
            filename: 'اختبار_صورة.png', // Arabic filename
            contentType: 'image/png'
        });

        const result = await makeRequest('POST', `/products/${productId}/image`, formData, true);
        
        if (result.success) {
            console.log('✅ Image uploaded successfully with Arabic filename');
            console.log(`📋 Image URL: ${result.data.data.image_url}`);
            return true;
        } else {
            console.log('❌ Failed to upload image');
            console.log('Error:', result.error);
            return false;
        }
    },

    // Test 6: Test error handling
    async testErrorHandling() {
        console.log('\n🧪 Test 6: Testing error handling...');
        
        // Test with invalid data
        const invalidData = {
            // Missing required name field
            category: "bread",
            unit: "piece",
            price_eur: "invalid_price" // Invalid price format
        };

        const result = await makeRequest('POST', '/products', invalidData);
        
        if (!result.success && result.status === 400) {
            console.log('✅ Error handling working correctly');
            console.log('📋 Error message:', result.error.message);
            return true;
        } else {
            console.log('❌ Error handling not working correctly');
            console.log('Result:', result);
            return false;
        }
    }
};

// Main test runner
async function runTests() {
    console.log('🚀 Starting Product Management System Tests...');
    console.log('=' .repeat(60));

    if (!TEST_TOKEN) {
        console.log('❌ TEST_TOKEN environment variable is required');
        process.exit(1);
    }

    const results = {
        passed: 0,
        failed: 0,
        productIds: []
    };

    try {
        // Test 1: Arabic content
        const productId1 = await tests.testArabicContent();
        if (productId1) {
            results.passed++;
            results.productIds.push(productId1);
        } else {
            results.failed++;
        }

        // Test 2: Null handling
        const productId2 = await tests.testNullHandling();
        if (productId2) {
            results.passed++;
            results.productIds.push(productId2);
        } else {
            results.failed++;
        }

        // Test 3: JSON fields
        const productId3 = await tests.testJsonFields();
        if (productId3) {
            results.passed++;
            results.productIds.push(productId3);
        } else {
            results.failed++;
        }

        // Test 4: Duplicate handling
        const duplicateTest = await tests.testDuplicateHandling();
        if (duplicateTest) {
            results.passed++;
        } else {
            results.failed++;
        }

        // Test 5: Image upload (using first product)
        if (results.productIds.length > 0) {
            const imageTest = await tests.testImageUpload(results.productIds[0]);
            if (imageTest) {
                results.passed++;
            } else {
                results.failed++;
            }
        } else {
            console.log('\n❌ Test 5: Skipped - No product available for image upload');
            results.failed++;
        }

        // Test 6: Error handling
        const errorTest = await tests.testErrorHandling();
        if (errorTest) {
            results.passed++;
        } else {
            results.failed++;
        }

    } catch (error) {
        console.log('\n❌ Unexpected error during tests:', error.message);
        results.failed++;
    }

    // Results summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.productIds.length > 0) {
        console.log('\n📋 Created Product IDs (for cleanup):');
        results.productIds.forEach(id => console.log(`  - ${id}`));
    }

    console.log('\n🏁 Tests completed!');
    
    if (results.failed === 0) {
        console.log('🎉 All tests passed! Product management fixes are working correctly.');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please review the output above.');
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runTests().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export default { tests, runTests }; 