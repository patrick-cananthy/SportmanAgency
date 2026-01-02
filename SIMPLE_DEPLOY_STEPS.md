# Simple Deployment Steps - What to Do Next

## ⚠️ STOP: Netlify Won't Work!

Your app has a **Node.js backend server** that needs to run 24/7. Netlify only hosts static files.

**You need one of these instead:**

---

## 🎯 Option 1: Render.com (FREE - Best for Testing)

### What You Need:
- GitHub account (free)
- 15 minutes

### Step-by-Step:

#### Step 1: Put Your Code on GitHub

1. **Open Command Prompt/Terminal in your project folder**

2. **Type these commands one by one:**
   ```bash
   git init
   git add .
   git commit -m "First commit"
   ```

3. **Go to GitHub.com:**
   - Sign up/Login
   - Click the "+" icon (top right)
   - Click "New repository"
   - Name it: `sportsman-agency`
   - Make it **Public**
   - Click "Create repository" (DON'T check any boxes)

4. **Back in terminal, type:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sportsman-agency.git
   git branch -M main
   git push -u origin main
   ```
   (Replace YOUR_USERNAME with your GitHub username)

#### Step 2: Deploy on Render

1. **Go to https://render.com**
2. **Click "Get Started for Free"**
3. **Sign up with GitHub** (click GitHub button)
4. **Click "New +" → "Web Service"**
5. **Connect your repository:**
   - Select `sportsman-agency`
   - Click "Connect"
6. **Fill in the form:**
   - **Name**: `sportsman-agency`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
7. **Click "Advanced" → Add these Environment Variables:**
   ```
   NODE_ENV = production
   PORT = 10000
   DB_HOST = localhost
   DB_USER = your_db_user
   DB_PASSWORD = your_db_password
   DB_NAME = your_db_name
   JWT_SECRET = your_secret_key
   EMAIL_USER = sportsmantalenta56@gmail.com
   EMAIL_PASS = your_email_password
   ALLOWED_ORIGINS = https://sportsman-agency.onrender.com
   ```
8. **Click "Create Web Service"**
9. **Wait 5-10 minutes** - Your site will be live!

**Your site URL will be:** `https://sportsman-agency.onrender.com`

---

## 🏢 Option 2: MyTrueHost (For Going Live)

### What You Need:
- MyTrueHost account
- FTP access
- 30 minutes

### Step-by-Step:

#### Step 1: Prepare Files

1. **Create a folder on your computer** called `sportsman-deploy`
2. **Copy these files/folders into it:**
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `config/` folder
   - `models/` folder
   - `routes/` folder
   - `middleware/` folder
   - `public/` folder
   - `admin/` folder
   - `uploads/` folder (create empty folders: news, events, jobs, talents, sales-rentals)
   - `.env` file (with production values)

3. **DO NOT copy:**
   - `node_modules/` folder
   - `.git/` folder

#### Step 2: Upload to MyTrueHost

1. **Download FileZilla** (free): https://filezilla-project.org
2. **Open FileZilla**
3. **Connect to your server:**
   - **Host**: `ftp.yourdomain.com` (or IP from MyTrueHost)
   - **Username**: Your FTP username
   - **Password**: Your FTP password
   - **Port**: 21
   - Click "Quickconnect"

4. **Navigate to `public_html` folder** (on right side - remote server)
5. **Upload all files** from your `sportsman-deploy` folder (drag and drop)

#### Step 3: Create Database

1. **Login to MyTrueHost cPanel**
2. **Find "MySQL Databases"**
3. **Create Database:**
   - Name: `sportsman_db`
   - Click "Create Database"
4. **Create User:**
   - Username: `sportsman_user`
   - Password: (generate strong password)
   - Click "Create User"
5. **Add User to Database:**
   - Select user and database
   - Click "Add"
   - Check "ALL PRIVILEGES"
   - Click "Make Changes"

#### Step 4: Update .env File

1. **Edit your `.env` file** with database info:
   ```
   DB_HOST=localhost
   DB_USER=your_username_sportsman_user
   DB_PASSWORD=the_password_you_created
   DB_NAME=your_username_sportsman_db
   ```

2. **Upload the updated `.env` file** to `public_html`

#### Step 5: Install Dependencies

1. **In cPanel, find "Terminal" or "SSH Access"**
2. **Type these commands:**
   ```bash
   cd public_html
   npm install --production
   ```

#### Step 6: Start Your App

**In the same terminal, type:**
```bash
npm install -g pm2
pm2 start server.js --name "sportsman"
pm2 save
```

#### Step 7: Test

1. **Visit your domain:** `https://yourdomain.com`
2. **Test admin login:** `https://yourdomain.com/admin`
3. **Everything should work!**

---

## 📝 Quick Checklist

Before deploying, make sure:

- [ ] All code is working locally
- [ ] `.env` file has production values
- [ ] Database credentials are ready
- [ ] Email password is ready
- [ ] You know which option you're using (Render or MyTrueHost)

---

## 🆘 Need Help?

**If stuck, check:**
1. Error messages in deployment logs
2. All environment variables are set
3. Database connection works
4. File permissions are correct (755 for folders)

**Which option do you want to use?**
- **Quick testing**: Render.com (Option 1) - 15 minutes
- **Going live**: MyTrueHost (Option 2) - 30 minutes

