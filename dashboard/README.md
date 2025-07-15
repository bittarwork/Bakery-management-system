# 🍞 BakeMaster - نظام إدارة المخبزة

نظام إدارة المخابز الاحترافي للأعمال الحديثة. يوفر إدارة شاملة للمخابز من الإنتاج إلى التوزيع.

## 🎨 Logo & Branding

### Logo Design

- **Main Icon**: Chef Hat (قبعة الطاهي) - رمز الاحترافية في صناعة المخابز
- **Colors**: Amber → Orange → Red gradient (تدرج من الكهرماني إلى البرتقالي إلى الأحمر)
- **Decorative Elements**: Wheat (قمح) و Cookie (كوكيز) مع حركات دوران
- **Typography**: "BakeMaster" مع تدرج لوني

### Favicon & Icons

- **SVG Favicon**: متوافق مع جميع المتصفحات الحديثة
- **PWA Support**: manifest.json مع أيقونات متعددة الأحجام
- **Social Media**: Open Graph و Twitter Card meta tags

## 🚀 Features

### Core Features

- ✅ **User Authentication** - تسجيل الدخول والخروج
- ✅ **Dashboard Analytics** - إحصائيات شاملة
- ✅ **Order Management** - إدارة الطلبات
- ✅ **Product Management** - إدارة المنتجات
- ✅ **Store Management** - إدارة المحلات
- ✅ **Payment Tracking** - تتبع المدفوعات
- ✅ **Distribution System** - نظام التوزيع
- ✅ **User Management** - إدارة المستخدمين
- ✅ **Reports & Analytics** - التقارير والتحليلات

### Technical Features

- ✅ **Responsive Design** - تصميم متجاوب
- ✅ **PWA Ready** - جاهز للتطبيق المحمول
- ✅ **Modern UI/UX** - واجهة مستخدم حديثة
- ✅ **Real-time Updates** - تحديثات فورية
- ✅ **Multi-language Support** - دعم متعدد اللغات
- ✅ **Dark/Light Theme** - الوضع المظلم/الفاتح

## 🛠️ Tech Stack

### Frontend

- **React 18** - مكتبة واجهة المستخدم
- **Vite** - أداة البناء السريعة
- **Tailwind CSS** - إطار عمل CSS
- **Framer Motion** - مكتبة الحركات
- **Zustand** - إدارة الحالة
- **React Router** - التنقل بين الصفحات

### Backend

- **Node.js** - بيئة التشغيل
- **Express.js** - إطار عمل الخادم
- **SQLite/MySQL** - قاعدة البيانات
- **JWT** - المصادقة
- **Railway** - الاستضافة

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd bakery-management-system/dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Usage

### Logo Component

```jsx
import Logo from './components/ui/Logo';

// Default logo
<Logo />

// Small icon-only logo
<Logo size="sm" variant="icon-only" />

// Large animated logo
<Logo size="xl" animated={true} />
```

### Available Props

- `size`: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `showText`: boolean
- `animated`: boolean
- `variant`: 'default' | 'simple' | 'icon-only'

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 📱 PWA Features

- **Offline Support** - العمل بدون إنترنت
- **App-like Experience** - تجربة تشبه التطبيق
- **Install Prompt** - إمكانية التثبيت
- **Background Sync** - مزامنة في الخلفية

## 🎨 Design System

### Colors

- **Primary**: Amber (#f59e0b)
- **Secondary**: Orange (#f97316)
- **Accent**: Red (#ef4444)
- **Background**: Slate (#1e293b)

### Typography

- **Font**: Inter (مثالي للعربية)
- **Direction**: RTL (من اليمين إلى اليسار)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

- **Email**: support@bakemaster.com
- **Documentation**: [docs.bakemaster.com](https://docs.bakemaster.com)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**BakeMaster** - نظام إدارة المخابز الاحترافي 🍞✨
