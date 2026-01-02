# MyTrueHost Deployment Guide (Production/Live)

This guide will help you deploy your Sportsman Talent Agency website to MyTrueHost for production use.

## Prerequisites

1. MyTrueHost account with:
   - Shared hosting or VPS
   - MySQL database
   - Node.js support (if available) or PHP hosting
2. Your domain name pointed to MyTrueHost
3. FTP/SFTP access credentials
4. cPanel access (if available)

## Step 1: Prepare Your Project

### 1.1 Update Environment Configuration

Create a `.env.production` file:

```env
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# JWT Secret
JWT_SECRET=your_very_secure_random_secret_key_here

# Email Configuration
EMAIL_USER=sportsmantalenta56@gmail.com
EMAIL_PASS=your_gmail_app_password

# Allowed Origins
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 1.2 Update Server Configuration

Ensure `server.js` uses environment variables:

```javascript
const PORT = process.env.PORT || 3000;
```

### 1.3 Prepare Build Files

If using a build process, run:
```bash
npm install --production
```

## Step 2: Create Database on MyTrueHost

### 2.1 Access cPanel

1. Log into your MyTrueHost cPanel
2. Find "MySQL Databases" or "Database" section

### 2.2 Create Database

1. Click "Create Database"
2. Name it: `sportsman_agency` (or your preferred name)
3. Note the full database name: `username_sportsman_agency`

### 2.3 Create Database User

1. Go to "MySQL Users"
2. Create a new user:
   - Username: `sportsman_user` (or your preferred name)
   - Password: Generate a strong password
3. Note the full username: `username_sportsman_user`

### 2.4 Assign User to Database

1. Go to "Add User to Database"
2. Select your user and database
3. Grant **ALL PRIVILEGES**
4. Click "Make Changes"

### 2.5 Update Your .env File

Update database credentials:
```env
DB_HOST=localhost
DB_USER=username_sportsman_user
DB_PASSWORD=your_generated_password
DB_NAME=username_sportsman_agency
```

## Step 3: Upload Files to MyTrueHost

### 3.1 Connect via FTP/SFTP

**Using FileZilla (Free FTP Client):**
1. Download FileZilla: https://filezilla-project.org
2. Open FileZilla
3. Enter credentials:
   - **Host**: `ftp.yourdomain.com` or IP provided by MyTrueHost
   - **Username**: Your FTP username
   - **Password**: Your FTP password
   - **Port**: 21 (FTP) or 22 (SFTP)
4. Click "Quickconnect"

### 3.2 Upload Project Files

1. Navigate to `public_html` folder (or `www` or `httpdocs`)
2. Upload all project files:
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `config/` folder
   - `models/` folder
   - `routes/` folder
   - `middleware/` folder
   - `uploads/` folder (create if needed)
   - `.env.production` (rename to `.env` after upload)
   - All other project files

**Important:** Do NOT upload:
- `node_modules/` (will be installed on server)
- `.git/` folder
- Development files

### 3.3 Set File Permissions

Set correct permissions:
- Folders: `755`
- Files: `644`
- `server.js`: `755` (executable)

## Step 4: Install Dependencies on Server

### 4.1 Access SSH/Terminal (if available)

If MyTrueHost provides SSH access:

```bash
cd public_html
npm install --production
```

### 4.2 Or Use cPanel Terminal

1. Go to cPanel → "Terminal" or "SSH Access"
2. Navigate to your project:
   ```bash
   cd public_html
   ```
3. Install dependencies:
   ```bash
   npm install --production
   ```

### 4.3 If Node.js Not Available

If MyTrueHost doesn't support Node.js, you may need to:
- Use a VPS plan
- Contact support to enable Node.js
- Use a different hosting solution

## Step 5: Configure Node.js Application

### 5.1 Create Startup Script

Create a file `start.sh`:

```bash
#!/bin/bash
cd /home/username/public_html
NODE_ENV=production node server.js
```

Make it executable:
```bash
chmod +x start.sh
```

### 5.2 Use PM2 (Process Manager) - Recommended

Install PM2 globally:
```bash
npm install -g pm2
```

Start your application:
```bash
pm2 start server.js --name "sportsman-agency"
pm2 save
pm2 startup
```

This ensures your app restarts automatically if it crashes.

## Step 6: Configure Domain and DNS

### 6.1 Point Domain to MyTrueHost

1. Log into your domain registrar
2. Update DNS records:
   - **A Record**: `@` → MyTrueHost IP address
   - **A Record**: `www` → MyTrueHost IP address
   - **CNAME**: `www` → `yourdomain.com` (if applicable)

### 6.2 Wait for DNS Propagation

DNS changes can take 24-48 hours to propagate globally.

### 6.3 Configure Domain in MyTrueHost

1. Go to cPanel → "Addon Domains" or "Parked Domains"
2. Add your domain
3. Point it to `public_html` folder

## Step 7: Set Up SSL Certificate

### 7.1 Install Let's Encrypt SSL (Free)

1. Go to cPanel → "SSL/TLS Status"
2. Select your domain
3. Click "Run AutoSSL" or "Install SSL"
4. Wait for certificate installation

### 7.2 Force HTTPS

Update your `.env`:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Step 8: Configure File Uploads

### 8.1 Create Upload Directories

Create these folders in `public_html`:
```bash
mkdir -p uploads/news
mkdir -p uploads/events
mkdir -p uploads/jobs
mkdir -p uploads/talents
mkdir -p uploads/sales-rentals
```

### 8.2 Set Permissions

```bash
chmod 755 uploads
chmod 755 uploads/*
```

## Step 9: Database Migration

### 9.1 Run Database Setup

SSH into your server and run:
```bash
node create-default-super-admin.js
```

Or manually create tables by starting your server (tables auto-create).

### 9.2 Verify Database Connection

Test the connection:
```bash
node check-server.js
```

## Step 10: Start Your Application

### 10.1 Using PM2 (Recommended)

```bash
pm2 start server.js --name "sportsman-agency"
pm2 logs sportsman-agency
```

### 10.2 Using Screen (Alternative)

```bash
screen -S sportsman
node server.js
# Press Ctrl+A then D to detach
```

### 10.3 Using nohup (Simple)

```bash
nohup node server.js > app.log 2>&1 &
```

## Step 11: Configure Firewall

### 11.1 Open Required Ports

Ensure port 3000 (or your chosen port) is open:
- Check MyTrueHost firewall settings
- Open port in cPanel if available

### 11.2 Configure Reverse Proxy (if needed)

If using port 3000, set up reverse proxy in cPanel or `.htaccess`:

```apache
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
</IfModule>
```

## Step 12: Test Your Deployment

### 12.1 Test Frontend

1. Visit: `https://yourdomain.com`
2. Check all pages load correctly
3. Test navigation

### 12.2 Test Backend

1. Visit: `https://yourdomain.com/admin`
2. Log in with super admin credentials
3. Test all admin functions

### 12.3 Test API

1. Visit: `https://yourdomain.com/api/news`
2. Should return JSON data

## Step 13: Monitor and Maintain

### 13.1 Set Up Monitoring

- Use PM2 monitoring: `pm2 monit`
- Set up uptime monitoring (UptimeRobot - free)
- Monitor error logs

### 13.2 Regular Backups

1. **Database Backups:**
   - Use cPanel → "Backup" → "Download MySQL Database"
   - Or set up automated backups

2. **File Backups:**
   - Download `uploads/` folder regularly
   - Backup `.env` file securely

### 13.3 Update Process

1. Make changes locally
2. Test thoroughly
3. Upload changed files via FTP
4. Restart application: `pm2 restart sportsman-agency`

## Troubleshooting

### Application Won't Start

1. Check logs: `pm2 logs` or `tail -f app.log`
2. Verify Node.js version: `node -v`
3. Check port availability: `netstat -tulpn | grep 3000`
4. Verify environment variables

### Database Connection Failed

1. Verify credentials in `.env`
2. Check database user permissions
3. Ensure database exists
4. Test connection: `mysql -u username -p database_name`

### 500 Internal Server Error

1. Check server logs
2. Verify file permissions
3. Check `.env` file exists and is readable
4. Verify all dependencies installed

### Files Not Uploading

1. Check `uploads/` folder permissions (755)
2. Verify disk space: `df -h`
3. Check upload size limits in server config

## Security Checklist

- [ ] Change default super admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Set secure file permissions
- [ ] Regular security updates
- [ ] Database backups
- [ ] Firewall configured
- [ ] Environment variables secured

## Support Contacts

- **MyTrueHost Support**: Check your hosting panel for support contact
- **Technical Issues**: Review server logs first
- **Database Issues**: Contact MyTrueHost database support

---

**Important Notes:**
- Keep your `.env` file secure and never commit it to Git
- Regularly update dependencies: `npm update`
- Monitor server resources (CPU, RAM, Disk)
- Set up automated backups

**Congratulations!** Your site should now be live at `https://yourdomain.com`

