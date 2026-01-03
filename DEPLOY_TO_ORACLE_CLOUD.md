# Deploy to Oracle Cloud - Complete Guide

**Step-by-step guide to deploy your SportAgency application to Oracle Cloud (Always Free)**

---

## 📋 What You Need

1. **Credit Card** (for verification only - won't be charged)
2. **Email address** (for Oracle Cloud account)
3. **Basic terminal/SSH knowledge**

---

## 🆓 Oracle Cloud Always Free Tier

### What You Get (Always Free):

- **2 AMD Compute VMs**:
  - 1/8 OCPU (1 vCPU core)
  - 1GB RAM each
  - 0.48 Gbps network bandwidth
  
- **200GB Block Storage** (total)
- **10TB Data Transfer** per month
- **2 Autonomous Databases** (if needed)
- **No expiration** - truly free forever!

### Limitations:

- Limited to specific regions (check availability)
- VMs may be reclaimed if not used for extended periods
- Credit card required for verification (not charged)

---

## 🚀 Step 1: Create Oracle Cloud Account

### 1.1 Sign Up

1. Go to **https://cloud.oracle.com**
2. Click **"Start for Free"** or **"Sign Up"**
3. Fill in your details:
   - Email address
   - Password
   - Country/Region
4. Click **"Verify My Email"**
5. Check your email and verify

### 1.2 Complete Registration

1. Enter your **personal information**
2. Add **credit card** (for verification only - won't be charged)
3. Choose your **home region**:
   - Recommended: **US East (Ashburn)** or **US West (Phoenix)**
   - Check which regions offer Always Free
4. Accept terms and conditions
5. Click **"Start my free trial"**

### 1.3 Wait for Account Setup

- Account setup takes **5-10 minutes**
- You'll receive a confirmation email
- Once ready, you can access the dashboard

---

## 🖥️ Step 2: Create Compute Instance (VM)

### 2.1 Navigate to Compute

1. Log in to **Oracle Cloud Console**
2. Click **☰ (Menu)** → **Compute** → **Instances**
3. Click **"Create Instance"**

### 2.2 Configure Instance

#### Basic Information:
- **Name**: `sportsman-agency-server`
- **Placement**: Keep default
- **Image**: Click **"Edit"** → Select **"Canonical Ubuntu 22.04"** or **"Oracle Linux 8"**
- **Shape**: 
  - Click **"Edit"**
  - Select **"VM.Standard.E2.1.Micro"** (Always Free eligible)
  - This gives you: 1/8 OCPU, 1GB RAM

#### Networking:
- **Virtual Cloud Network**: Create new VCN (if first time)
  - Name: `sportsman-vcn`
  - Use default settings
- **Subnet**: Use default
- **Public IP**: ✅ **Assign a public IPv4 address**

#### Add SSH Keys:
- **SSH Keys**: Choose one:
  - **Option A**: Generate new key pair (download private key!)
  - **Option B**: Paste your existing public key
  - **Option C**: Let Oracle generate for you

**⚠️ IMPORTANT**: Save your private key! You'll need it to SSH into the server.

### 2.3 Create Instance

1. Review your settings
2. Click **"Create"**
3. Wait **2-3 minutes** for instance to provision
4. Note your **Public IP address** (you'll need this!)

---

## 🔐 Step 3: Configure Security Rules (Firewall)

### 3.1 Open Required Ports

1. In your instance details, click **"Security List"** link
2. Click **"Default Security List"**
3. Click **"Add Ingress Rules"**

#### Add Rule 1: HTTP (Port 80)
- **Source Type**: CIDR
- **Source CIDR**: `0.0.0.0/0`
- **IP Protocol**: TCP
- **Destination Port Range**: `80`
- **Description**: `Allow HTTP`

#### Add Rule 2: HTTPS (Port 443)
- **Source Type**: CIDR
- **Source CIDR**: `0.0.0.0/0`
- **IP Protocol**: TCP
- **Destination Port Range**: `443`
- **Description**: `Allow HTTPS`

#### Add Rule 3: Your App Port (Port 3005)
- **Source Type**: CIDR
- **Source CIDR**: `0.0.0.0/0`
- **IP Protocol**: TCP
- **Destination Port Range**: `3005`
- **Description**: `Allow SportAgency App`

#### Add Rule 4: SSH (Port 22) - Usually already open
- **Source Type**: CIDR
- **Source CIDR**: `0.0.0.0/0`
- **IP Protocol**: TCP
- **Destination Port Range**: `22`
- **Description**: `Allow SSH`

4. Click **"Add Ingress Rules"** for each
5. Click **"Save"**

---

## 📡 Step 4: Connect to Your Server (SSH)

### 4.1 Windows (Using PuTTY or PowerShell)

#### Option A: PowerShell (Windows 10/11)

1. Open **PowerShell**
2. Navigate to folder with your private key:
   ```powershell
   cd C:\path\to\your\key
   ```
3. Set correct permissions:
   ```powershell
   icacls your-key.key /inheritance:r
   icacls your-key.key /grant:r "$($env:USERNAME):(R)"
   ```
4. Connect:
   ```powershell
   ssh -i your-key.key ubuntu@YOUR_PUBLIC_IP
   ```
   *(Replace `ubuntu` with `opc` if using Oracle Linux)*

#### Option B: PuTTY

1. Download **PuTTY** and **PuTTYgen**
2. Convert your `.key` to `.ppk` using PuTTYgen
3. Open PuTTY
4. Enter:
   - **Host**: `YOUR_PUBLIC_IP`
   - **Port**: `22`
   - **Connection Type**: SSH
5. Go to **Connection** → **SSH** → **Auth**
6. Browse and select your `.ppk` file
7. Click **"Open"**

### 4.2 Mac/Linux

```bash
chmod 400 your-key.key
ssh -i your-key.key ubuntu@YOUR_PUBLIC_IP
```

*(Replace `ubuntu` with `opc` if using Oracle Linux)*

---

## 🛠️ Step 5: Set Up Server Environment

### 5.1 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 5.2 Install Node.js

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 5.3 Install Git

```bash
sudo apt install -y git
```

### 5.4 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

PM2 will keep your app running even after you disconnect.

### 5.5 Install Nginx (Web Server)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 Step 6: Deploy Your Application

### 6.1 Clone Your Repository

```bash
# Create app directory
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps

# Clone your repository
git clone https://github.com/YOUR_USERNAME/sportsman-agency.git
cd sportsman-agency
```

### 6.2 Install Dependencies

```bash
npm install
```

### 6.3 Create Environment File

```bash
nano .env
```

Add these variables:

```env
# Database Configuration
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sportsman_agency
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Application
PORT=3005
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this

# CORS
ALLOWED_ORIGINS=http://YOUR_PUBLIC_IP:3005,http://YOUR_DOMAIN
```

Save: `Ctrl + X`, then `Y`, then `Enter`

---

## 🗄️ Step 7: Set Up Database

### 7.1 Install MySQL

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 7.2 Secure MySQL

```bash
sudo mysql_secure_installation
```

Follow prompts:
- Set root password
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### 7.3 Create Database and User

```bash
sudo mysql -u root -p
```

In MySQL prompt:

```sql
CREATE DATABASE sportsman_agency;
CREATE USER 'sportsman_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON sportsman_agency.* TO 'sportsman_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 7.4 Update .env with Database Credentials

```bash
nano .env
```

Update:
```
DB_USER=sportsman_user
DB_PASSWORD=your_secure_password
DB_NAME=sportsman_agency
```

---

## 🚀 Step 8: Start Your Application

### 8.1 Test Run

```bash
npm start
```

Check if app starts correctly. Press `Ctrl + C` to stop.

### 8.2 Start with PM2

```bash
# Start app with PM2
pm2 start server.js --name sportsman-agency

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Copy and run the command it gives you
```

### 8.3 Check Status

```bash
pm2 status
pm2 logs sportsman-agency
```

---

## 🌐 Step 9: Configure Nginx (Reverse Proxy)

### 9.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/sportsman-agency
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;

    # Increase body size for file uploads
    client_max_body_size 50M;

    # Serve static files
    location / {
        root /home/ubuntu/apps/sportsman-agency/public;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Proxy API requests to Node.js
    location /api {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy admin panel
    location /admin {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and exit.

### 9.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/sportsman-agency /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

---

## 🔒 Step 10: Set Up SSL (HTTPS) with Let's Encrypt

### 10.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Get SSL Certificate

**Note**: You need a domain name for SSL. If you don't have one, skip this step.

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts:
- Enter email address
- Agree to terms
- Choose redirect HTTP to HTTPS: **Yes**

### 10.3 Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## ✅ Step 11: Verify Deployment

### 11.1 Test Your Application

Visit in browser:
- **HTTP**: `http://YOUR_PUBLIC_IP`
- **HTTPS**: `https://YOUR_DOMAIN` (if configured)

### 11.2 Test API Endpoints

```
http://YOUR_PUBLIC_IP/api/news
http://YOUR_PUBLIC_IP/api/events
```

### 11.3 Test Admin Panel

```
http://YOUR_PUBLIC_IP/admin
```

**Default Credentials**:
- Email: `admin@sportsmantalent.com`
- Password: `Admin@2026`

**⚠️ Change this immediately!**

---

## 🔄 Step 12: Set Up Automatic Updates

### 12.1 Create Update Script

```bash
nano /home/ubuntu/update-app.sh
```

Add:

```bash
#!/bin/bash
cd /home/ubuntu/apps/sportsman-agency
git pull origin main
npm install
pm2 restart sportsman-agency
```

Make executable:

```bash
chmod +x /home/ubuntu/update-app.sh
```

### 12.2 Manual Update

When you push changes to GitHub:

```bash
/home/ubuntu/update-app.sh
```

---

## 📊 Step 13: Monitoring and Maintenance

### 13.1 Monitor Application

```bash
# View logs
pm2 logs sportsman-agency

# View status
pm2 status

# Monitor resources
pm2 monit
```

### 13.2 Check System Resources

```bash
# CPU and Memory
htop

# Disk space
df -h

# Network
netstat -tulpn
```

### 13.3 Backup Database

Create backup script:

```bash
nano /home/ubuntu/backup-db.sh
```

Add:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u sportsman_user -p'your_password' sportsman_agency > /home/ubuntu/backups/db_backup_$DATE.sql
```

Make executable and schedule:

```bash
chmod +x /home/ubuntu/backup-db.sh
mkdir -p /home/ubuntu/backups

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

---

## 🛠️ Troubleshooting

### Problem: Can't SSH into server

**Solution**:
1. Check security rules (port 22 open)
2. Verify public IP is correct
3. Check private key permissions
4. Try: `ssh -v ubuntu@YOUR_IP` for verbose output

### Problem: Application won't start

**Solution**:
1. Check logs: `pm2 logs sportsman-agency`
2. Verify environment variables: `cat .env`
3. Check database connection
4. Verify port 3005 is not in use: `sudo netstat -tulpn | grep 3005`

### Problem: 502 Bad Gateway

**Solution**:
1. Check if app is running: `pm2 status`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify Nginx config: `sudo nginx -t`
4. Check app logs: `pm2 logs`

### Problem: Database connection error

**Solution**:
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check database credentials in `.env`
3. Test connection: `mysql -u sportsman_user -p sportsman_agency`
4. Verify firewall allows local connections

### Problem: Out of memory

**Solution**:
1. Check memory: `free -h`
2. Optimize Node.js: Use `--max-old-space-size=512`
3. Restart app: `pm2 restart sportsman-agency`
4. Consider upgrading (if needed)

---

## 🔒 Security Best Practices

- [ ] Changed default admin password
- [ ] Set strong `JWT_SECRET`
- [ ] Firewall configured (only necessary ports open)
- [ ] SSH key authentication (disable password login)
- [ ] Regular system updates: `sudo apt update && sudo apt upgrade`
- [ ] SSL certificate installed (if using domain)
- [ ] Database user has limited privileges
- [ ] Regular backups configured
- [ ] Fail2ban installed (optional but recommended)

### Install Fail2ban (Optional)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 💰 Cost Management

### Always Free Resources:

- ✅ 2 AMD Compute VMs (1/8 OCPU, 1GB RAM each)
- ✅ 200GB Block Storage
- ✅ 10TB Data Transfer/month
- ✅ 2 Autonomous Databases (if needed)

### What Costs Money:

- ❌ Additional VMs beyond 2
- ❌ More than 200GB storage
- ❌ More than 10TB data transfer
- ❌ Upgraded VM shapes

**Tip**: Monitor usage in Oracle Cloud Console → **Billing & Cost Management**

---

## 📝 Quick Reference

### Important Commands

```bash
# SSH into server
ssh -i your-key.key ubuntu@YOUR_PUBLIC_IP

# View app logs
pm2 logs sportsman-agency

# Restart app
pm2 restart sportsman-agency

# Update app
cd /home/ubuntu/apps/sportsman-agency && git pull && npm install && pm2 restart sportsman-agency

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql

# View system resources
htop
```

### Important Paths

- App directory: `/home/ubuntu/apps/sportsman-agency`
- Nginx config: `/etc/nginx/sites-available/sportsman-agency`
- Logs: `pm2 logs` or `/var/log/nginx/`
- Backups: `/home/ubuntu/backups/`

---

## ✅ Deployment Checklist

- [ ] Oracle Cloud account created
- [ ] Compute instance created
- [ ] Security rules configured
- [ ] SSH access working
- [ ] Node.js installed
- [ ] Application deployed
- [ ] Database set up
- [ ] Environment variables configured
- [ ] PM2 configured
- [ ] Nginx configured
- [ ] SSL certificate installed (if using domain)
- [ ] Application accessible
- [ ] Admin panel working
- [ ] Backups configured
- [ ] Monitoring set up

---

## 🎉 Success!

Your SportAgency application is now running on Oracle Cloud Always Free tier!

**Next Steps**:
1. Set up a custom domain (optional)
2. Configure automatic backups
3. Set up monitoring alerts
4. Optimize performance

---

## 📞 Support & Resources

- **Oracle Cloud Docs**: https://docs.oracle.com/en-us/iaas/
- **Oracle Cloud Status**: https://ocistatus.oraclecloud.com/
- **Community Forums**: https://community.oracle.com/

---

**Last Updated**: 2024
**Maintained by**: SportAgency Development Team

