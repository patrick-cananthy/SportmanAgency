# Deploy to Railway - Quick Deployment Guide

**Simple guide to deploy your SportAgency application to Railway (FREE)**

---

## 📋 What You Need (5 minutes to get)

1. **GitHub account** (free) - https://github.com
2. **Railway account** (free) - https://railway.app

---

## 🚀 Step 1: Push Code to GitHub

### 1.1 Open Command Prompt in your project folder

**Windows:**
- Press `Windows Key + R`
- Type `cmd` and press Enter
- Type: `cd ` (with space)
- Drag your `SportAgency` folder into the window
- Press Enter

### 1.2 Initialize Git (if not already done)

Copy and paste these commands one by one:

```bash
git init
git add .
git commit -m "Ready for Railway deployment"
```

### 1.3 Create GitHub Repository

1. Go to **https://github.com** and sign up/login
2. Click the **"+"** icon (top right) → **"New repository"**
3. Name: `sportsman-agency`
4. Make it **Public** ✅ (or Private if you prefer)
5. **DON'T** check any boxes (no README, .gitignore, or license)
6. Click **"Create repository"**

### 1.4 Push Your Code

Replace `YOUR_USERNAME` with your GitHub username, then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/sportsman-agency.git
git branch -M main
git push -u origin main
```

Enter your GitHub username and password (or use a Personal Access Token).

---

## 🚂 Step 2: Deploy to Railway

### 2.1 Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Choose **"Login with GitHub"** ✅
4. Authorize Railway to access your GitHub account

### 2.2 Create New Project

1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Find and select your `sportsman-agency` repository
4. Click **"Deploy Now"**

Railway will automatically detect your Node.js app and start deploying!

### 2.3 Add Database (PostgreSQL or MySQL)

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → Choose **PostgreSQL** or **MySQL**
3. Railway will create a new database service
4. Wait for it to provision (takes ~30 seconds)

### 2.4 Get Database Connection Details

**Railway automatically provides database variables!** You have two options:

#### Option A: Use Railway's Auto-Injected Variables (Recommended)

Railway automatically shares database variables with your web service. You can reference them directly:

1. Click on your **database service** in Railway
2. Go to the **"Variables"** tab
3. Note the variable names (you'll reference these in your web service)

#### Option B: Copy Values Manually

1. Click on your **database service** in Railway
2. Go to the **"Variables"** tab
3. You'll see connection details like:
   - `MYSQLHOST` (for MySQL) or `PGHOST` (for PostgreSQL)
   - `MYSQLPORT` or `PGPORT`
   - `MYSQLDATABASE` or `PGDATABASE`
   - `MYSQLUSER` or `PGUSER`
   - `MYSQLPASSWORD` or `PGPASSWORD`

**⚠️ IMPORTANT**: Copy the **exact values** - don't use placeholder text!

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Link Database to Web Service (IMPORTANT!)

**First, connect your database to your web service:**

1. In Railway, click on your **web service**
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. You'll see a dropdown - select **"Reference Variable"**
5. Choose your **database service** from the list
6. Railway will show available variables from that database
7. **Add these references** (one by one):

#### For PostgreSQL:
- Variable Name: `DB_HOST` → Reference: `${{Postgres.PGHOST}}`
- Variable Name: `DB_PORT` → Reference: `${{Postgres.PGPORT}}`
- Variable Name: `DB_NAME` → Reference: `${{Postgres.PGDATABASE}}`
- Variable Name: `DB_USER` → Reference: `${{Postgres.PGUSER}}`
- Variable Name: `DB_PASSWORD` → Reference: `${{Postgres.PGPASSWORD}}`

#### For MySQL:
- Variable Name: `DB_HOST` → Reference: `${{MySQL.MYSQLHOST}}`
- Variable Name: `DB_PORT` → Reference: `${{MySQL.MYSQLPORT}}`
- Variable Name: `DB_NAME` → Reference: `${{MySQL.MYSQLDATABASE}}`
- Variable Name: `DB_USER` → Reference: `${{MySQL.MYSQLUSER}}`
- Variable Name: `DB_PASSWORD` → Reference: `${{MySQL.MYSQLPASSWORD}}`

**Note**: Replace `Postgres` or `MySQL` with your actual database service name!

### 3.2 Add Other Required Variables

1. In Railway, click on your **web service**
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"** for each of these:

#### Required Variables:

```
DB_DIALECT=mysql
```
*(Use `mysql` for MySQL or `postgres` for PostgreSQL)*

**⚠️ IMPORTANT**: Make sure `DB_DIALECT` matches your database type exactly!

#### Example: If you copied these from your MySQL database service:

```
DB_DIALECT=mysql
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=your-password-here
```

**Note**: Replace `your-password-here` with the actual `MYSQLPASSWORD` value from your database service.

```
JWT_SECRET=your-super-secret-key-change-this-in-production
```
*(Generate a random string - use: `openssl rand -base64 32`)*

```
PORT=3005
```
*(Railway will set this automatically, but you can specify it)*

```
NODE_ENV=production
```

#### Optional Variables (if needed):

```
ALLOWED_ORIGINS=https://your-app-name.up.railway.app
```
ALLOWED_ORIGINS=https://sportmans-agency.up.railway.app
### 3.2 Railway Auto-Detection

Railway automatically detects:
- ✅ Node.js runtime
- ✅ `package.json` start script
- ✅ Port (from `PORT` variable or defaults to 3000)

---

## 🔧 Step 4: Configure Build Settings

### 4.1 Check Build Settings

1. Click on your **web service**
2. Go to **"Settings"** tab
3. Verify:
   - **Build Command**: `npm install` (auto-detected)
   - **Start Command**: `npm start` (auto-detected)
   - **Root Directory**: `/` (root of your repo)

### 4.2 Update Start Command (if needed)

If your `package.json` has a different start script, update it:
- Go to **Settings** → **Deploy**
- Set **Start Command**: `npm start` or `node server.js`

---

## 🌐 Step 5: Get Your Live URL

### 5.1 Find Your Domain

1. In your **web service**, go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. You'll see your Railway domain:
   - Format: `your-app-name.up.railway.app`
   - Example: `sportsman-agency-production.up.railway.app`

### 5.2 Access Your Site

1. Click the **"Generate Domain"** button if no domain exists
2. Railway will create a public URL
3. Your site is now live! 🎉

**Note**: Railway provides HTTPS automatically - no configuration needed!

---

## 🔐 Step 6: Update Frontend API URLs (Optional)

If your frontend makes API calls, update the base URL:

### In `index.html` and other frontend files:

The `getApiBaseUrl()` function should automatically work, but you can also:

1. Update API calls to use your Railway domain:
   ```javascript
   const API_BASE = 'https://your-app-name.up.railway.app/api';
   ```

2. Or keep it dynamic (recommended):
   ```javascript
   function getApiBaseUrl() {
       return window.location.origin;
   }
   ```

---

## 📊 Step 7: Monitor Your Deployment

### 7.1 View Logs

1. Click on your **web service**
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View **"Logs"** to see:
   - Build progress
   - Application startup
   - Any errors

### 7.2 Check Status

- ✅ **Deployed**: Your app is running
- ⏳ **Building**: Railway is building your app
- ❌ **Failed**: Check logs for errors

---

## 🗄️ Step 8: Database Setup

### 8.1 Connect to Database

Your database is automatically created and connected. The connection string is available in:
- Database service → **Variables** tab
- Or use Railway's built-in database viewer

### 8.2 Run Migrations (if needed)

Railway will automatically:
- ✅ Create tables when your app starts
- ✅ Run Sequelize sync (if configured)

**Note**: Your `server.js` already has database sync enabled!

---

## 🎯 Step 9: Test Your Deployment

### 9.1 Test Public Endpoints

Visit these URLs in your browser:

```
https://your-app-name.up.railway.app/
https://your-app-name.up.railway.app/api/news
https://your-app-name.up.railway.app/api/events
```

### 9.2 Test Admin Panel

```
https://your-app-name.up.railway.app/admin
```

**Default Admin Credentials** (if auto-created):
- Email: `admin@sportsmantalent.com`
- Password: `Admin@2026`

**⚠️ IMPORTANT**: Change this password immediately after first login!

---

## 🔄 Step 10: Automatic Deployments

### 10.1 Automatic Deploys

Railway automatically deploys when you:
- ✅ Push to `main` branch
- ✅ Merge a pull request
- ✅ Manually trigger from dashboard

### 10.2 Manual Deploy

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** button
3. Select the deployment to redeploy

---

## 🛠️ Troubleshooting

### Problem: Build Fails

**Solution**:
1. Check **Deployments** → **Logs**
2. Verify `package.json` has correct scripts
3. Ensure all dependencies are in `package.json`
4. Check Node.js version compatibility

### Problem: App Crashes on Start

**Solution**:
1. Check **Logs** for error messages
2. Verify all environment variables are set
3. Check database connection string
4. Ensure `PORT` variable is set (Railway sets this automatically)

### Problem: Database Connection Error (`getaddrinfo ENOTFOUND mysql.railway.internal`)

**This error means Railway can't find your database host. Fix it:**

**Solution 1: Use Railway Variable References (Recommended)**
1. Go to your **web service** → **Variables** tab
2. Delete any `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` variables
3. Add them again using **"Reference Variable"** option
4. Select your database service and reference the correct variables
5. Redeploy your service

**Solution 2: Copy Exact Values**
1. Go to your **database service** → **Variables** tab
2. Copy the **exact values** (not the variable names) for:
   - `MYSQLHOST` or `PGHOST` → Use as `DB_HOST`
   - `MYSQLPORT` or `PGPORT` → Use as `DB_PORT`
   - `MYSQLDATABASE` or `PGDATABASE` → Use as `DB_NAME`
   - `MYSQLUSER` or `PGUSER` → Use as `DB_USER`
   - `MYSQLPASSWORD` or `PGPASSWORD` → Use as `DB_PASSWORD`
3. Paste these **exact values** in your web service variables
4. Make sure `DB_DIALECT` is set to `mysql` or `postgres` (match your database type)
5. Redeploy

**Solution 3: Check Database Service Name**
1. Verify your database service is running (should show "Active")
2. Check the exact name of your database service
3. When using variable references, use the exact service name
4. Example: If service is named "MySQL", use `${{MySQL.MYSQLHOST}}`

**Solution 4: Verify All Variables**
Double-check these variables in your web service:
- ✅ `DB_DIALECT` = `mysql` or `postgres` (must match!)
- ✅ `DB_HOST` = actual host value (not `mysql.railway.internal`)
- ✅ `DB_PORT` = `3306` (MySQL) or `5432` (PostgreSQL)
- ✅ `DB_NAME` = actual database name
- ✅ `DB_USER` = actual username
- ✅ `DB_PASSWORD` = actual password

### Problem: 404 Errors

**Solution**:
1. Verify your routes are correct
2. Check if static files are being served
3. Ensure `public` folder is in the correct location
4. Check Railway logs for routing errors

### Problem: CORS Errors

**Solution**:
1. Add your Railway domain to `ALLOWED_ORIGINS`
2. Update CORS settings in `server.js`
3. Check browser console for specific CORS errors

---

## 💰 Railway Free Tier Limits

- **$5 credit per month** (enough for small apps)
- **500 hours of usage**
- **Sleeps after 5 minutes of inactivity** (free tier)
- **Automatic wake on request** (may take 10-30 seconds)

### Upgrade Options

If you need:
- No sleep delays → Upgrade to paid plan ($5/month)
- More resources → Upgrade to paid plan
- Custom domain → Available on all plans

---

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Set strong `JWT_SECRET` (random string)
- [ ] Updated `ALLOWED_ORIGINS` with your domain
- [ ] Reviewed environment variables
- [ ] Enabled HTTPS (automatic on Railway)
- [ ] Database credentials are secure (Railway handles this)

---

## 📝 Quick Reference

### Railway Dashboard
- **Projects**: https://railway.app/dashboard
- **Documentation**: https://docs.railway.app
- **Status**: https://status.railway.app

### Important URLs
- Your App: `https://your-app-name.up.railway.app`
- Admin Panel: `https://your-app-name.up.railway.app/admin`
- API Base: `https://your-app-name.up.railway.app/api`

### Useful Commands

```bash
# View Railway CLI (optional)
npm install -g @railway/cli

# Login via CLI
railway login

# Link project
railway link

# View logs
railway logs
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Project deployed from GitHub
- [ ] Database service created
- [ ] Environment variables configured
- [ ] Build successful
- [ ] App is running
- [ ] Database connected
- [ ] Public URL working
- [ ] Admin panel accessible
- [ ] Default password changed
- [ ] Tested all features

---

## 🎉 Success!

Your SportAgency application is now live on Railway!

**Next Steps**:
1. Share your Railway URL with clients
2. Set up a custom domain (optional)
3. Monitor usage and performance
4. Set up backups for your database

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

---

**Last Updated**: 2024
**Maintained by**: SportAgency Development Team

