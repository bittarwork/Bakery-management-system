# دليل نشر نظام AI Chat على Railway

## 🚀 خطوات النشر

### 1. إضافة متغيرات البيئة في Railway

اذهب إلى Railway Dashboard وأضف المتغيرات التالية:

#### متغيرات AI Chat الأساسية (مطلوبة):

```
AI_CHAT_ENABLED=true
GEMINI_API_KEY=AIzaSyBtHQj07zURNqSYp0mt9qxnCQoX3Of2BUY
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.4
GEMINI_TOP_P=0.95
GEMINI_TOP_K=40
GEMINI_MAX_TOKENS=2048
BOT_NAME=مساعد المخبز الذكي
BOT_WELCOME_MESSAGE=أهلاً وسهلاً! أنا مساعدك الذكي. يمكنني مساعدتك في الاستفسار عن المبيعات والمخزون والتحليلات. ما الذي تريد معرفته؟
```

#### متغيرات التخزين المؤقت والحدود:

```
AI_CACHE_ENABLED=true
AI_CACHE_TTL=3600
AI_CACHE_MAX_SIZE=1000
AI_RATE_LIMIT_REQUESTS=100
AI_RATE_LIMIT_WINDOW=3600000
AI_MAX_MESSAGE_LENGTH=1000
```

#### متغيرات الميزات:

```
ENABLE_SUGGESTED_QUESTIONS=true
ENABLE_CONTEXT_MEMORY=true
ENABLE_ADVANCED_ANALYTICS=true
```

### 2. التحقق من المتغيرات الموجودة

تأكد من وجود هذه المتغيرات الأساسية:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`

### 3. إعادة النشر

بعد إضافة جميع المتغيرات:

1. احفظ التغييرات في Railway
2. أعد نشر التطبيق (Redeploy)
3. انتظر حتى اكتمال النشر

### 4. اختبار النظام

1. اذهب إلى `https://your-app.railway.app/api/ai-chat/health`
2. يجب أن ترى:

```json
{
  "success": true,
  "data": {
    "aiService": "operational",
    "provider": "gemini",
    "cacheEnabled": true,
    "timestamp": "2025-01-26T..."
  }
}
```

### 5. اختبار رسالة AI

اذهب إلى صفحة AI Chat في التطبيق وجرب إرسال رسالة.

## 🔍 استكشاف الأخطاء

### خطأ 500 في `/api/ai-chat/message`

**السبب المحتمل:** `GEMINI_API_KEY` مفقود أو غير صحيح

**الحل:**

1. تأكد من إضافة `GEMINI_API_KEY` في Railway
2. تأكد من أن المفتاح صحيح
3. أعد نشر التطبيق

### خطأ "No AI services initialized"

**السبب:** متغيرات Gemini مفقودة

**الحل:**

1. أضف جميع متغيرات `GEMINI_*`
2. أعد النشر

### خطأ في قاعدة البيانات

**السبب:** متغيرات قاعدة البيانات مفقودة

**الحل:**

1. تأكد من متغيرات `DB_*`
2. اختبر الاتصال بقاعدة البيانات

## 📋 قائمة تحقق سريعة

- [ ] إضافة `GEMINI_API_KEY`
- [ ] إضافة `GEMINI_MODEL=gemini-1.5-flash`
- [ ] إضافة `AI_CHAT_ENABLED=true`
- [ ] إضافة `BOT_NAME`
- [ ] إضافة `BOT_WELCOME_MESSAGE`
- [ ] إعادة النشر
- [ ] اختبار `/api/ai-chat/health`
- [ ] اختبار إرسال رسالة

## 🚨 مهم

إذا كنت تستخدم نموذج `gemini-1.5-pro-latest` وتحصل على خطأ quota، غير إلى:

```
GEMINI_MODEL=gemini-1.5-flash
```

هذا النموذج أسرع وله حدود أقل.
