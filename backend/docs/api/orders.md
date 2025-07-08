# Orders API Documentation

## Overview

This document describes the Orders API endpoints for the Bakery Distribution Management System.

## Base URL

```
/api/orders
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get All Orders

**GET** `/api/orders`

Get a paginated list of orders with optional filtering.

#### Query Parameters

| Parameter      | Type    | Required | Description                       | Default |
| -------------- | ------- | -------- | --------------------------------- | ------- |
| page           | integer | No       | Page number (min: 1)              | 1       |
| limit          | integer | No       | Items per page (min: 1, max: 100) | 10      |
| status         | string  | No       | Filter by order status            | -       |
| payment_status | string  | No       | Filter by payment status          | -       |
| store_id       | integer | No       | Filter by store ID                | -       |
| date_from      | string  | No       | Filter from date (ISO 8601)       | -       |
| date_to        | string  | No       | Filter to date (ISO 8601)         | -       |

#### Valid Status Values

- `draft` - مسودة
- `confirmed` - مؤكد
- `in_progress` - قيد التنفيذ
- `delivered` - تم التسليم
- `cancelled` - ملغي

#### Valid Payment Status Values

- `pending` - في الانتظار
- `partial` - دفع جزئي
- `paid` - مدفوع
- `overdue` - متأخر

#### Response

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "ORD240115001001",
        "order_date": "2024-01-15",
        "final_amount": 150.75,
        "status": "confirmed",
        "status_info": {
          "label": "مؤكد",
          "color": "blue",
          "icon": "✅"
        },
        "payment_status": "pending",
        "payment_status_info": {
          "label": "في الانتظار",
          "color": "gray",
          "icon": "⏳"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    },
    "filters": {
      "status": "confirmed"
    },
    "summary": {
      "total_orders": 10,
      "total_amount": 1507.5,
      "status_counts": {
        "confirmed": 8,
        "draft": 2
      },
      "payment_status_counts": {
        "pending": 6,
        "paid": 4
      }
    }
  }
}
```

### 2. Get Single Order

**GET** `/api/orders/:id`

Get detailed information about a specific order.

#### Path Parameters

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      | Order ID    |

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "ORD240115001001",
    "store_id": 1,
    "order_date": "2024-01-15",
    "delivery_date": "2024-01-20",
    "total_amount": 150.75,
    "discount_amount": 10.0,
    "final_amount": 140.75,
    "status": "confirmed",
    "payment_status": "pending",
    "gift_applied": null,
    "notes": "طلب عاجل",
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "status_info": {
      "label": "مؤكد",
      "color": "blue",
      "icon": "✅"
    },
    "payment_status_info": {
      "label": "في الانتظار",
      "color": "gray",
      "icon": "⏳"
    },
    "can_be_modified": true,
    "can_be_cancelled": true,
    "is_overdue": false,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "quantity": 3,
        "unit_price": 50.25,
        "total_price": 150.75,
        "discount_amount": 10.0,
        "final_price": 140.75,
        "gift_quantity": 0,
        "gift_reason": null,
        "total_quantity": 3,
        "has_gift": false,
        "discount_percentage": 6.63,
        "product": {
          "id": 1,
          "name": "خبز أبيض",
          "sku": "BREAD001",
          "unit": "رغيف"
        }
      }
    ],
    "items_count": 1,
    "total_quantity": 3,
    "store": {
      "id": 1,
      "name": "متجر الأمل",
      "address": "شارع الملك فهد",
      "phone": "+966501234567"
    },
    "creator": {
      "id": 1,
      "full_name": "أحمد محمد",
      "username": "ahmed"
    }
  }
}
```

### 3. Create New Order

**POST** `/api/orders`

Create a new order with optional items.

#### Request Body

```json
{
  "store_id": 1,
  "order_date": "2024-01-15",
  "delivery_date": "2024-01-20",
  "total_amount": 150.75,
  "discount_amount": 10.0,
  "notes": "طلب عاجل",
  "items": [
    {
      "product_id": 1,
      "quantity": 3,
      "unit_price": 50.25,
      "discount_amount": 10.0,
      "gift_quantity": 0,
      "gift_reason": null
    }
  ]
}
```

#### Validation Rules

- `store_id`: Required, positive integer
- `order_date`: Optional, valid ISO 8601 date
- `delivery_date`: Optional, valid ISO 8601 date, must be after order_date
- `total_amount`: Optional, non-negative number
- `discount_amount`: Optional, non-negative number
- `notes`: Optional, max 1000 characters
- `items`: Optional array
  - `product_id`: Required, positive integer
  - `quantity`: Required, positive integer
  - `unit_price`: Required, non-negative number
  - `discount_amount`: Optional, non-negative number
  - `gift_quantity`: Optional, non-negative integer
  - `gift_reason`: Optional, max 255 characters

#### Response

```json
{
  "success": true,
  "message": "تم إنشاء الطلب بنجاح",
  "data": {
    // Same structure as Get Single Order response
  }
}
```

### 4. Update Order Status

**PATCH** `/api/orders/:id/status`

Update the status of an existing order.

#### Path Parameters

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      | Order ID    |

#### Request Body

```json
{
  "status": "confirmed"
}
```

#### Validation Rules

- `status`: Required, must be one of the valid status values
- Order must be in a modifiable state (draft or confirmed) unless changing to cancelled

#### Response

```json
{
  "success": true,
  "message": "تم تحديث حالة الطلب بنجاح",
  "data": {
    // Order summary data
  }
}
```

### 5. Update Payment Status

**PATCH** `/api/orders/:id/payment-status`

Update the payment status of an existing order. (Admin/Manager only)

#### Path Parameters

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      | Order ID    |

#### Request Body

```json
{
  "payment_status": "paid"
}
```

#### Validation Rules

- `payment_status`: Required, must be one of the valid payment status values
- Only admin and manager roles can update payment status

#### Response

```json
{
  "success": true,
  "message": "تم تحديث حالة الدفع بنجاح",
  "data": {
    // Order summary data
  }
}
```

### 6. Delete Order

**DELETE** `/api/orders/:id`

Delete an existing order and its items.

#### Path Parameters

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      | Order ID    |

#### Validation Rules

- Order must be in a cancellable state (draft or confirmed)
- User must have permission to delete the order

#### Response

```json
{
  "success": true,
  "message": "تم حذف الطلب بنجاح"
}
```

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "بيانات غير صحيحة",
  "errors": [
    {
      "field": "store_id",
      "message": "معرف المتجر يجب أن يكون رقماً صحيحاً موجباً",
      "value": "invalid"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "غير مصرح"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "غير مصرح لك بعرض هذا الطلب"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "الطلب غير موجود"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "خطأ في الخادم",
  "error": "Detailed error message (development only)"
}
```

## Status Workflow

```
draft → confirmed → in_progress → delivered
  ↓         ↓
cancelled cancelled
```

## Payment Status Workflow

```
pending → partial → paid
    ↓
  overdue
```

## Permissions

| Role        | Get Orders | Get Order | Create | Update Status | Update Payment | Delete |
| ----------- | ---------- | --------- | ------ | ------------- | -------------- | ------ |
| Admin       | All        | All       | ✓      | ✓             | ✓              | ✓      |
| Manager     | All        | All       | ✓      | ✓             | ✓              | ✓      |
| Distributor | Own        | Own       | ✓      | Own           | ✗              | Own    |
| Assistant   | Own        | Own       | ✓      | Own           | ✗              | Own    |

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user

## Examples

### Get orders for a specific store

```bash
GET /api/orders?store_id=1&status=confirmed&page=1&limit=20
```

### Get orders within date range

```bash
GET /api/orders?date_from=2024-01-01&date_to=2024-01-31
```

### Create order with items

```bash
POST /api/orders
Content-Type: application/json

{
  "store_id": 1,
  "order_date": "2024-01-15",
  "items": [
    {
      "product_id": 1,
      "quantity": 5,
      "unit_price": 25.50
    },
    {
      "product_id": 2,
      "quantity": 3,
      "unit_price": 15.75,
      "gift_quantity": 1,
      "gift_reason": "عرض ترويجي"
    }
  ]
}
```
