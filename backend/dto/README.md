# Data Transfer Objects (DTOs)

هذا المجلد يحتوي على DTOs لتنظيم وتحويل البيانات بين الطبقات.

## الهيكلية

```
dto/
├── request/
│   ├── CreateOrderDto.js     # DTO لإنشاء طلب
│   ├── UpdateOrderDto.js     # DTO لتحديث طلب
│   ├── LoginDto.js           # DTO لتسجيل الدخول
│   └── RegisterDto.js        # DTO للتسجيل
├── response/
│   ├── OrderResponseDto.js   # DTO لاستجابة الطلب
│   ├── UserResponseDto.js    # DTO لاستجابة المستخدم
│   └── ApiResponseDto.js     # DTO للاستجابة العامة
└── index.js                  # تصدير جميع DTOs
```

## الاستخدام

```javascript
import { CreateOrderDto, OrderResponseDto } from "../dto/index.js";

// في الـ controller
export const createOrder = async (req, res) => {
  const orderDto = new CreateOrderDto(req.body);
  const order = await orderService.create(orderDto);
  const response = new OrderResponseDto(order);

  res.json(response);
};
```

## قواعد التسمية

- استخدم PascalCase للأسماء
- أضف كلمة Dto في نهاية اسم الكلاس
- فصل request DTOs عن response DTOs
