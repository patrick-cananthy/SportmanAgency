# Deploy to Render.com - Simple Guide

**One clear guide to show your client the website (FREE)**

---

## 📋 What You Need (5 minutes to get)

1. **GitHub account** (free) - https://github.com
2. **Render.com account** (free) - https://render.com

---

## 🚀 Step 1: Push Code to GitHub

### 1.1 Open Command Prompt in your project folder

**Windows:**
- Press `Windows Key + R`
- Type `cmd` and press Enter
- Type: `cd ` (with space)
- Drag your `SportAgency` folder into the window
- Press Enter

### 1.2 Initialize Git

Copy and paste these commands one by one:

```bash
git init
git add .
git commit -m "Ready for deployment"
```

### 1.3 Create GitHub Repository

1. Go to **https://github.com** and sign up/login
2. Click the **"+"** icon (top right) → **"New repository"**
3. Name: `sportsman-agency`
4. Make it **Public** ✅
5. **DON'T** check any boxes
6. Click **"Create repository"**

### 1.4 Push Your Code

Replace `YOUR_USERNAME` with your GitHub username, then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/sportsman-agency.git
git branch -M main
git push -u origin main
```

**If asked for password:** Use a GitHub Personal Access Token (not your password)
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- Give it `repo` permission
- Copy and use as password

---

## 🗄️ Step 2: Create Database on Render (IMPORTANT!)

**Your app needs a database. Render provides a free one.**

### 2.1 Create PostgreSQL Database

1. Go to **Render Dashboard**
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name**: `sportsman-db`
   - **Database**: (leave default)
   - **Plan**: **Free** ✅
   - **Region**: Same as your web service (or closest)
4. Click **"Create Database"**
5. **Wait 2-3 minutes**

### 2.2 Copy Database Details

1. Click on your database (`sportsman-db`)
2. **Copy these values** (you'll need them):
   - **Host** (e.g., `dpg-xxxxx-a.oregon-postgres.render.com`)
   - **Port**: `5432`
   - **Database name** (e.g., `sportsman_db_xxxx`)
   - **User** (e.g., `sportsman_user`)
   - **Password** (shown once - **COPY IT NOW!**)

---

## 🌐 Step 3: Deploy Web Service

### 3.1 Create Web Service

1. In Render Dashboard → Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `sportsman-agency`
3. Click **"Connect"**

### 3.2 Configure Settings

Fill in exactly:

- **Name**: `sportsman-agency`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: *(leave empty)*
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** ✅

### 3.3 Add Environment Variables

Click **"Advanced"** → Scroll to **"Environment Variables"**

Add these **one by one** (click "Add Environment Variable" for each):

```
NODE_ENV = production
PORT = 10000
DB_DIALECT = postgres
DB_HOST = [paste the Host from Step 2.2]
DB_PORT = 5432
DB_NAME = [paste the Database name from Step 2.2]
DB_USER = [paste the User from Step 2.2]
DB_PASSWORD = [paste the Password from Step 2.2]
JWT_SECRET = SuperSecretKey123!ChangeThisLater
EMAIL_USER = sportsmantalenta56@gmail.com
EMAIL_PASS = [your Gmail app password]
ALLOWED_ORIGINS = https://sportsman-agency.onrender.com
```

**Important:** 
- Replace `[paste...]` with actual values from your database
- For `EMAIL_PASS`, use your Gmail app password (see `EMAIL_SETUP.md`)
- For `JWT_SECRET`, use any random string (you can change later)

### 3.4 Deploy

1. Scroll down
2. Click **"Create Web Service"**
3. **Wait 5-10 minutes** (watch the logs)
4. When you see "Live" ✅ - You're done!

---

## ✅ Step 4: Test

1. **Visit your site:** `https://sportsman-agency.onrender.com`
2. **Test admin:** `https://sportsman-agency.onrender.com/admin`
   - Email: `superadmin@sportsmantalent.com`
   - Password: `SuperAdmin@2025!`

---

## 📤 Step 5: Share with Client

Send them:

```
Website: https://sportsman-agency.onrender.com
Admin: https://sportsman-agency.onrender.com/admin

Admin Login:
Email: superadmin@sportsmantalent.com
Password: SuperAdmin@2025!
```

---

## ⚠️ Important Notes

1. **First load after sleep:** Takes ~30 seconds (free tier sleeps after 15 min)
2. **Subsequent loads:** Fast
3. **Database:** Already set up (PostgreSQL on Render)
4. **Updates:** Just push to GitHub, Render auto-deploys

---

## 🆘 Troubleshooting

### "Database Error"
- ✅ Check environment variables are correct
- ✅ Verify database is "Available" (green status)
- ✅ Make sure you copied database values correctly

### "Build Failed"
- ✅ Check build logs
- ✅ Ensure all files are in GitHub
- ✅ Verify `package.json` has all dependencies

### Site Not Loading
- ✅ Check if it's still deploying (wait 5-10 min)
- ✅ Check logs for errors
- ✅ Verify environment variables

---

## 📝 That's It!

Your client can now view the website for free on Render.com!

**Next Steps (After Client Approval):**
- Move to MyTrueHost for production (see `DEPLOYMENT_GUIDE_MYTRUEHOST.md`)

---

**Questions?** Check the logs in Render dashboard - they show exactly what's happening.

