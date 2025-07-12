# 🚀 Railway Deployment Guide

## Step 1: Deploy to Railway

### 1.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Login with GitHub
4. Authorize Railway to access your repositories

### 1.2 Deploy Your Project

1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository: `Bakery-management-system`
3. Railway will automatically detect it's a Node.js project
4. Click "Deploy"

## Step 2: Add MySQL Database

### 2.1 Add Database Service

1. In your Railway project dashboard
2. Click "New" → "Database" → "MySQL"
3. Wait for the database to be created
4. Note the connection details

### 2.2 Import Database Schema

Use Railway's database connection details to import your schema:

```bash
# Railway will provide you with a connection string like:
# mysql://user:password@host:port/database

# Use this command to import your database:
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/create_complete_database.sql
```

## Step 3: Configure Environment Variables

### 3.1 Set Required Variables

In Railway dashboard → Variables tab, add:

```
NODE_ENV=production
PORT=5001
DB_HOST=<your-railway-mysql-host>
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=<your-railway-mysql-password>
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 3.2 Optional Variables

```
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
UPLOAD_PATH=./storage/uploads
LOGS_PATH=./storage/logs
```

## Step 4: Import Database Data

### 4.1 Import Core Schema

```bash
# 1. Core database structure
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/create_complete_database.sql

# 2. Additional distribution tables
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/additional_tables_for_distribution.sql

# 3. Final system tables
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/final_system_tables.sql
```

### 4.2 Import Sample Data

```bash
# Import all seeders
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/seeders/01_users_seeder.sql
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/seeders/02_products_seeder.sql
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/seeders/03_distributors_seeder.sql
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/seeders/04_stores_seeder.sql
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/seeders/05_orders_seeder.sql
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/seeders/06_payments_seeder.sql
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/seeders/07_notifications_seeder.sql
mysql -h <host> -P <port> -u <user> -p<password> <database> < database/seeders/08_reports_seeder.sql
```

## Step 5: Testing

### 5.1 Check Deployment

1. Railway will provide a public URL
2. Test the API: `https://your-app.railway.app/api/health`
3. Check logs in Railway dashboard

### 5.2 Test Login

```bash
# Test with admin account
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bakery.com",
    "password": "admin123"
  }'
```

## Step 6: Frontend Configuration

Update your frontend to point to the Railway URL:

```javascript
// frontend/src/services/apiClient.js
const API_BASE_URL = "https://your-app.railway.app/api";
```

## 📋 Troubleshooting

### Common Issues:

1. **Build Fails**: Check Node.js version in package.json
2. **Database Connection**: Verify environment variables
3. **CORS Errors**: Set correct CORS_ORIGIN
4. **File Upload Issues**: Check UPLOAD_PATH permissions

### Monitoring:

- View logs in Railway dashboard
- Monitor performance metrics
- Set up alerts for downtime

## 🎉 Success!

Your bakery management system is now live on Railway!

**Next Steps:**

1. Test all API endpoints
2. Deploy your frontend
3. Configure custom domain (optional)
4. Set up monitoring and backups
