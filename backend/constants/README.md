# Constants

هذا المجلد يحتوي على جميع الثوابت المستخدمة في التطبيق.

## الهيكلية

```
constants/
├── orderStatus.js         # حالات الطلبات
├── paymentStatus.js       # حالات الدفع
├── userRoles.js          # أدوار المستخدمين
├── apiMessages.js        # رسائل API
├── errorCodes.js         # رموز الأخطاء
├── httpStatus.js         # رموز HTTP
└── index.js              # تصدير جميع الثوابت
```

## الاستخدام

```javascript
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants/index.js";

// استخدام الثوابت
const order = {
  status: ORDER_STATUS.CONFIRMED,
  payment_status: PAYMENT_STATUS.PENDING,
};
```

## قواعد التسمية

- استخدم UPPER_SNAKE_CASE للثوابت
- استخدم camelCase لأسماء الملفات
- اجمع الثوابت المترابطة في ملف واحد
