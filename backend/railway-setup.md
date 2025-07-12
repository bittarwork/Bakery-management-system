# Railway Setup Guide

## 📋 Environment Variables Configuration

After deploying to Railway, you need to configure these environment variables:

### Required Variables:

```
NODE_ENV=production
PORT=5001
DB_HOST=<your-railway-mysql-host>
DB_PORT=3306
DB_NAME=bakery_management
DB_USER=root
DB_PASSWORD=<your-railway-mysql-password>
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### Optional Variables:

```
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
UPLOAD_PATH=./storage/uploads
LOGS_PATH=./storage/logs
```

## 🔧 Configuration Steps:

1. **Database Setup:**

   - Add MySQL service to your Railway project
   - Copy database connection details to environment variables
   - Import your database schema

2. **Environment Variables:**

   - Go to your Railway project dashboard
   - Click on "Variables" tab
   - Add all the required variables listed above

3. **Domain Setup:**
   - Railway will provide a temporary domain
   - You can add a custom domain in the settings

## 🚀 Deployment:

Railway will automatically deploy when you push to GitHub!

## 📊 Monitoring:

- View logs in Railway dashboard
- Monitor performance and usage
- Set up alerts for issues
