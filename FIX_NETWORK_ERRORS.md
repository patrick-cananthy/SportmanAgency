# Fix Network Errors - Backend Connection Issues

## Problem
You're seeing "Network error. Please try again" or "Error loading" messages for all backend features on localhost.

## Root Causes

1. **Server Not Running** - The backend server must be running for API calls to work
2. **Opening HTML File Directly** - Opening `index.html` directly (file://) won't work - you need to access it through the server
3. **Port Mismatch** - Server might be running on a different port
4. **Database Connection Issues** - Server might not have started due to database errors

## Solutions

### ✅ Solution 1: Start the Backend Server

**Step 1**: Open terminal/command prompt in the project directory

**Step 2**: Install dependencies (if not done):
```bash
npm install
```

**Step 3**: Create/check `.env` file:
```env
PORT=3005
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sportsmandb
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql
JWT_SECRET=your_secret_key_here
```

**Step 4**: Start the server:
```bash
npm start
```

You should see:
```
✓ MySQL Database Connected
✓ Database synced - All tables ready
Server running on port 3005
Admin panel: http://localhost:3005/admin
```

**Step 5**: Open browser and go to:
```
http://localhost:3005
```

**⚠️ IMPORTANT**: Don't open the HTML file directly! Always access through `http://localhost:3005` (or your configured port)

### ✅ Solution 2: Check Server Status

Run the server status checker:
```bash
node check-server-status.js
```

This will tell you if the server is running and accessible.

### ✅ Solution 3: Verify Database Connection

If the server won't start, check your database:

1. **Make sure MySQL is running**
   - Open MySQL Workbench
   - Try to connect to your database

2. **Verify database exists**:
   ```sql
   CREATE DATABASE IF NOT EXISTS sportsmandb;
   ```

3. **Check `.env` file** has correct credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=sportsmandb
   DB_USER=root
   DB_PASSWORD=your_actual_password
   ```

### ✅ Solution 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Go to **Network** tab
5. Check if API requests are being made
6. See what errors they return

### ✅ Solution 5: Updated Error Messages

The frontend now shows helpful error messages:
- If you open the file directly (file://), it will tell you to use the server
- If server is not running, it will tell you to start it
- Provides direct links to fix the issue

## Testing

### Test 1: Server Status
```bash
node check-server-status.js
```

### Test 2: API Endpoint
Open browser and go to:
```
http://localhost:3005/api/news
```

You should see JSON data, not an error.

### Test 3: Frontend
Open browser and go to:
```
http://localhost:3005
```

All sections should load data from the API.

## Common Error Messages

### "Network error. Please try again"
- **Cause**: Server is not running
- **Fix**: Run `npm start` in the project directory

### "Unable to connect to server"
- **Cause**: Server not running or wrong port
- **Fix**: 
  1. Check if server is running: `node check-server-status.js`
  2. Make sure you're accessing `http://localhost:3005` (or your configured port, not file://)

### "Please access this page through the server"
- **Cause**: Opening HTML file directly
- **Fix**: Use `http://localhost:3005` (or your configured port) instead of opening the file

### "Database Connection Error"
- **Cause**: MySQL not running or wrong credentials
- **Fix**: 
  1. Start MySQL server
  2. Check `.env` file credentials
  3. Verify database exists

## Quick Checklist

- [ ] Server is running (`npm start`)
- [ ] Accessing via `http://localhost:3005` (or your configured port, not file://)
- [ ] Database is running and accessible
- [ ] `.env` file has correct database credentials
- [ ] Port 3005 (or your configured port) is available (not used by another app)
- [ ] Browser console shows no CORS errors

## Still Having Issues?

1. **Check server logs** - Look at the terminal where you ran `npm start`
2. **Check browser console** - F12 → Console tab
3. **Check network tab** - F12 → Network tab → See failed requests
4. **Verify database** - Test connection in MySQL Workbench
5. **Check port** - Make sure nothing else is using port 3005 (or your configured port)

## Files Changed

- `index.html` - Updated all API fetch calls with better error handling
- `check-server-status.js` - New utility to check server status
- `START_SERVER.md` - Detailed startup guide

All API calls now:
- Use proper base URLs
- Show helpful error messages
- Detect if file is opened directly
- Provide troubleshooting steps

