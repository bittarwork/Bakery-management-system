# 🧪 Testing Guide - Bakery Management Dashboard

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd dashboard
npm run dev
```

The application will be available at: `http://localhost:5173`

### 2. Login Credentials

Use these test credentials to login:

#### Admin User

- **Username**: `admin`
- **Password**: `password123`
- **Role**: Admin (full access)

#### Alternative Test Users

If you need to create additional test users, you can use the backend script:

```bash
cd backend
node scripts/createTestUser.js
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Login Error (400 Bad Request)

**Problem**: Login request returns 400 error
**Solution**:

- Make sure you're using `username` (not email) for login
- Verify the backend API is running at: `https://bakery-management-system-production.up.railway.app/api`
- Check browser console for detailed error messages

#### 2. React Router Warnings

**Problem**: Future flag warnings in console
**Solution**: These warnings are now suppressed with the future flags in `main.jsx`

#### 3. Missing Styles

**Problem**: Components look unstyled
**Solution**:

- Make sure Tailwind CSS is properly configured
- Check that `components.css` is imported in `index.css`
- Verify all CSS classes are defined

#### 4. API Connection Issues

**Problem**: Cannot connect to backend API
**Solution**:

- Check if the Railway backend is running
- Verify the API URL in `authStore.js`
- Check network connectivity

### Browser Console Errors

#### Authentication Errors

```
POST https://bakery-management-system-production.up.railway.app/api/auth/login 400 (Bad Request)
```

- **Cause**: Wrong field names or invalid credentials
- **Fix**: Use `username` instead of `email` in login form

#### CORS Errors

```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

- **Cause**: Backend CORS configuration
- **Fix**: Backend should allow requests from `http://localhost:5173`

## 🎯 Testing Scenarios

### 1. Authentication Flow

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Logout functionality
- [ ] Protected route access
- [ ] Redirect to login when not authenticated

### 2. Dashboard Features

- [ ] Dashboard loads with user information
- [ ] Sidebar navigation works
- [ ] Responsive design on mobile
- [ ] Dark mode toggle (if implemented)

### 3. Role-Based Access

- [ ] Admin can access all pages
- [ ] Non-admin users see appropriate restrictions
- [ ] Unauthorized page shows for restricted access

## 🔍 Debug Tools

### React DevTools

Install React DevTools for better debugging:

- [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Browser DevTools

- **Network Tab**: Monitor API requests
- **Console Tab**: Check for JavaScript errors
- **Application Tab**: Inspect cookies and local storage

## 📱 Mobile Testing

### Responsive Design

- Test on different screen sizes
- Verify sidebar collapse on mobile
- Check touch interactions

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚨 Emergency Reset

If you need to reset the application state:

1. **Clear Browser Data**:

   - Clear cookies and local storage
   - Hard refresh (Ctrl+F5)

2. **Reset Development Server**:

   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **Reset Backend** (if needed):
   ```bash
   cd backend
   node scripts/reset-database.js
   ```

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review browser console for errors
3. Verify backend API status
4. Check network connectivity

## 🎉 Success Indicators

You know everything is working when:

- ✅ Login page loads without errors
- ✅ Can login with test credentials
- ✅ Dashboard loads with user information
- ✅ Sidebar navigation works
- ✅ No console errors
- ✅ Responsive design works on mobile

---

**Happy Testing! 🎯**
