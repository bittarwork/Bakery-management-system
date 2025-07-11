# صفحة إدارة المدفوعات

## نظرة عامة

صفحة إدارة المدفوعات هي واجهة شاملة لإدارة جميع عمليات الدفع في النظام، بما في ذلك تسجيل الدفعات الجديدة، متابعة المدفوعات المعلقة، وعرض الإحصائيات التفصيلية.

## الميزات الرئيسية

### 1. لوحة المعلومات (Dashboard)

- **إحصائيات شاملة**: عرض إجمالي المدفوعات، المدفوعات المعلقة، والمتأخرة
- **رسوم بيانية**: توزيع المدفوعات حسب الحالة وطريقة الدفع
- **مؤشرات الأداء**: متوسط الدفعات والاتجاهات الزمنية

### 2. إدارة المدفوعات

- **عرض المدفوعات**: قائمة شاملة مع إمكانية التصفية والبحث
- **إضافة دفعة جديدة**: نموذج شامل لتسجيل الدفعات
- **تعديل الدفعات**: تحديث معلومات الدفعات الموجودة
- **حذف الدفعات**: إزالة الدفعات مع تأكيد

### 3. خصائص الدفع

- **طرق الدفع**:
  - نقدي (Cash)
  - بنكي (Bank)
  - مختلط (Mixed)
- **حالات الدفع**:
  - معلق (Pending)
  - جزئي (Partial)
  - مدفوع (Paid)
  - متأخر (Overdue)
- **أنواع الدفع**:
  - دفعة كاملة (Full)
  - دفعة جزئية (Partial)
  - استرداد (Refund)

### 4. الفلترة والبحث

- **فلترة حسب المتجر**: اختيار متجر محدد
- **فلترة حسب الحالة**: تصفية حسب حالة الدفع
- **فلترة حسب التاريخ**: نطاق زمني محدد
- **فلترة حسب المبلغ**: نطاق مالي محدد
- **البحث النصي**: البحث في رقم الدفعة أو الملاحظات

### 5. التقارير والتصدير

- **تقارير تفصيلية**: إحصائيات شاملة للمدفوعات
- **تصدير البيانات**: تصدير إلى Excel أو PDF
- **تقارير مخصصة**: حسب الفلاتر المطبقة

## المكونات

### Frontend Components

#### 1. PaymentCard

```jsx
// عرض بطاقة الدفعة مع المعلومات الأساسية
<PaymentCard
  payment={payment}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onStatusChange={handleStatusChange}
/>
```

#### 2. PaymentModal

```jsx
// نافذة إضافة/تعديل الدفعة
<PaymentModal
  isOpen={showModal}
  onClose={handleClose}
  payment={selectedPayment}
  stores={stores}
  orders={orders}
  onSubmit={handleSubmit}
/>
```

#### 3. PaymentFilters

```jsx
// فلاتر البحث والتصفية
<PaymentFilters
  filters={filters}
  onFilterChange={handleFilterChange}
  onClearFilters={clearFilters}
  stores={stores}
/>
```

#### 4. PaymentStatistics

```jsx
// عرض الإحصائيات
<PaymentStatistics statistics={statistics} period="month" />
```

### Backend Models

#### Payment Model

```javascript
const Payment = sequelize.define("Payment", {
  id: DataTypes.INTEGER,
  store_id: DataTypes.INTEGER,
  order_id: DataTypes.INTEGER,
  amount: DataTypes.DECIMAL(10, 2),
  payment_method: DataTypes.ENUM("cash", "bank", "mixed"),
  payment_type: DataTypes.ENUM("full", "partial", "refund"),
  payment_date: DataTypes.DATEONLY,
  status: DataTypes.ENUM("pending", "partial", "paid", "overdue"),
  reference_number: DataTypes.STRING(100),
  notes: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
});
```

## API Endpoints

### GET /api/payments

الحصول على قائمة المدفوعات مع الفلترة والتصفح

**Query Parameters:**

- `page`: رقم الصفحة
- `limit`: عدد العناصر في الصفحة
- `search`: نص البحث
- `store_id`: معرف المتجر
- `status`: حالة الدفع
- `payment_method`: طريقة الدفع
- `date_from`: تاريخ البداية
- `date_to`: تاريخ النهاية
- `amount_from`: المبلغ الأدنى
- `amount_to`: المبلغ الأقصى

### GET /api/payments/statistics

الحصول على إحصائيات المدفوعات

**Query Parameters:**

- `period`: الفترة (today, week, month, year)

### POST /api/payments

إنشاء دفعة جديدة

**Body:**

```json
{
  "store_id": 1,
  "order_id": 1,
  "amount": 1000.0,
  "payment_method": "cash",
  "payment_type": "full",
  "payment_date": "2024-01-15",
  "status": "pending",
  "reference_number": "REF001",
  "notes": "دفعة نقدية"
}
```

### PUT /api/payments/:id

تحديث دفعة موجودة

### DELETE /api/payments/:id

حذف دفعة

### PATCH /api/payments/:id/status

تحديث حالة الدفع

### GET /api/payments/export

تصدير المدفوعات

## قاعدة البيانات

### جدول payments

```sql
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    order_id INT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'bank', 'mixed') DEFAULT 'cash',
    payment_type ENUM('full', 'partial', 'refund') DEFAULT 'full',
    payment_date DATE NOT NULL,
    status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    reference_number VARCHAR(100) NULL,
    notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## العلاقات

- **Payment → Store**: كل دفعة تنتمي لمتجر واحد
- **Payment → Order**: كل دفعة يمكن أن ترتبط بطلب واحد (اختياري)
- **Payment → User**: كل دفعة تم إنشاؤها بواسطة مستخدم واحد

## الأمان والصلاحيات

- جميع العمليات تتطلب مصادقة المستخدم
- التحقق من صحة البيانات المدخلة
- حماية من SQL Injection
- التحقق من وجود المتجر والطلب قبل إنشاء الدفعة

## الاستخدام

### إضافة دفعة جديدة

1. انقر على زر "إضافة دفعة"
2. اختر المتجر من القائمة
3. أدخل المبلغ وتاريخ الدفع
4. اختر طريقة الدفع ونوع الدفع
5. أضف ملاحظات إذا لزم الأمر
6. انقر على "إضافة الدفعة"

### تعديل دفعة

1. انقر على أيقونة التعديل في بطاقة الدفعة
2. قم بتعديل المعلومات المطلوبة
3. انقر على "تحديث الدفعة"

### تصفية المدفوعات

1. استخدم فلاتر البحث في أعلى الصفحة
2. اختر المعايير المطلوبة
3. انقر على "تطبيق الفلاتر"

### تصدير البيانات

1. انقر على زر "تصدير"
2. اختر صيغة التصدير (Excel/PDF)
3. سيتم تحميل الملف تلقائياً

## التطوير المستقبلي

- [ ] إضافة رسوم بيانية تفاعلية
- [ ] دعم المدفوعات المتعددة العملات
- [ ] إضافة نظام تنبيهات للمدفوعات المتأخرة
- [ ] دعم المدفوعات الإلكترونية
- [ ] إضافة تقارير مخصصة
- [ ] دعم المدفوعات المجدولة
