# 🚀 دليل الاستضافة - أقل التكاليف

## 🎯 الخيارات المرتبة حسب التكلفة

### 1. 🆓 **Railway** (الخيار الأفضل)

**التكلفة**: مجاني للبداية + 5$ شهرياً للاستخدام المتوسط
**المميزات**:

- ✅ سهل جداً في الاستخدام
- ✅ قاعدة بيانات MySQL مدمجة
- ✅ SSL certificate مجاني
- ✅ Git deployment تلقائي
- ✅ دعم Node.js ممتاز

#### خطوات النشر على Railway:

##### الخطوة 1: تحضير المشروع

```bash
# 1. إنشاء ملف package.json للنشر
cd backend
npm init -y

# 2. إضافة script للنشر
```

##### الخطوة 2: إعداد ملفات النشر

إنشاء ملف `backend/railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

إنشاء ملف `backend/.railwayignore`:

```
node_modules/
.env
.env.local
*.log
.DS_Store
storage/temp/*
storage/logs/*
```

##### الخطوة 3: تحديث package.json

```json
{
  "name": "bakery-management-api",
  "version": "2.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "deploy": "railway deploy"
  },
  "engines": {
    "node": "18.x"
  }
}
```

##### الخطوة 4: النشر

1. **إنشاء حساب**: اذهب إلى [railway.app](https://railway.app)
2. **ربط GitHub**: اربط حساب GitHub الخاص بك
3. **إنشاء مشروع جديد**:

   - اختر "Deploy from GitHub repo"
   - اختر repository المشروع
   - اختر مجلد `backend`

4. **إعداد قاعدة البيانات**:

   - اضغط "+ Add Service"
   - اختر "Database" → "MySQL"
   - سيتم إنشاء قاعدة بيانات تلقائياً

5. **إعداد متغيرات البيئة**:

   ```
   NODE_ENV=production
   PORT=$PORT
   DATABASE_URL=${{MySQL.DATABASE_URL}}
   JWT_SECRET=your-super-secret-key-here
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   GOOGLE_MAPS_API_KEY=your-google-maps-key
   ```

6. **رفع ملف SQL**:
   - استخدم Railway CLI أو phpMyAdmin
   - رفع ملف `database/create_complete_database.sql`

---

### 2. 🔵 **Vercel** (مجاني محدود)

**التكلفة**: مجاني للمشاريع الصغيرة
**المناسب لـ**: المشاريع التجريبية

#### خطوات النشر على Vercel:

##### إنشاء ملف `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

##### النشر:

```bash
# 1. تثبيت Vercel CLI
npm i -g vercel

# 2. تسجيل الدخول
vercel login

# 3. النشر
vercel --prod
```

**ملاحظة**: Vercel لا يدعم قواعد البيانات، ستحتاج خدمة منفصلة مثل PlanetScale

---

### 3. 🟣 **Heroku** (مجاني محدود)

**التكلفة**: مجاني للتجريب، 7$ شهرياً للاستخدام الحقيقي

#### خطوات النشر على Heroku:

##### إنشاء ملف `Procfile`:

```
web: node backend/server.js
```

##### النشر:

```bash
# 1. تثبيت Heroku CLI
# تحميل من heroku.com/cli

# 2. تسجيل الدخول
heroku login

# 3. إنشاء تطبيق
heroku create bakery-management-api

# 4. إضافة قاعدة بيانات
heroku addons:create jawsdb:kitefin

# 5. إعداد متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# 6. النشر
git push heroku main
```

---

### 4. 💧 **DigitalOcean Droplet** (5$ شهرياً)

**التكلفة**: 5$ شهرياً للخادم الأساسي
**المميزات**: تحكم كامل، أداء ممتاز

#### خطوات النشر على DigitalOcean:

##### إنشاء Droplet:

1. اذهب إلى [digitalocean.com](https://digitalocean.com)
2. إنشاء Droplet جديد (Ubuntu 22.04)
3. اختر حجم 1GB RAM ($5/month)

##### إعداد الخادم:

```bash
# 1. الاتصال بالخادم
ssh root@your-server-ip

# 2. تحديث النظام
apt update && apt upgrade -y

# 3. تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 4. تثبيت MySQL
apt install mysql-server -y
mysql_secure_installation

# 5. تثبيت PM2
npm install -g pm2

# 6. إعداد Nginx
apt install nginx -y
```

##### نشر التطبيق:

```bash
# 1. رفع الملفات
scp -r backend/ root@your-server-ip:/var/www/

# 2. تثبيت Dependencies
cd /var/www/backend
npm install --production

# 3. إعداد قاعدة البيانات
mysql -u root -p < ../database/create_complete_database.sql

# 4. تشغيل التطبيق
pm2 start server.js --name bakery-api
pm2 startup
pm2 save
```

##### إعداد Nginx:

```nginx
# /etc/nginx/sites-available/bakery-api
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تفعيل الموقع
ln -s /etc/nginx/sites-available/bakery-api /etc/nginx/sites-enabled/
systemctl restart nginx
```

---

### 5. 🔶 **AWS EC2** (مرن حسب الاستخدام)

**التكلفة**: من 3-10$ شهرياً حسب الاستخدام

#### إعداد سريع على AWS:

1. إنشاء EC2 instance (t2.micro للتجريب المجاني)
2. تثبيت Node.js و MySQL
3. إعداد Security Groups للمنافذ 80, 443, 22
4. استخدام RDS لقاعدة البيانات (اختياري)

---

## 🗄️ خيارات قاعدة البيانات المجانية/الرخيصة

### 1. **PlanetScale** (مجاني)

- MySQL مدار
- 5GB مجاني
- سهل الاستخدام

### 2. **Supabase** (مجاني)

- PostgreSQL مدار
- 500MB مجاني
- واجهة إدارة ممتازة

### 3. **MongoDB Atlas** (مجاني)

- NoSQL مدار
- 512MB مجاني

---

## 🌐 إعداد النطاق (Domain)

### خيارات رخيصة:

1. **Namecheap**: 8-12$ سنوياً
2. **Cloudflare**: إدارة DNS مجانية + CDN
3. **Freenom**: نطاقات مجانية (.tk, .ml)

### إعداد DNS:

```
Type: A
Name: @
Value: your-server-ip

Type: A
Name: www
Value: your-server-ip

Type: A
Name: api
Value: your-server-ip
```

---

## 🔒 إعداد HTTPS المجاني

### استخدام Let's Encrypt:

```bash
# تثبيت Certbot
apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
certbot --nginx -d your-domain.com -d www.your-domain.com

# تجديد تلقائي
crontab -e
# إضافة: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 مراقبة النظام

### إعداد مراقبة أساسية:

```bash
# تثبيت htop لمراقبة الموارد
apt install htop -y

# مراقبة logs
pm2 logs bakery-api

# فحص حالة الخدمات
systemctl status nginx
systemctl status mysql
```

---

## 💰 مقارنة التكاليف الشهرية

| الخدمة       | التكلفة الشهرية | المميزات    | المناسب لـ        |
| ------------ | --------------- | ----------- | ----------------- |
| Railway      | 0-5$            | سهل، مدمج   | البداية           |
| Vercel       | 0$              | مجاني محدود | التجريب           |
| Heroku       | 7$              | سهل الإدارة | المشاريع الصغيرة  |
| DigitalOcean | 5$              | تحكم كامل   | الاستخدام المتوسط |
| AWS EC2      | 3-10$           | مرونة عالية | المشاريع الكبيرة  |

---

## 🎯 التوصية الأفضل

### للبداية: **Railway**

- مجاني للتجريب
- سهل جداً في الاستخدام
- قاعدة بيانات مدمجة
- SSL تلقائي

### للاستخدام الجدي: **DigitalOcean**

- تكلفة منخفضة (5$ شهرياً)
- أداء ممتاز
- تحكم كامل
- مجتمع كبير للدعم

---

## 🚀 خطوات البداية السريعة

### الخيار الأسرع (Railway):

1. إنشاء حساب على Railway
2. ربط GitHub repository
3. إضافة قاعدة بيانات MySQL
4. إعداد متغيرات البيئة
5. النشر تلقائياً!

### الخيار الأرخص (DigitalOcean):

1. إنشاء Droplet (5$)
2. تثبيت Node.js و MySQL
3. رفع الكود
4. إعداد Nginx
5. الحصول على SSL مجاني

---

**💡 نصيحة**: ابدأ بـ Railway للتجريب، ثم انتقل لـ DigitalOcean عند الحاجة لتحكم أكبر.
