# 🍞 Bakery Management System Dashboard

A modern, responsive dashboard for comprehensive bakery management with advanced features including distribution tracking, payment management, and real-time analytics.

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/bakery-management-system)

1. **Fork this repository**
2. **Click the Deploy button above**
3. **Add environment variables:**
   ```
   VITE_API_BASE_URL=https://bakery-management-system-production.up.railway.app/api/
   ```
4. **Deploy!**

### Manual Deploy

```bash
# Clone the repository
git clone https://github.com/your-username/bakery-management-system.git
cd bakery-management-system/dashboard

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Charts**: Chart.js + Recharts
- **Maps**: Leaflet + React Leaflet
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📋 Features

### 🔐 Authentication & User Management

- Secure login/logout system
- Role-based access control
- User profile management
- Password reset functionality

### 📊 Dashboard & Analytics

- Real-time statistics
- Interactive charts and graphs
- Performance metrics
- Customizable widgets

### 🏪 Store Management

- Store CRUD operations
- Location mapping with Google Maps
- Store performance analytics
- Geographic clustering

### 📦 Product Management

- Product catalog with categories
- Image upload and management
- Inventory tracking
- Product performance analysis

### 📋 Order Management

- Order creation and tracking
- Status workflow management
- Multi-currency support (EUR/SYP)
- Order assignment to distributors

### 💳 Payment Management

- Payment recording and tracking
- Balance management
- Payment method analysis
- Debt aging reports

### 🚚 Distribution Management

- Route optimization
- Real-time tracking
- Schedule management
- Performance monitoring

### 📈 Reports & Analytics

- Daily, weekly, monthly reports
- Custom date range reports
- Export functionality (PDF, Excel)
- Business intelligence dashboards

## 🔧 Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env.local` file:

```env
VITE_API_BASE_URL=https://bakery-management-system-production.up.railway.app/api/
VITE_APP_NAME=Bakery Management System
VITE_APP_VERSION=1.0.0
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   └── ui/            # UI components
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Dashboard pages
│   ├── distribution/  # Distribution pages
│   ├── orders/        # Order management pages
│   ├── payments/      # Payment pages
│   ├── products/      # Product pages
│   ├── reports/       # Report pages
│   ├── stores/        # Store pages
│   ├── users/         # User management pages
│   └── settings/      # Settings pages
├── services/           # API services
├── stores/            # State management
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── styles/            # Global styles
└── config/            # Configuration files
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables in Vercel dashboard**
3. **Deploy automatically on every push**

### Other Platforms

- **Netlify**: Drag and drop `dist` folder
- **GitHub Pages**: Use GitHub Actions workflow
- **Railway**: Connect repository directly

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interfaces
- Progressive Web App (PWA) ready
- Offline capabilities

## 🔒 Security

- JWT authentication
- Role-based access control
- Secure API communication
- Input validation and sanitization

## 📊 Performance

- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- CDN integration

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📈 Monitoring

- Vercel Analytics integration
- Error tracking with Sentry
- Performance monitoring
- User behavior analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**🍞 Built with ❤️ for modern bakery management**
