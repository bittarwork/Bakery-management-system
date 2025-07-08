# 📋 دليل Order Management API

نظام إدارة الطلبات الشامل للمخبز البلجيكي - يدعم إنشاء وإدارة الطلبات اليومية مع تتبع دقيق للمنتجات والهدايا والمدفوعات.

## 🎯 المميزات الأساسية

- ✅ **إنشاء طلبات يومية** مع تفاصيل المنتجات والكميات
- ✅ **إدارة الهدايا** مع تتبع السبب والكمية
- ✅ **نظام خصومات** مرن على مستوى الطلب والمنتج
- ✅ **تتبع حالات الطلبات** (مسودة، مؤكد، قيد التنفيذ، مُسلم، ملغي)
- ✅ **إدارة حالات الدفع** (معلق، جزئي، مدفوع، متأخر)
- ✅ **إحصائيات شاملة** يومية وأسبوعية
- ✅ **تصفية وبحث متقدم** في الطلبات

## 🚀 البدء السريع

### 1. تشغيل الخادم

```bash
cd backend
npm install
npm run dev
```

### 2. تطبيق قاعدة البيانات

```bash
# تشغيل MySQL
docker-compose up -d mysql

# تطبيق ملف إنشاء الجداول
mysql -u root -p bakery_db < ../database/add_orders_tables.sql
```

### 3. اختبار الـ API

```bash
# تشغيل ملف الاختبار
node test_orders_api.js
```

## 📡 API Endpoints

### Authentication

جميع endpoints تتطلب authentication header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### 📋 الطلبات الأساسية

#### الحصول على جميع الطلبات

```http
GET /api/orders
```

**Query Parameters:**

- `page` (int): رقم الصفحة (افتراضي: 1)
- `limit` (int): عدد العناصر لكل صفحة (افتراضي: 10)
- `store_id` (int): تصفية حسب المتجر
- `date_from` (date): تاريخ البداية (YYYY-MM-DD)
- `date_to` (date): تاريخ النهاية (YYYY-MM-DD)
- `status` (string): تصفية حسب الحالة
- `payment_status` (string): تصفية حسب حالة الدفع
- `search` (string): البحث في رقم الطلب أو الملاحظات

**مثال:**

```http
GET /api/orders?page=1&limit=10&store_id=1&status=delivered
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "ORD2401010015628",
        "store_id": 1,
        "order_date": "2024-01-01",
        "delivery_date": "2024-01-02",
        "total_amount": "45.00",
        "discount_amount": "0.00",
        "final_amount": "45.00",
        "status": "delivered",
        "payment_status": "paid",
        "notes": "طلب منتظم",
        "store": {
          "id": 1,
          "name": "متجر أبو أحمد",
          "phone": "+32123456789"
        },
        "items": [
          {
            "id": 1,
            "product_id": 1,
            "quantity": 15,
            "unit_price": "1.50",
            "total_price": "22.50",
            "final_price": "22.50",
            "gift_quantity": 2,
            "gift_reason": "هدية وفاء",
            "product": {
              "id": 1,
              "name": "خبز أبيض",
              "unit": "piece"
            }
          }
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 45,
      "items_per_page": 10
    },
    "statistics": {
      "total_orders": 45,
      "total_amount": 2856.75
    }
  },
  "message": "تم جلب الطلبات بنجاح"
}
```

#### الحصول على طلب واحد

```http
GET /api/orders/:id
```

#### إنشاء طلب جديد

```http
POST /api/orders
```

**Request Body:**

```json
{
  "store_id": 1,
  "order_date": "2024-01-15",
  "delivery_date": "2024-01-16",
  "items": [
    {
      "product_id": 1,
      "quantity": 20,
      "unit_price": 1.5,
      "discount_amount": 0,
      "gift_quantity": 3,
      "gift_reason": "عميل مميز",
      "notes": "خبز طازج"
    },
    {
      "product_id": 2,
      "quantity": 15,
      "unit_price": 1.75,
      "discount_amount": 2.5,
      "gift_quantity": 1,
      "gift_reason": "هدية"
    }
  ],
  "discount_amount": 5.0,
  "notes": "طلب خاص للعميل المميز"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 46,
    "order_number": "ORD2401150015628",
    "final_amount": "50.75",
    "status": "draft",
    "payment_status": "pending"
  },
  "message": "تم إنشاء الطلب بنجاح"
}
```

#### تحديث طلب

```http
PUT /api/orders/:id
```

#### حذف طلب

```http
DELETE /api/orders/:id
```

### 🔄 إدارة حالات الطلبات

#### تحديث حالة الطلب

```http
PATCH /api/orders/:id/status
```

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**حالات الطلبات المتاحة:**

- `draft` - مسودة
- `confirmed` - مؤكد
- `in_progress` - قيد التنفيذ
- `delivered` - مُسلم
- `cancelled` - ملغي

#### تحديث حالة الدفع

```http
PATCH /api/orders/:id/payment-status
```

**Request Body:**

```json
{
  "payment_status": "paid"
}
```

**حالات الدفع المتاحة:**

- `pending` - معلق
- `partial` - جزئي
- `paid` - مدفوع
- `overdue` - متأخر

### 📅 طلبات اليوم والإحصائيات

#### الحصول على طلبات اليوم

```http
GET /api/orders/today
```

**Response:**

```json
{
    "success": true,
    "data": {
        "orders": [...],
        "statistics": {
            "total_orders": 12,
            "total_amount": 456.75,
            "by_status": {
                "draft": 3,
                "confirmed": 5,
                "in_progress": 2,
                "delivered": 2,
                "cancelled": 0
            }
        }
    },
    "message": "تم جلب طلبات اليوم بنجاح"
}
```

#### الحصول على إحصائيات الطلبات

```http
GET /api/orders/statistics
```

**Query Parameters:**

- `date_from` (date): تاريخ البداية (افتراضي: آخر 30 يوم)
- `date_to` (date): تاريخ النهاية (افتراضي: اليوم)

**Response:**

```json
{
  "success": true,
  "data": {
    "overall": {
      "total_orders": 156,
      "total_amount": 8945.25,
      "avg_amount": 57.34
    },
    "daily_totals": [
      {
        "date": "2024-01-15",
        "total_orders": 12,
        "total_amount": 456.75
      }
    ],
    "status_distribution": {
      "delivered": {
        "count": 120,
        "amount": 7234.5
      },
      "confirmed": {
        "count": 25,
        "amount": 1456.75
      }
    },
    "date_range": {
      "from": "2023-12-16",
      "to": "2024-01-15"
    }
  },
  "message": "تم جلب إحصائيات الطلبات بنجاح"
}
```

## 💾 هيكل قاعدة البيانات

### جدول orders

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('draft', 'confirmed', 'in_progress', 'delivered', 'cancelled'),
    payment_status ENUM('pending', 'partial', 'paid', 'overdue'),
    gift_applied JSON NULL,
    notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### جدول order_items

```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_price DECIMAL(10,2) NOT NULL,
    gift_quantity INT DEFAULT 0,
    gift_reason VARCHAR(100) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🧪 اختبار الـ API

### اختبار تلقائي

```bash
node test_orders_api.js
```

### اختبار يدوي باستخدام cURL

#### 1. تسجيل الدخول

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bakery.com",
    "password": "admin123"
  }'
```

#### 2. إنشاء طلب جديد

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "store_id": 1,
    "items": [
      {
        "product_id": 1,
        "quantity": 10,
        "unit_price": 1.50,
        "gift_quantity": 2,
        "gift_reason": "عميل مميز"
      }
    ],
    "notes": "طلب تجريبي"
  }'
```

#### 3. جلب الطلبات

```bash
curl -X GET "http://localhost:3001/api/orders?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 أمثلة متقدمة

### تصفية الطلبات حسب المتجر والتاريخ

```http
GET /api/orders?store_id=1&date_from=2024-01-01&date_to=2024-01-15&status=delivered
```

### البحث في الطلبات

```http
GET /api/orders?search=ORD2401&page=1&limit=20
```

### إحصائيات أسبوعية

```http
GET /api/orders/statistics?date_from=2024-01-08&date_to=2024-01-14
```

## ⚠️ نصائح مهمة

### 1. إدارة الهدايا

- استخدم `gift_quantity` لتحديد كمية الهدايا
- أضف `gift_reason` لتوضيح سبب الهدية
- الهدايا لا تؤثر على السعر النهائي

### 2. نظام الخصومات

- يمكن إضافة خصم على مستوى الطلب (`discount_amount`)
- يمكن إضافة خصم على مستوى المنتج (`items[].discount_amount`)
- يتم حساب السعر النهائي تلقائياً

### 3. حالات الطلبات

- `draft`: يمكن تعديلها وحذفها
- `confirmed`: يمكن تعديلها محدوداً
- `in_progress`: لا يمكن تعديلها
- `delivered`: مكتملة ولا يمكن تعديلها
- `cancelled`: ملغية

### 4. أرقام الطلبات

- تُنشأ تلقائياً بصيغة: `ORD{YY}{MM}{DD}{StoreID}{Timestamp}`
- مثال: `ORD2401150015628`

## 🚫 معالجة الأخطاء

### أخطاء التحقق

```json
{
  "success": false,
  "message": "بيانات غير صحيحة",
  "errors": [
    {
      "field": "store_id",
      "message": "معرف المتجر مطلوب"
    },
    {
      "field": "items",
      "message": "عناصر الطلب مطلوبة"
    }
  ]
}
```

### أخطاء المنطق

```json
{
  "success": false,
  "message": "لا يمكن تعديل هذا الطلب في الحالة الحالية"
}
```

### أخطاء الخادم

```json
{
  "success": false,
  "message": "خطأ في الخادم",
  "error": "Database connection failed"
}
```

## 📊 Views وإحصائيات جاهزة

### عرض ملخص الطلبات اليومية

```sql
SELECT * FROM daily_orders_summary WHERE order_date >= '2024-01-01';
```

### عرض أداء المتاجر

```sql
SELECT * FROM store_performance ORDER BY total_amount DESC;
```

### عرض المنتجات الأكثر طلباً

```sql
SELECT * FROM popular_products LIMIT 10;
```

## 🔧 Stored Procedures

### تحديث إجمالي الطلب

```sql
CALL UpdateOrderTotal(order_id);
```

### إحصائيات متجر معين

```sql
CALL GetStoreStatistics(store_id, date_from, date_to);
```

---

## 🎉 الخلاصة

نظام Order Management API يوفر حلاً شاملاً لإدارة طلبات المخبز اليومية مع:

- ✅ **سهولة الاستخدام** - API بسيط ومفهوم
- ✅ **مرونة عالية** - دعم للهدايا والخصومات المتقدمة
- ✅ **إحصائيات دقيقة** - تقارير شاملة لاتخاذ القرارات
- ✅ **أمان متقدم** - مصادقة والتحقق من البيانات
- ✅ **أداء محسن** - فهارس وتحسينات قاعدة البيانات

استخدم هذا الدليل كمرجع شامل لجميع عمليات إدارة الطلبات في نظام المخبز! 🍞✨
