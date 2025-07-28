# 🧪 **Product Management System - Test Instructions**

## 📋 **Overview**
This document provides instructions for running tests to verify that all the product management system fixes are working correctly.

---

## 🚀 **Quick Start**

### **Prerequisites**
1. Node.js (v16 or higher)
2. Valid JWT authentication token
3. Running backend server (local or production)

### **Setup**
1. Install test dependencies:
   ```bash
   cd backend
   npm install axios form-data
   ```

2. Set your authentication token:
   ```bash
   export TEST_TOKEN="your_jwt_token_here"
   ```

### **Running Tests**

#### **Local Development Server**
```bash
# Test against local server (http://localhost:3000)
API_URL=http://localhost:3000/api TEST_TOKEN="your_token" node test-product-fixes.js
```

#### **Production Server**
```bash
# Test against production server
API_URL=https://bakery-management-system-production.up.railway.app/api TEST_TOKEN="your_token" node test-product-fixes.js
```

#### **Using npm scripts** (after copying test-package.json to package.json)
```bash
# Local testing
npm run test:local

# Production testing
npm run test:production
```

---

## 🧪 **Test Cases**

### **Test 1: Arabic Content Handling**
- **Purpose**: Verify system handles Arabic text in all fields
- **Data**: Product with Arabic name, description, and metadata
- **Expected**: Product created successfully with proper encoding

### **Test 2: Null Field Handling**
- **Purpose**: Verify optional fields accept null values
- **Data**: Minimal product data with only required fields
- **Expected**: Product created with null values for optional fields

### **Test 3: JSON Field Processing**
- **Purpose**: Verify complex JSON fields are processed correctly
- **Data**: Product with structured JSON for supplier, nutrition, and allergen info
- **Expected**: JSON fields parsed and stored with proper structure

### **Test 4: Duplicate Prevention**
- **Purpose**: Verify duplicate name/barcode detection
- **Data**: Product with existing name or barcode
- **Expected**: 400 error with clear duplicate message

### **Test 5: Image Upload**
- **Purpose**: Verify image upload with Arabic filenames
- **Data**: Test image with Arabic filename
- **Expected**: Image uploaded successfully with unique server filename

### **Test 6: Error Handling**
- **Purpose**: Verify validation errors are handled properly
- **Data**: Invalid product data (missing name, invalid price)
- **Expected**: 400 error with detailed validation messages

---

## 📊 **Expected Results**

### **Successful Test Run**
```
🚀 Starting Product Management System Tests...
============================================================

🧪 Test 1: Creating product with Arabic content...
✅ Product created successfully with Arabic content
📋 Product ID: 123
📋 Product Name: خبز عربي مميز

🧪 Test 2: Testing null handling for optional fields...
✅ Product created successfully with null optional fields
📋 Product ID: 124

🧪 Test 3: Testing JSON field processing...
✅ Product created successfully with JSON fields
📋 Product ID: 125

🧪 Test 4: Testing duplicate name/barcode handling...
✅ Duplicate handling working correctly
📋 Error message: A product with this name already exists

🧪 Test 5: Testing image upload...
✅ Image uploaded successfully with Arabic filename
📋 Image URL: https://example.com/uploads/product-123456789.png

🧪 Test 6: Testing error handling...
✅ Error handling working correctly
📋 Error message: Product name is required

============================================================
📊 Test Results Summary:
✅ Passed: 6
❌ Failed: 0
📈 Success Rate: 100.0%

📋 Created Product IDs (for cleanup):
  - 123
  - 124
  - 125

🏁 Tests completed!
🎉 All tests passed! Product management fixes are working correctly.
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Authentication Error**
```
❌ 401 Unauthorized
```
**Solution**: Check your TEST_TOKEN is valid and not expired

#### **Network Connection Error**
```
❌ ECONNREFUSED
```
**Solutions**:
- Verify server is running
- Check API_URL is correct
- Verify network connectivity

#### **Database Connection Error**
```
❌ Database connection error
```
**Solutions**:
- Check database server status
- Verify database credentials
- Check network connectivity to database

#### **Test Failures**

##### **Arabic Content Test Fails**
- Check database supports UTF-8 encoding
- Verify character set configuration

##### **JSON Fields Test Fails**
- Check backend JSON parsing logic
- Verify database JSON column types

##### **Image Upload Test Fails**
- Check file upload middleware configuration
- Verify uploads directory permissions
- Check file size limits

---

## 🧹 **Cleanup**

### **Remove Test Data**
After testing, you may want to remove the test products created:

```bash
# Use the product IDs from test output
curl -X DELETE "http://localhost:3000/api/products/123" \
  -H "Authorization: Bearer your_token"
```

### **Cleanup Script**
```javascript
// cleanup-test-data.js
const productIds = [123, 124, 125]; // From test output

for (const id of productIds) {
  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    console.log(`✅ Deleted product ${id}`);
  } catch (error) {
    console.log(`❌ Failed to delete product ${id}: ${error.message}`);
  }
}
```

---

## 📈 **Performance Testing**

### **Load Testing**
For production environments, consider running load tests:

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
# artillery-config.yml
config:
  target: 'https://your-api-url.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Create Product"
    requests:
      - post:
          url: "/api/products"
          headers:
            Authorization: "Bearer {{ $randomString() }}"
          json:
            name: "Test Product {{ $randomString() }}"
            category: "bread"
            unit: "piece"
            price_eur: 1.50

# Run load test
artillery run artillery-config.yml
```

---

## 📞 **Support**

If tests fail or you encounter issues:

1. **Check Logs**: Review server logs for detailed error information
2. **Verify Environment**: Ensure all environment variables are set
3. **Database Status**: Check database connectivity and schema
4. **Network Issues**: Verify API endpoints are accessible
5. **Authentication**: Confirm JWT tokens are valid

---

## 📝 **Test Customization**

### **Adding New Tests**
To add custom tests, modify `test-product-fixes.js`:

```javascript
// Add to tests object
async testCustomFeature() {
    console.log('\n🧪 Custom Test: Testing custom feature...');
    
    const testData = {
        // Your test data
    };
    
    const result = await makeRequest('POST', '/products', testData);
    
    if (result.success) {
        console.log('✅ Custom test passed');
        return true;
    } else {
        console.log('❌ Custom test failed');
        return false;
    }
}
```

### **Environment Configuration**
Create `.env` file for test configuration:

```env
API_URL=http://localhost:3000/api
TEST_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DB_HOST=localhost
DB_NAME=bakery_test
```

---

*These tests verify all the fixes applied to the product management system are working correctly in your environment.* 