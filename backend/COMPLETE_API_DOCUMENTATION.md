# 📋 Complete API Documentation - Bakery Management System

## 🌟 Overview

This is a comprehensive API documentation for the Bakery Management System, featuring advanced distribution management, multi-currency support (EUR/SYP), real-time tracking, and mobile app integration.

### 🔧 Technical Stack

- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL with advanced triggers and functions
- **Authentication**: JWT-based with role-based access control
- **Mobile**: Flutter app for distributors
- **Frontend**: React.js dashboard

### 🎯 Core Features

1. **Multi-Currency Support** (EUR primary, SYP secondary)
2. **Advanced Distribution Management**
3. **Real-Time Tracking & Maps Integration**
4. **Smart Inventory Management**
5. **Comprehensive Payment System**
6. **Automated Gift Calculations**
7. **Multi-Level Reporting**
8. **Mobile App Integration**

---

## 🔐 Authentication & User Management

### Base URL: `/api/auth`

| Method | Endpoint           | Description          | Access  |
| ------ | ------------------ | -------------------- | ------- |
| POST   | `/register`        | Register new user    | Public  |
| POST   | `/login`           | User login           | Public  |
| POST   | `/refresh`         | Refresh access token | Public  |
| POST   | `/logout`          | User logout          | Private |
| GET    | `/me`              | Get current user     | Private |
| GET    | `/profile`         | Get user profile     | Private |
| PUT    | `/profile`         | Update user profile  | Private |
| POST   | `/change-password` | Change user password | Private |

### 🔑 Sample Login Request

```json
{
  "username": "admin@bakery.com",
  "password": "admin123"
}
```

### 🔑 Sample Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin@bakery.com",
      "full_name": "System Administrator",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🏪 Store Management

### Base URL: `/api/stores`

| Method | Endpoint      | Description                | Access        |
| ------ | ------------- | -------------------------- | ------------- |
| GET    | `/`           | Get all stores             | Private       |
| GET    | `/:id`        | Get single store           | Private       |
| POST   | `/`           | Create new store           | Manager/Admin |
| PUT    | `/:id`        | Update store               | Manager/Admin |
| DELETE | `/:id`        | Delete store               | Admin         |
| GET    | `/map`        | Get stores for map display | Private       |
| GET    | `/statistics` | Get store statistics       | Private       |
| GET    | `/nearby`     | Get nearby stores          | Private       |

### 🏪 Sample Store Data

```json
{
  "name": "Damascus Bakery Branch",
  "address": "Main Street, Damascus",
  "phone": "+963-11-123-4567",
  "email": "damascus@bakery.com",
  "payment_method": "mixed",
  "credit_limit": 1000.0,
  "latitude": 33.5138,
  "longitude": 36.2765,
  "is_active": true
}
```

---

## 📦 Product Management

### Base URL: `/api/products`

| Method | Endpoint             | Description            | Access  |
| ------ | -------------------- | ---------------------- | ------- |
| GET    | `/`                  | Get all products       | Private |
| GET    | `/:id`               | Get single product     | Private |
| POST   | `/`                  | Create new product     | Private |
| PUT    | `/:id`               | Update product         | Private |
| DELETE | `/:id`               | Delete product         | Private |
| GET    | `/stats`             | Get product statistics | Private |
| GET    | `/search`            | Search products        | Private |
| PATCH  | `/:id/toggle-status` | Toggle product status  | Private |

### 📦 Sample Product Data

```json
{
  "name": "Fresh Bread",
  "description": "Daily fresh bread",
  "price_eur": 1.5,
  "price_syp": 3750,
  "cost_eur": 1.0,
  "cost_syp": 2500,
  "unit": "piece",
  "category": "bakery",
  "is_active": true
}
```

---

## 📋 Order Management

### Base URL: `/api/orders`

| Method | Endpoint              | Description                 | Access        |
| ------ | --------------------- | --------------------------- | ------------- |
| GET    | `/`                   | Get all orders with filters | Private       |
| GET    | `/:id`                | Get single order            | Private       |
| POST   | `/`                   | Create new order            | Private       |
| PUT    | `/:id`                | Update order                | Private       |
| DELETE | `/:id`                | Delete order                | Private       |
| PATCH  | `/:id/status`         | Update order status         | Private       |
| PATCH  | `/:id/payment-status` | Update payment status       | Manager/Admin |
| GET    | `/export`             | Export orders to CSV        | Private       |

### 📋 Sample Order Creation

```json
{
  "store_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 100
    },
    {
      "product_id": 2,
      "quantity": 50
    }
  ],
  "priority": "high",
  "scheduled_delivery_date": "2024-12-22",
  "notes": "Urgent delivery needed"
}
```

### 📊 Order Status Flow

```
DRAFT → CONFIRMED → IN_PROGRESS → DELIVERED
         ↓             ↓
     CANCELLED     CANCELLED
```

---

## 💰 Payment Management

### Base URL: `/api/payments`

| Method | Endpoint      | Description            | Access  |
| ------ | ------------- | ---------------------- | ------- |
| GET    | `/`           | Get all payments       | Private |
| GET    | `/:id`        | Get single payment     | Private |
| POST   | `/`           | Create new payment     | Private |
| PUT    | `/:id`        | Update payment         | Private |
| DELETE | `/:id`        | Delete payment         | Private |
| PATCH  | `/:id/status` | Update payment status  | Private |
| GET    | `/statistics` | Get payment statistics | Private |
| GET    | `/export`     | Export payments        | Private |

### 💰 Sample Payment Data

```json
{
  "order_id": 1,
  "store_id": 1,
  "amount_eur": 150.0,
  "amount_syp": 375000,
  "currency": "EUR",
  "payment_method": "mixed",
  "payment_type": "current_order",
  "bank_details": {
    "account_number": "123456789",
    "bank_name": "Central Bank"
  },
  "notes": "Partial payment received"
}
```

---

## 🚚 Distribution Management

### Base URL: `/api/distribution`

## 🔷 Distributor Routes (Mobile App)

| Method | Endpoint                           | Description                     | Access      |
| ------ | ---------------------------------- | ------------------------------- | ----------- |
| GET    | `/schedule/daily`                  | Get daily distribution schedule | Distributor |
| GET    | `/store/:storeId/details`          | Get store delivery details      | Distributor |
| PATCH  | `/delivery/:deliveryId/quantities` | Update delivery quantities      | Distributor |
| POST   | `/delivery/:deliveryId/complete`   | Complete delivery               | Distributor |
| POST   | `/payment/record`                  | Record payment from store       | Distributor |
| GET    | `/vehicle/inventory`               | Get vehicle inventory           | Distributor |
| POST   | `/expense/record`                  | Record vehicle expense          | Distributor |
| POST   | `/report/daily/submit`             | Submit daily report             | Distributor |
| GET    | `/history`                         | Get distributor history         | Distributor |

## 🔷 Manager Routes (Dashboard)

| Method | Endpoint                             | Description                     | Access        |
| ------ | ------------------------------------ | ------------------------------- | ------------- |
| GET    | `/manager/orders/daily`              | Get daily orders for processing | Manager/Admin |
| POST   | `/manager/orders/add`                | Add manual order                | Manager/Admin |
| POST   | `/manager/schedules/generate`        | Generate distribution schedules | Manager/Admin |
| GET    | `/manager/tracking/live`             | Real-time distribution tracking | Manager/Admin |
| GET    | `/manager/performance`               | Get distributor performance     | Manager/Admin |
| GET    | `/manager/analytics`                 | Get advanced analytics          | Manager/Admin |
| POST   | `/manager/reports/weekly`            | Generate weekly report          | Manager/Admin |
| PATCH  | `/manager/stores/assign`             | Assign store to distributor     | Manager/Admin |
| PATCH  | `/manager/stores/:storeId/balance`   | Update store balance            | Manager/Admin |
| PATCH  | `/manager/reports/:reportId/approve` | Approve distributor report      | Manager/Admin |

### 🚚 Sample Daily Schedule Response

```json
{
  "success": true,
  "data": {
    "schedule_id": 1,
    "date": "2024-12-22",
    "distributor_id": 2,
    "status": "active",
    "total_stops": 8,
    "estimated_duration": "6 hours",
    "optimized_route": true,
    "stores": [
      {
        "store_id": 1,
        "name": "Damascus Bakery",
        "address": "Main Street, Damascus",
        "priority": "high",
        "delivery_window": "09:00-10:00",
        "orders": [
          {
            "order_id": 1,
            "items": [
              {
                "product_id": 1,
                "name": "Fresh Bread",
                "quantity": 100,
                "unit": "piece"
              }
            ],
            "total_amount_eur": 150.0,
            "gifts": {
              "bread": 10,
              "pastry": 5
            }
          }
        ],
        "location": {
          "latitude": 33.5138,
          "longitude": 36.2765
        }
      }
    ]
  }
}
```

---

## 📊 Dashboard & Analytics

### Base URL: `/api/dashboard`

| Method | Endpoint          | Description                            | Access        |
| ------ | ----------------- | -------------------------------------- | ------------- |
| GET    | `/stats`          | Get comprehensive dashboard statistics | Manager/Admin |
| GET    | `/overview`       | Get daily overview                     | Manager/Admin |
| GET    | `/sales`          | Get sales metrics                      | Manager/Admin |
| GET    | `/distribution`   | Get distribution metrics               | Manager/Admin |
| GET    | `/payments`       | Get payment metrics                    | Manager/Admin |
| GET    | `/top-performers` | Get top performers                     | Manager/Admin |
| GET    | `/health`         | Get system health                      | Manager/Admin |

### 📊 Sample Dashboard Stats

```json
{
  "success": true,
  "data": {
    "today": {
      "orders": {
        "total": 45,
        "pending": 12,
        "in_progress": 8,
        "delivered": 25
      },
      "revenue": {
        "total_eur": 2500.0,
        "total_syp": 6250000,
        "growth_percentage": 15.5
      },
      "distribution": {
        "active_distributors": 5,
        "completed_deliveries": 25,
        "completion_rate": 89.3
      }
    },
    "monthly": {
      "revenue_eur": 75000.0,
      "revenue_syp": 187500000,
      "total_orders": 1200,
      "customer_satisfaction": 94.5
    }
  }
}
```

---

## 🔔 Notifications

### Base URL: `/api/notifications`

| Method | Endpoint          | Description                    | Access        |
| ------ | ----------------- | ------------------------------ | ------------- |
| GET    | `/`               | Get user notifications         | Private       |
| POST   | `/`               | Create notification            | Manager/Admin |
| POST   | `/bulk`           | Send bulk notification         | Manager/Admin |
| PUT    | `/:id/read`       | Mark notification as read      | Private       |
| PUT    | `/read-all`       | Mark all notifications as read | Private       |
| DELETE | `/:id`            | Delete notification            | Private       |
| POST   | `/order`          | Send order notification        | Distributor+  |
| POST   | `/payment`        | Send payment notification      | Distributor+  |
| POST   | `/distribution`   | Send distribution notification | Manager/Admin |
| POST   | `/system`         | Send system notification       | Admin         |
| GET    | `/stats`          | Get notification statistics    | Manager/Admin |
| DELETE | `/cleanup`        | Clean up old notifications     | Admin         |
| POST   | `/send-scheduled` | Send scheduled notifications   | Admin         |

---

## 📈 Reports & Analytics

### Base URL: `/api/reports`

| Method | Endpoint      | Description                | Access       |
| ------ | ------------- | -------------------------- | ------------ |
| GET    | `/daily`      | Get daily reports          | Distributor+ |
| POST   | `/daily`      | Create daily report        | Distributor+ |
| PUT    | `/daily/:id`  | Update daily report        | Distributor+ |
| GET    | `/statistics` | Get distributor statistics | Distributor+ |

---

## 🔧 System Endpoints

### Base URL: `/api`

| Method | Endpoint  | Description         | Access |
| ------ | --------- | ------------------- | ------ |
| GET    | `/`       | API documentation   | Public |
| GET    | `/health` | System health check | Public |
| GET    | `/status` | System status       | Public |

---

## 📱 Mobile App Integration

### Key Features for Flutter App:

1. **Daily Schedule Management**
2. **Real-Time Inventory Tracking**
3. **Payment Collection**
4. **GPS Navigation**
5. **Digital Signature**
6. **Photo Upload for Receipts**
7. **Offline Mode Support**

### 📱 Sample Mobile Workflow:

#### 1. Login

```http
POST /api/auth/login
```

#### 2. Get Daily Schedule

```http
GET /api/distribution/schedule/daily?date=2024-12-22
```

#### 3. Start Delivery

```http
GET /api/distribution/store/1/details
```

#### 4. Complete Delivery

```http
POST /api/distribution/delivery/1/complete
```

#### 5. Record Payment

```http
POST /api/distribution/payment/record
```

#### 6. Submit Daily Report

```http
POST /api/distribution/report/daily/submit
```

---

## 🎯 Common Query Parameters

### Pagination

```
?page=1&limit=10
```

### Date Filtering

```
?date_from=2024-12-01&date_to=2024-12-31
```

### Search

```
?search=damascus
```

### Status Filtering

```
?status=pending&payment_status=paid
```

### Currency Selection

```
?currency=EUR
```

---

## 🛡️ Security Features

1. **JWT Authentication**
2. **Role-Based Access Control**
3. **Input Validation**
4. **Rate Limiting**
5. **SQL Injection Prevention**
6. **XSS Protection**
7. **CORS Configuration**

---

## 🔄 Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)",
  "errors": [] // Validation errors
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

---

## 🌟 Advanced Features

### 1. Multi-Currency Support

- Primary currency: EUR
- Secondary currency: SYP
- Automatic conversion
- Dual pricing display

### 2. Smart Gift Calculations

- Automatic gift calculation based on order value
- Configurable gift policies
- Real-time inventory updates

### 3. Route Optimization

- Google Maps integration
- Automatic route optimization
- Real-time traffic updates
- ETA calculations

### 4. Inventory Tracking

- Real-time vehicle inventory
- Automatic updates on delivery
- Damage tracking
- Stock alerts

### 5. Payment Flexibility

- Multiple payment methods (cash, bank, mixed)
- Partial payments
- Debt management
- Credit limits

---

## 🚀 Getting Started

### 1. Authentication

```bash
# Login to get access token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@bakery.com", "password": "admin123"}'
```

### 2. Use the Token

```bash
# Use token in subsequent requests
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Test Endpoints

```bash
# Test system health
curl -X GET http://localhost:3000/api/health
```

---

## 📞 Support

For technical support or questions about the API:

- **Documentation**: Full API documentation available at `/api/`
- **Health Check**: Monitor system status at `/api/health`
- **System Status**: Check service availability at `/api/status`

---

_Last Updated: December 2024_
_Version: 2.0.0_
_Environment: Production Ready_
