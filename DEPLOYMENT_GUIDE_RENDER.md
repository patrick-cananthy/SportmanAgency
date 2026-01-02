# Render.com Deployment Guide (Free Node.js Hosting Alternative)

This is a better alternative to Netlify for your Node.js application.

## Prerequisites

1. GitHub account
2. Render.com account (free at render.com)
3. Your code pushed to GitHub

## Step 1: Prepare Your Project

### 1.1 Create `render.yaml` (Optional)

```yaml
services:
  - type: web
    name: sportsman-talent-agency
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 1.2 Update `package.json`

Ensure you have:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

## Step 2: Push to GitHub

1. Create GitHub repository
2. Push your code:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

## Step 3: Deploy on Render

### 3.1 Create New Web Service

1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### 3.2 Configure Service

- **Name**: `sportsman-talent-agency`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### 3.3 Add Environment Variables

Click "Environment" tab and add:
```
NODE_ENV=production
PORT=10000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
EMAIL_USER=sportsmantalenta56@gmail.com
EMAIL_PASS=your_gmail_app_password
ALLOWED_ORIGINS=https://your-app.onrender.com
```

### 3.4 Deploy

Click "Create Web Service" and wait for deployment.

## Step 4: Database Setup

### 4.1 Create PostgreSQL Database (Free)

1. In Render dashboard → "New +" → "PostgreSQL"
2. Name it: `sportsman-db`
3. Plan: Free
4. Note the connection details

### 4.2 Update Database Configuration

Update your Sequelize config to support PostgreSQL, or use MySQL from external provider.

## Step 5: Custom Domain (Optional)

1. Go to service settings
2. Add custom domain
3. Update DNS records as instructed

## Free Tier Limits

- 750 hours/month (enough for 24/7)
- Sleeps after 15 minutes of inactivity (wakes on request)
- 512MB RAM
- Free SSL included

---

**This is a better option than Netlify for your Node.js application!**

