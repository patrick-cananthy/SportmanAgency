# Quick Client Preview Deployment (FREE)

Show your client the website in 15 minutes using **Render.com** (FREE).

## Why Render.com?
✅ **FREE** - No credit card required  
✅ **Supports Node.js** - Your app will work perfectly  
✅ **Easy setup** - Just connect GitHub  
✅ **Live URL** - Client can access immediately  
✅ **Auto-deploys** - Updates when you push code  

---

## Step-by-Step (15 minutes)

### Step 1: Put Code on GitHub (5 minutes)

**1.1 Open Command Prompt in your project folder:**
- Press `Windows Key + R`
- Type `cmd` and press Enter
- Type `cd` and drag your project folder into the window, press Enter

**1.2 Initialize Git:**
```bash
git init
git add .
git commit -m "Ready for client preview"
```

**1.3 Create GitHub Repository:**
1. Go to https://github.com
2. Sign up/Login (free)
3. Click **"+"** (top right) → **"New repository"**
4. Name: `sportsman-agency-preview`
5. Make it **Public** ✅
6. **DON'T** check any boxes
7. Click **"Create repository"**

**1.4 Push Your Code:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/sportsman-agency-preview.git
git branch -M main
git push -u origin main
```
*(Replace YOUR_USERNAME with your GitHub username)*

**If asked for login:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  - Give it `repo` permissions
  - Copy the token and use it as password

---

### Step 2: Deploy on Render.com (10 minutes)

**2.1 Sign Up:**
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Click **"Sign up with GitHub"**
4. Authorize Render to access GitHub

**2.2 Create Web Service:**
1. Click **"New +"** button (top right)
2. Click **"Web Service"**
3. Find and click your repository: `sportsman-agency-preview`
4. Click **"Connect"**

**2.3 Configure Settings:**
Fill in these fields:
- **Name**: `sportsman-agency-preview`
- **Region**: Choose closest to you (e.g., "Oregon (US West)")
- **Branch**: `main`
- **Root Directory**: *(leave empty)*
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** ✅

**2.4 Add Environment Variables:**
Click **"Advanced"** → Scroll to **"Environment Variables"** → Click **"Add Environment Variable"**

Add these one by one:

```
NODE_ENV = production
PORT = 10000
DB_HOST = your_database_host
DB_USER = your_database_user
DB_PASSWORD = your_database_password
DB_NAME = your_database_name
JWT_SECRET = SuperSecretKey123!ChangeThis
EMAIL_USER = sportsmantalenta56@gmail.com
EMAIL_PASS = your_gmail_app_password
ALLOWED_ORIGINS = https://sportsman-agency-preview.onrender.com
```

**Important:** 
- Replace database values with your actual credentials
- For JWT_SECRET, use any random string (you can change later)
- For EMAIL_PASS, use your Gmail app password (see EMAIL_SETUP.md)

**2.5 Deploy:**
1. Scroll down
2. Click **"Create Web Service"**
3. Wait 5-10 minutes (watch the logs)
4. When it says "Live", you're done! 🎉

**Your site will be at:**
`https://sportsman-agency-preview.onrender.com`

---

### Step 3: Set Up Database (Choose One)

#### Option A: Use Your Existing Database
- If you have a MySQL database already, just use those credentials in environment variables
- Make sure it allows external connections

#### Option B: Create Free PostgreSQL on Render
1. In Render dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `sportsman-db`
3. Plan: **Free**
4. Click **"Create Database"**
5. Copy the connection details
6. Update your environment variables with new DB info

**Note:** If using PostgreSQL, you'll need to update your Sequelize config to support it, or stick with MySQL.

---

### Step 4: Share with Client

**Send them this:**
```
Website: https://sportsman-agency-preview.onrender.com
Admin Panel: https://sportsman-agency-preview.onrender.com/admin

Login Credentials:
Email: superadmin@sportsmantalent.com
Password: SuperAdmin@2025!
```

---

## Free Tier Limits (Render.com)

- ✅ **750 hours/month** - Enough for 24/7
- ⚠️ **Sleeps after 15 min inactivity** - First request wakes it up (takes ~30 seconds)
- ✅ **512MB RAM** - Enough for your app
- ✅ **Free SSL** - HTTPS included
- ✅ **Custom domain** - Can add later

**Note:** The "sleep" feature means the first visit after inactivity takes ~30 seconds to load. After that, it's fast.

---

## Troubleshooting

### "Build Failed"
- Check the build logs in Render dashboard
- Make sure all dependencies are in `package.json`
- Verify Node.js version (should be 18+)

### "Application Error"
- Check the logs
- Verify environment variables are set correctly
- Check database connection

### "Database Connection Failed"
- Verify database credentials
- Make sure database allows external connections
- Check firewall settings

### Site Takes Long to Load
- This is normal on free tier (sleeps after 15 min)
- First load: ~30 seconds
- Subsequent loads: Fast

---

## Updating the Site

When you make changes:

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Updated for client"
   git push
   ```
3. **Render auto-deploys** - Takes 5-10 minutes

---

## After Client Approval

Once client approves, you can:
1. **Move to MyTrueHost** for production (see `DEPLOYMENT_GUIDE_MYTRUEHOST.md`)
2. **Add custom domain** to Render (if staying)
3. **Upgrade Render plan** (if needed, removes sleep feature)

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created
- [ ] Environment variables added
- [ ] Database configured
- [ ] Site is live
- [ ] Tested admin login
- [ ] Shared URL with client

---

**That's it! Your client can now view the website for free! 🚀**

