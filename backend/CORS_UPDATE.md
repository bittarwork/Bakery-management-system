# 🔗 CORS Configuration Update

## 📋 Changes Made

### 1. Updated CORS Origins in `server.js`

Added the production frontend domain to the allowed origins list:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:5173", // Vite default port
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  // Production frontend domain
  "https://bakery-management-system-nine.vercel.app",
  // Flutter development origins
  "http://localhost:8080", // Flutter web development
  "http://127.0.0.1:8080",
  // Mobile app origins (for development)
  "capacitor://localhost",
  "ionic://localhost",
  // Allow requests with no origin (like mobile apps)
  null,
];
```

### 2. Updated Environment Variables

#### `config.env`

```env
FRONTEND_URL=https://bakery-management-system-nine.vercel.app
```

#### `env.example`

```env
FRONTEND_URL=https://bakery-management-system-nine.vercel.app
```

#### `production-env.example`

```env
FRONTEND_URL=https://bakery-management-system-nine.vercel.app
CORS_ORIGINS=https://bakery-management-system-nine.vercel.app
```

## 🚀 Deployment Instructions

### For Railway Production

1. **Update Environment Variables in Railway Dashboard:**

   - Go to your Railway project dashboard
   - Navigate to Variables tab
   - Update `FRONTEND_URL` to: `https://bakery-management-system-nine.vercel.app`
   - Add `CORS_ORIGINS` if not present: `https://bakery-management-system-nine.vercel.app`

2. **Redeploy the Backend:**
   - Railway will automatically redeploy when you push these changes to GitHub
   - Or manually trigger a redeploy from Railway dashboard

### For Local Development

1. **Update your local `.env` file:**

   ```env
   FRONTEND_URL=https://bakery-management-system-nine.vercel.app
   ```

2. **Restart your development server:**
   ```bash
   npm run dev
   ```

## ✅ Testing the Connection

### 1. Test from Frontend

Visit your frontend at: `https://bakery-management-system-nine.vercel.app`

Try to:

- Login with admin credentials
- Access dashboard
- Make API calls to the backend

### 2. Test API Directly

```bash
# Test CORS headers
curl -H "Origin: https://bakery-management-system-nine.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://bakery-management-system-production.up.railway.app/api/health
```

### 3. Check Browser Console

Open browser developer tools and check for any CORS errors in the console.

## 🔧 Troubleshooting

### Common CORS Issues

1. **CORS Error in Browser:**

   - Ensure the backend is redeployed with new CORS settings
   - Check that the domain is exactly correct (no trailing slash)
   - Verify HTTPS vs HTTP protocol

2. **Environment Variables Not Updated:**

   - Check Railway dashboard for correct environment variables
   - Ensure no typos in the domain name

3. **Cache Issues:**
   - Clear browser cache
   - Hard refresh the page (Ctrl+F5)

### Verification Commands

```bash
# Check if backend is accessible
curl https://bakery-management-system-production.up.railway.app/api/health

# Check CORS headers
curl -I -H "Origin: https://bakery-management-system-nine.vercel.app" \
     https://bakery-management-system-production.up.railway.app/api/health
```

## 📞 Support

If you encounter any issues:

1. Check Railway logs for backend errors
2. Verify environment variables are correctly set
3. Test API endpoints directly
4. Check browser console for detailed error messages

---

**Last Updated:** $(date)
**Frontend Domain:** https://bakery-management-system-nine.vercel.app
**Backend API:** https://bakery-management-system-production.up.railway.app/api/
