# حل مشكلة إنشاء الطلبات (Order Creation Issue)

## المشكلة

كان هناك خطأ 500 (Internal Server Error) عند محاولة إنشاء طلب جديد في النظام.

## الأسباب المحددة

1. **عدم وجود دالة `generateOrderNumber`** في نموذج Order
2. **حقول مفقودة** في قاعدة البيانات (total_cost_eur, total_cost_syp, commission_eur, commission_syp, scheduled_delivery_date)
3. **تعارض في قيم الأولوية** (priority) بين 'medium' و 'normal'
4. **تحقق خاطئ** من `unit_price` في validators
5. **حقول مفقودة** في إنشاء الطلبات (store_name, final_price_eur, final_price_syp)

## الحلول المطبقة

### 1. إضافة دالة generateOrderNumber

```javascript
// في backend/models/Order.js
Order.generateOrderNumber = async function () {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const todayStart = new Date(year, today.getMonth(), today.getDate());
  const todayEnd = new Date(year, today.getMonth(), today.getDate() + 1);

  const todayOrdersCount = await this.count({
    where: {
      created_at: {
        [sequelize.Sequelize.Op.gte]: todayStart,
        [sequelize.Sequelize.Op.lt]: todayEnd,
      },
    },
  });

  const sequenceNumber = String(todayOrdersCount + 1).padStart(4, "0");
  return `ORD-${year}${month}${day}-${sequenceNumber}`;
};
```

### 2. إضافة الحقول المفقودة في نموذج Order

```javascript
// في backend/models/Order.js
total_cost_eur: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
},
total_cost_syp: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
},
commission_eur: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
},
commission_syp: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
},
priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal'
},
scheduled_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
}
```

### 3. تحديث controller لإنشاء الطلبات

```javascript
// في backend/controllers/orderController.js
const order = await Order.create(
  {
    order_number: orderNumber,
    store_id,
    store_name: store.name, // إضافة اسم المتجر
    total_amount_eur: totalAmountEur,
    total_amount_syp: totalAmountSyp,
    total_cost_eur: totalCostEur,
    total_cost_syp: totalCostSyp,
    commission_eur: (totalAmountEur - totalCostEur) * 0.1,
    commission_syp: (totalAmountSyp - totalCostSyp) * 0.1,
    status: ORDER_STATUS.DRAFT,
    payment_status: PAYMENT_STATUS.PENDING,
    priority: priority === "medium" ? "normal" : priority,
    scheduled_delivery_date: scheduled_delivery_date || null,
    notes,
    created_by: req.user.id,
    created_by_name: req.user.full_name || req.user.username,
  },
  { transaction }
);
```

### 4. إضافة الحقول المفقودة في order items

```javascript
// في backend/controllers/orderController.js
validatedItems.push({
  product_id: item.product_id,
  quantity,
  unit_price_eur: product.price_eur,
  unit_price_syp: product.price_syp,
  total_price_eur: itemTotalEur,
  total_price_syp: itemTotalSyp,
  final_price_eur: itemTotalEur, // إضافة السعر النهائي
  final_price_syp: itemTotalSyp, // إضافة السعر النهائي
  product_name: product.name,
  product_unit: product.unit,
});
```

### 5. إزالة التحقق من unit_price

```javascript
// في backend/validators/orderValidators.js
// تم إزالة التحقق من unit_price لأنه يتم حسابه تلقائياً
```

### 6. تحديث CreateOrderRequest

```javascript
// في backend/dto/request/CreateOrderRequest.js
this.priority = data.priority || "normal";

// تحديث التحقق من الأولوية
const validPriorities = ["low", "normal", "high", "urgent"];
```

### 7. تحديث التطبيق الأمامي

```javascript
// في dashboard/src/services/orderService.js
priority: orderData.priority || 'normal',

// في dashboard/src/services/orderService.js - getPriorityOptions
getPriorityOptions() {
    return [
        { value: 'low', label: 'منخفض', color: 'green' },
        { value: 'normal', label: 'متوسط', color: 'blue' },
        { value: 'high', label: 'عالي', color: 'orange' },
        { value: 'urgent', label: 'عاجل', color: 'red' },
    ];
}
```

## كيفية تطبيق الحلول

### للمطورين المحليين:

1. تأكد من أن جميع الملفات محدثة
2. أعد تشغيل السيرفر المحلي
3. اختبر إنشاء الطلبات

### للسيرفر على Railway:

1. **أعد نشر التطبيق** على Railway بعد التحديثات
2. أو ادفع التحديثات إلى Git repository
3. تأكد من أن Railway يعيد بناء التطبيق

## اختبار الحلول

### اختبار محلي:

```bash
cd backend
node test-auth-order.js
```

### اختبار السيرفر:

```bash
cd backend
node test-production-server.js
```

## ملاحظات مهمة

1. **قاعدة البيانات**: تأكد من أن جميع الحقول المطلوبة موجودة في قاعدة البيانات
2. **البيئة**: تأكد من أن متغيرات البيئة صحيحة
3. **الصلاحيات**: تأكد من أن المستخدم لديه صلاحيات إنشاء الطلبات
4. **التوكن**: تأكد من أن token المصادقة صحيح

## حالة الحل

✅ **تم تحديد جميع المشاكل**
✅ **تم تطبيق جميع الحلول محلياً**
⏳ **في انتظار إعادة نشر السيرفر على Railway**

## الخطوات التالية

1. إعادة نشر التطبيق على Railway
2. اختبار إنشاء الطلبات على السيرفر
3. التأكد من أن جميع الوظائف تعمل بشكل صحيح
