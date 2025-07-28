# Simple Order Management System

## Overview
A simplified order management system that focuses on the core functionality without complex features like smart distribution, automatic pricing, or advanced scheduling.

## System Architecture

### Core Models

#### Order Model
- **id**: Primary key
- **order_number**: Unique order identifier (auto-generated)
- **store_id**: Reference to store
- **store_name**: Store name for quick access
- **order_date**: Order creation date
- **delivery_date**: Expected delivery date (optional)
- **total_amount_eur**: Total amount in EUR
- **total_amount_syp**: Total amount in SYP
- **final_amount_eur**: Final amount in EUR (based on currency)
- **final_amount_syp**: Final amount in SYP (based on currency)
- **currency**: Order currency (EUR or SYP)
- **status**: Order status (draft, confirmed, in_progress, delivered, cancelled)
- **payment_status**: Payment status (pending, paid)
- **notes**: Order notes
- **created_by**: User who created the order
- **created_by_name**: Creator's name
- **assigned_distributor_id**: Manually assigned distributor (optional)

#### OrderItem Model (Simplified)
- **id**: Primary key
- **order_id**: Reference to order
- **product_id**: Reference to product
- **product_name**: Product name
- **product_unit**: Product unit
- **quantity**: Ordered quantity
- **unit_price_eur**: Unit price in EUR
- **unit_price_syp**: Unit price in SYP
- **total_price_eur**: Total price in EUR
- **total_price_syp**: Total price in SYP
- **notes**: Item notes

### Order Status Flow

```
Draft → Confirmed → In Progress → Delivered
  ↓         ↓           ↓
Cancelled ← Cancelled ← Cancelled
```

### Payment Status
- **Pending**: Payment not received
- **Paid**: Payment completed

## API Endpoints

### Core Order Operations
- `GET /api/orders` - Get all orders with filtering
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order (draft only)
- `DELETE /api/orders/:id` - Delete order (draft only)

### Status Management
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/payment-status` - Update payment status

### Manual Distributor Assignment
- `POST /api/orders/:id/assign-distributor` - Assign distributor manually
- `DELETE /api/orders/:id/assign-distributor` - Remove distributor assignment

### Reports and Analytics
- `GET /api/orders/today` - Get today's orders
- `GET /api/orders/statistics` - Get order statistics
- `GET /api/orders/distributor/:distributorId` - Get distributor's orders
- `GET /api/orders/export` - Export orders to CSV

## User Permissions

### Admin/Manager
- Full access to all orders
- Can assign/unassign distributors
- Can update all order statuses
- Can update payment statuses

### Distributor
- Can view only assigned orders
- Can update status of assigned orders
- Can update payment status of assigned orders

### Regular Users
- Can view only their created orders
- Can edit only draft orders they created

## Key Features Removed

### Complex Features Eliminated
- ❌ Smart distribution system
- ❌ Automatic distributor assignment
- ❌ Dynamic pricing
- ❌ Advanced scheduling
- ❌ Complex discount system
- ❌ Gift management
- ❌ Advanced delivery tracking
- ❌ Distribution trips
- ❌ Store visits tracking
- ❌ Advanced analytics

### Simplified Features
- ✅ Manual distributor assignment
- ✅ Simple order statuses
- ✅ Basic payment tracking
- ✅ Dual currency support (EUR/SYP)
- ✅ Simple pricing (product price × quantity)
- ✅ Basic order management

## Usage Examples

### Creating an Order
```javascript
POST /api/orders
{
  "store_id": 1,
  "currency": "EUR",
  "delivery_date": "2024-12-15",
  "items": [
    {
      "product_id": 1,
      "quantity": 10,
      "notes": "Extra packaging required"
    }
  ],
  "notes": "Urgent delivery required"
}
```

### Assigning Distributor
```javascript
POST /api/orders/123/assign-distributor
{
  "distributor_id": 5
}
```

### Updating Order Status
```javascript
PATCH /api/orders/123/status
{
  "status": "in_progress"
}
```

## Database Changes

### Removed Tables/Fields
- Enhanced distribution tables
- Complex scheduling tables
- Advanced tracking tables
- Gift and discount fields
- Priority and scheduling fields

### Simplified Structure
- Focused on core order management
- Simple associations
- Essential fields only
- Manual processes preferred

## Migration Path

1. ✅ Removed complex distribution services
2. ✅ Simplified Order model
3. ✅ Simplified OrderItem model  
4. ✅ Updated OrderController
5. ✅ Simplified model associations
6. ✅ Updated constants and routes

## Next Steps

For future distribution management:
- Create separate distribution management page
- Build simple trip planning interface
- Add basic distributor workload tracking
- Implement simple route optimization

This system prioritizes simplicity and manual control over automation and complexity. 