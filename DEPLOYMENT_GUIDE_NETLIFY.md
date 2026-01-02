# Netlify Deployment Guide (Free Hosting)

This guide will help you deploy your Sportsman Talent Agency website to Netlify for free.

## Prerequisites

1. A GitHub account (free)
2. A Netlify account (free at netlify.com)
3. Your project code ready

## Step 1: Prepare Your Project for Netlify

### 1.1 Create a `netlify.toml` file in your project root

```toml
[build]
  command = "npm install && npm start"
  publish = "public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 1.2 Update `package.json` to include build scripts

Add these scripts if not already present:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install"
  }
}
```

### 1.3 Create a `.gitignore` file (if not exists)

```
node_modules/
.env
uploads/
*.log
.DS_Store
```

## Step 2: Push Your Code to GitHub

### 2.1 Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - ready for Netlify deployment"
```

### 2.2 Create a GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Name it: `sportsman-talent-agency`
4. Make it **Public** (required for free Netlify)
5. Click "Create repository"

### 2.3 Push Your Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/sportsman-talent-agency.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Deploy to Netlify

### 3.1 Sign Up for Netlify

1. Go to [netlify.com](https://www.netlify.com)
2. Click "Sign up" → Choose "GitHub"
3. Authorize Netlify to access your GitHub account

### 3.2 Create a New Site

1. Click "Add new site" → "Import an existing project"
2. Choose "GitHub" as your Git provider
3. Select your repository: `sportsman-talent-agency`
4. Configure build settings:
   - **Build command**: `npm install && npm start`
   - **Publish directory**: `public`
   - **Base directory**: (leave empty)

### 3.3 Set Environment Variables

1. Go to Site settings → **Environment variables**
2. Add the following variables:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=sportsmantalenta56@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ALLOWED_ORIGINS=https://your-site-name.netlify.app
   ```

### 3.4 Deploy

1. Click "Deploy site"
2. Wait for the build to complete (5-10 minutes)
3. Your site will be live at: `https://random-name-123.netlify.app`

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Custom Domain

1. Go to Site settings → **Domain management**
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### 4.2 Update Environment Variables

Update `ALLOWED_ORIGINS` to include your custom domain:
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Step 5: Database Setup

### 5.1 Use a Cloud Database

Netlify doesn't host databases. You need:
- **Option 1**: MySQL hosting (MyTrueHost, PlanetScale, etc.)
- **Option 2**: MongoDB Atlas (free tier)
- **Option 3**: Supabase (free PostgreSQL)

### 5.2 Update Database Connection

Update your `.env` or environment variables with your cloud database credentials.

## Step 6: File Uploads Setup

### 6.1 Use Cloud Storage

Since Netlify is serverless, use:
- **AWS S3** (with free tier)
- **Cloudinary** (free tier)
- **Netlify Large Media** (paid)

### 6.2 Update Upload Configuration

Modify your upload routes to use cloud storage instead of local filesystem.

## Important Notes for Netlify

⚠️ **Limitations:**
- Netlify Functions have execution time limits (10 seconds on free tier)
- No persistent file storage (use cloud storage)
- Serverless functions only (Node.js backend may need adjustments)
- Free tier: 100GB bandwidth/month

✅ **Best For:**
- Static frontend hosting
- Serverless functions
- Fast CDN delivery

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Environment Variables Not Working
- Redeploy after adding variables
- Check variable names match exactly
- Ensure no spaces in variable values

### Database Connection Issues
- Verify database allows external connections
- Check firewall settings
- Confirm credentials are correct

## Next Steps

After deployment:
1. Test all functionality
2. Set up automatic deployments (auto-deploy on git push)
3. Configure custom domain
4. Set up SSL certificate (automatic with Netlify)
5. Monitor site performance

---

**Need Help?** Check Netlify documentation: https://docs.netlify.com

