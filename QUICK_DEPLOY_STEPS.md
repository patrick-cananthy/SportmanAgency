# Quick Deployment Steps - Simple Guide

## ⚠️ IMPORTANT: Netlify Won't Work for Your App!

Your app needs a **full Node.js server** running 24/7. Netlify only hosts static files and serverless functions.

**You have 2 options:**

### Option A: Use Render.com (FREE, Better for Your App) ✅
- Supports full Node.js apps
- Free tier available
- See steps below

### Option B: Use MyTrueHost (Production) ✅
- Best for going live
- Full control
- See `DEPLOYMENT_GUIDE_MYTRUEHOST.md`

---

## 🚀 Quick Steps: Render.com (Recommended for Testing)

### Step 1: Push Code to GitHub (5 minutes)

1. **Open terminal/command prompt in your project folder**

2. **Initialize Git (if not done):**
   ```bash
   git init
   ```

3. **Add all files:**
   ```bash
   git add .
   ```

4. **Commit:**
   ```bash
   git commit -m "Ready for deployment"
   ```

5. **Create GitHub repository:**
   - Go to https://github.com
   - Click "+" → "New repository"
   - Name: `sportsman-agency`
   - Make it **Public**
   - Click "Create repository"
   - **DON'T** initialize with README

6. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sportsman-agency.git
   git branch -M main
   git push -u origin main
   ```
   (Replace YOUR_USERNAME with your GitHub username)

### Step 2: Deploy on Render.com (10 minutes)

1. **Sign up:**
   - Go to https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub account if asked
   - Select your repository: `sportsman-agency`

3. **Configure:**
   - **Name**: `sportsman-agency`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   NODE_ENV = production
   PORT = 10000
   DB_HOST = your_database_host
   DB_USER = your_database_user
   DB_PASSWORD = your_database_password
   DB_NAME = your_database_name
   JWT_SECRET = your_secret_key_here
   EMAIL_USER = sportsmantalenta56@gmail.com
   EMAIL_PASS = your_gmail_app_password
   ALLOWED_ORIGINS = https://sportsman-agency.onrender.com
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Your site will be at: `https://sportsman-agency.onrender.com`

### Step 3: Set Up Database

**Option 1: Use Render PostgreSQL (Free)**
1. In Render dashboard → "New +" → "PostgreSQL"
2. Name: `sportsman-db`
3. Plan: Free
4. Copy connection details
5. Update environment variables with new DB credentials

**Option 2: Use External MySQL**
- Use your MyTrueHost database
- Update DB_HOST to your MyTrueHost database host

---

## 🏢 Quick Steps: MyTrueHost (For Production)

### Step 1: Prepare Files

1. **Create production .env file:**
   - Copy your `.env` file
   - Rename to `.env.production`
   - Update with production values

2. **Zip your project** (excluding node_modules):
   - Create a zip file of your project
   - Exclude: `node_modules/`, `.git/`, `.env` (you'll upload separately)

### Step 2: Upload to MyTrueHost

1. **Login to MyTrueHost cPanel**

2. **Go to File Manager:**
   - Navigate to `public_html` folder

3. **Upload your zip file:**
   - Click "Upload"
   - Select your zip file
   - Wait for upload

4. **Extract:**
   - Right-click zip file → "Extract"
   - Delete zip file after extraction

5. **Upload .env file:**
   - Upload your `.env.production` file
   - Rename it to `.env`

### Step 3: Create Database

1. **In cPanel → MySQL Databases:**
   - Create database: `sportsman_db`
   - Create user: `sportsman_user`
   - Add user to database
   - Grant ALL privileges

2. **Update .env file** with database credentials

### Step 4: Install Dependencies

1. **Open Terminal/SSH in cPanel**

2. **Navigate to project:**
   ```bash
   cd public_html
   ```

3. **Install:**
   ```bash
   npm install --production
   ```

### Step 5: Start Application

**Using PM2 (Recommended):**
```bash
npm install -g pm2
pm2 start server.js --name "sportsman"
pm2 save
pm2 startup
```

**Or using nohup:**
```bash
nohup node server.js > app.log 2>&1 &
```

### Step 6: Test

1. Visit your domain
2. Test admin login
3. Verify everything works

---

## 📋 What You Need Before Starting

- [ ] GitHub account (for Render.com)
- [ ] MyTrueHost account (for production)
- [ ] Database credentials ready
- [ ] Email app password ready
- [ ] Domain name (for production)

---

## ❓ Common Issues

**"Build failed"**
- Check build logs
- Ensure all dependencies in package.json
- Verify Node.js version

**"Database connection failed"**
- Check credentials
- Verify database exists
- Check firewall settings

**"Port already in use"**
- Change PORT in .env
- Or kill existing process

---

## 🆘 Need Help?

1. Check error logs first
2. Verify all environment variables set
3. Test database connection separately
4. Check file permissions (755 for folders, 644 for files)

---

**Which option are you using?**
- **Testing/Staging**: Use Render.com (Option A)
- **Production/Live**: Use MyTrueHost (Option B)

