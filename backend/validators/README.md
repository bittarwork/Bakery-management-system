# Validators

هذا المجلد يحتوي على جميع validators المخصصة للتحقق من صحة البيانات.

## الهيكلية

```
validators/
├── authValidators.js      # validators للتوثيق
├── orderValidators.js     # validators للطلبات
├── storeValidators.js     # validators للمتاجر
├── userValidators.js      # validators للمستخدمين
├── productValidators.js   # validators للمنتجات
└── commonValidators.js    # validators مشتركة
```

## الاستخدام

```javascript
import { validateOrder } from "./validators/orderValidators.js";

// في الـ route
router.post("/orders", validateOrder, createOrder);
```

## قواعد التسمية

- استخدم camelCase للأسماء
- أضف كلمة Validators في نهاية اسم الملف
- اجعل كل validator function منفصلة ومُصدرة
