# Troubleshooting Guide

## Network Error on Login

If you're getting "Network error. Please try again" when trying to login, check the following:

### 1. Is the Server Running?

**Check if the server is running:**
```bash
# Windows PowerShell
Get-Process -Name node -ErrorAction SilentlyContinue
```

**Start the server:**
```bash
npm start
```

You should see:
```
MySQL Connected
Database synced
Server running on port 3005
Admin panel: http://localhost:3005/admin
```

### 2. Database Connection Issues

**Check your `.env` file:**
```
PORT=3005
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sportsmandb
DB_USER=root
DB_PASSWORD=C0ngr@+ul@+10n$
```

**Verify MySQL is running:**
- Open MySQL Workbench
- Try to connect to your database
- Make sure the database `sportsmandb` exists

**Create the database if it doesn't exist:**
```sql
CREATE DATABASE sportsmandb;
```

### 3. Port Mismatch

The admin panel now uses relative paths (`/api` instead of `http://localhost:3000/api`), so it should work regardless of the port.

**If you want to use port 3000:**
- Change `PORT=3005` to `PORT=3000` in your `.env` file
- Restart the server

### 4. CORS Issues

The server has CORS enabled, but if you're accessing from a different origin, make sure:
- The server is running
- You're accessing the admin panel from the same origin (e.g., `http://localhost:3005/admin`)

### 5. Check Browser Console

Open browser Developer Tools (F12) and check:
- **Console tab**: Look for JavaScript errors
- **Network tab**: Check if API requests are being made and what errors they return

### 6. Verify Routes Are Working

Test the API directly:
```bash
# Test login endpoint
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@sportsmantalent.com\",\"password\":\"admin123\"}"
```

### 7. Common Issues

**"MySQL Connection Error":**
- MySQL server is not running
- Wrong database credentials in `.env`
- Database doesn't exist

**"Cannot find module":**
- Run `npm install` to install dependencies

**"Port already in use":**
- Another process is using port 3005
- Change the port in `.env` or stop the other process

### 8. Reset Everything

If nothing works:

1. **Stop the server** (Ctrl+C)

2. **Check database:**
   ```sql
   -- In MySQL Workbench
   USE sportsmandb;
   SHOW TABLES;
   ```

3. **Recreate admin user:**
   ```bash
   node setup.js
   ```

4. **Start server:**
   ```bash
   npm start
   ```

5. **Access admin panel:**
   - Go to: `http://localhost:3005/admin`
   - Login with: `admin@sportsmantalent.com` / `admin123`

### Still Having Issues?

Check the server console output for specific error messages. Common errors:
- Database connection errors
- Missing environment variables
- Port conflicts
- Module not found errors

