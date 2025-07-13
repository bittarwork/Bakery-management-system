# 🚀 Railway Quick Setup Guide

## ✅ System Status

- **Backend**: Deployed successfully on Railway
- **Database**: Needs to be configured
- **Environment**: Production ready

## 🔧 Quick Fix Steps

### 1. Add MySQL Database Service

1. Go to your Railway project dashboard
2. Click "New Service" → "Database" → "MySQL"
3. Wait for MySQL to provision (2-3 minutes)

### 2. Set Environment Variables

In your Railway project → Variables tab, add:

```env
# Database Configuration (Auto-filled by Railway MySQL)
DB_HOST=${MYSQLHOST}
DB_USER=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
DB_NAME=${MYSQLDATABASE}
DB_PORT=${MYSQLPORT}

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-123456789

# Node Environment
NODE_ENV=production

# Frontend URL (Update with your domain)
FRONTEND_URL=https://your-app-name.railway.app
```

### 3. Import Database Schema

```bash
# Connect to Railway MySQL
railway connect mysql

# Import the complete database
mysql -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < database/create_complete_database.sql
```

### 4. Test Your API

```bash
# Health check
curl https://your-app-name.railway.app/api/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "database_configured": true,
  "tables_count": 28,
  "enhanced_tables": 5
}
```

## 🎯 What's Working Now

### ✅ Basic System

- Server starts successfully
- Health endpoint responds
- API routes are available
- Error handling improved

### ⚠️ Limited Until Database Setup

- Database operations disabled
- Enhanced features unavailable
- System runs in limited mode

## 📊 Expected Costs

- **Railway Pro**: $20/month
- **MySQL Service**: $5/month
- **Total**: ~$25/month

## 🔗 Next Steps

1. Add MySQL service ✅
2. Set environment variables ✅
3. Import database schema ✅
4. Test all endpoints ✅
5. Configure custom domain (optional)

## 🆘 Troubleshooting

### If Health Check Shows Warning

```json
{
  "status": "warning",
  "message": "Database not configured - system running in limited mode"
}
```

**Solution**: Follow steps 1-3 above

### If Database Connection Fails

**Solution**:

1. Check environment variables are set
2. Ensure MySQL service is running
3. Verify database schema is imported

## 📞 Support

- Railway logs available in dashboard
- System will show helpful error messages
- All endpoints have proper error handling

---

**🍞 Your Bakery Management System is Railway-ready!**
