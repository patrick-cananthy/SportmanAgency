# Fix Errors - Quick Guide

## Problem Found
The diagnostic check shows that the `likes` and `comments` tables are missing from your database.

## Solution

### Step 1: Stop the Current Server
If your server is running, stop it by pressing `Ctrl+C` in the terminal.

### Step 2: Start the Server
Run this command:
```bash
node server.js
```

You should see:
```
✓ Models loaded successfully
✓ Model associations defined
✓ Routes registered successfully
✓ MySQL Connected
✓ Database synced - All tables ready
Server running on port 3005
```

### Step 3: Verify Tables Were Created
After starting the server, run the diagnostic again:
```bash
node check-server.js
```

You should now see:
```
✓ All required tables exist
```

## What This Does
When you start the server, it will automatically:
- Create the `likes` table
- Create the `comments` table
- Set up all relationships between tables

## If You Still Get Errors

### Check 1: Is MySQL Running?
- Open MySQL Workbench
- Try to connect to your database
- If you can't connect, start MySQL service

### Check 2: Database Credentials
Make sure your `.env` file has correct credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sportsmandb
DB_USER=root
DB_PASSWORD=your_password
```

### Check 3: Browser Console
Open browser Developer Tools (F12):
- **Console tab**: Check for JavaScript errors
- **Network tab**: Check if API requests are failing

### Check 4: Server Console
Look at your server terminal for error messages. The improved error handling will now show:
- ✓ for successful operations
- ✗ for errors with details

## Common Error Messages

**"MySQL Connection Error"**
- MySQL server is not running
- Wrong database credentials
- Database doesn't exist

**"Database sync error"**
- Permission issues
- Table already exists with different structure
- Try: `DROP TABLE likes, comments;` then restart server

**"Network error"**
- Server is not running
- Wrong port number
- Check browser console for specific API errors

