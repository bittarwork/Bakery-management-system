# Mobile App API Documentation

## نظرة عامة

هذا الدليل يوضح API endpoints المطلوبة لتطبيق Flutter للموزعين.

## Base URL

```
http://localhost:5001/api
```

## المصادقة

جميع الطلبات تتطلب مصادقة JWT في header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. المصادقة

#### تسجيل الدخول

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "distributor1",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 3,
      "username": "distributor1",
      "full_name": "محمد علي",
      "role": "distributor",
      "email": "dist1@bakery.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

#### تحديث التوكن

```http
POST /api/auth/refresh
```

### 2. جداول التوزيع

#### الحصول على جداول التوزيع

```http
GET /api/distribution?date=2024-01-15&status=active
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "schedule_date": "2024-01-15",
      "distributor_id": 3,
      "vehicle_id": 1,
      "total_stores": 5,
      "status": "active",
      "route_data": {
        "route": [
          {
            "store_id": 1,
            "order": 1,
            "estimated_time": "08:00"
          }
        ]
      }
    }
  ],
  "message": "تم جلب جداول التوزيع بنجاح"
}
```

#### الحصول على جدول توزيع محدد

```http
GET /api/distribution/1
```

#### تحديث حالة جدول التوزيع

```http
PATCH /api/distribution/1/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

#### تحديث حالة تسليم عنصر

```http
PATCH /api/distribution/1/items/1
Content-Type: application/json

{
  "delivered_quantity": 18,
  "delivery_status": "completed",
  "notes": "تم التسليم بنجاح"
}
```

### 3. التقارير

#### الحصول على التقارير اليومية

```http
GET /api/reports/daily?date=2024-01-15
```

#### إنشاء تقرير يومي جديد

```http
POST /api/reports/daily
Content-Type: application/json

{
  "report_date": "2024-01-15",
  "schedule_id": 1,
  "total_stores_visited": 5,
  "total_amount_delivered": 250.00,
  "total_amount_collected": 245.50,
  "total_gifts_given": 15.00,
  "vehicle_expenses": 45.50,
  "notes": "تقرير يومي عادي",
  "expenses": [
    {
      "type": "fuel",
      "amount": 45.50,
      "description": "تعبئة ديزل"
    }
  ]
}
```

#### الحصول على الإحصائيات

```http
GET /api/reports/statistics?date_from=2024-01-01&date_to=2024-01-31
```

### 4. الموقع والتتبع

#### تحديث موقع الموزع

```http
POST /api/notifications/location
Content-Type: application/json

{
  "latitude": 50.8503,
  "longitude": 4.3517,
  "accuracy": 10,
  "timestamp": "2024-01-15T08:30:00Z"
}
```

### 5. الإشعارات

#### الحصول على إشعارات الموزع

```http
GET /api/notifications/distributor?limit=20&unread_only=true
```

#### تحديث حالة قراءة الإشعار

```http
PATCH /api/notifications/1/read
```

### 6. الطلبات

#### الحصول على طلبات الموزع

```http
GET /api/orders?distributor_id=3&date=2024-01-15&status=confirmed
```

#### تحديث حالة الطلب

```http
PATCH /api/orders/1/status
Content-Type: application/json

{
  "status": "delivered",
  "delivery_notes": "تم التسليم بنجاح"
}
```

### 7. المدفوعات

#### تسجيل دفعة جديدة

```http
POST /api/payments
Content-Type: application/json

{
  "order_id": 1,
  "amount": 45.50,
  "payment_method": "cash",
  "notes": "دفع نقدي"
}
```

## رموز الحالة

### حالات الطلبات

- `draft` - مسودة
- `confirmed` - مؤكد
- `in_progress` - قيد التنفيذ
- `delivered` - تم التسليم
- `cancelled` - ملغي

### حالات الدفع

- `pending` - في الانتظار
- `partial` - دفع جزئي
- `paid` - مدفوع
- `overdue` - متأخر

### حالات التوزيع

- `draft` - مسودة
- `active` - نشط
- `in_progress` - قيد التنفيذ
- `completed` - مكتمل
- `cancelled` - ملغي

## معالجة الأخطاء

جميع الاستجابات تحتوي على حقل `success`:

```json
{
  "success": false,
  "message": "رسالة الخطأ",
  "error": "تفاصيل الخطأ (في بيئة التطوير فقط)"
}
```

## رموز HTTP

- `200` - نجح الطلب
- `201` - تم الإنشاء بنجاح
- `400` - بيانات غير صحيحة
- `401` - غير مصرح (تحتاج مصادقة)
- `403` - محظور (لا تملك الصلاحية)
- `404` - غير موجود
- `500` - خطأ في الخادم

## نصائح للاستخدام

1. **التخزين المؤقت**: قم بتخزين البيانات محلياً لتقليل الطلبات
2. **المزامنة**: راجع البيانات مع الخادم بشكل دوري
3. **معالجة الأخطاء**: تعامل مع أخطاء الشبكة بشكل مناسب
4. **التحديثات**: استخدم WebSocket للإشعارات الفورية (قريباً)

## أمثلة Flutter

### تسجيل الدخول

```dart
Future<Map<String, dynamic>> login(String username, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'username': username,
      'password': password,
    }),
  );

  return jsonDecode(response.body);
}
```

### جلب جداول التوزيع

```dart
Future<List<DistributionSchedule>> getDistributionSchedules() async {
  final response = await http.get(
    Uri.parse('$baseUrl/distribution'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );

  final data = jsonDecode(response.body);
  return (data['data'] as List)
      .map((json) => DistributionSchedule.fromJson(json))
      .toList();
}
```
