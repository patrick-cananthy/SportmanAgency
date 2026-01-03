# Debug API Errors - Step by Step Guide

## Quick Test

Run this command to test all API endpoints:
```bash
node test-api-endpoints.js
```

This will show you which endpoints are working and which are failing.

## Step 1: Check Server is Running

1. Open terminal where you ran `npm start`
2. You should see:
   ```
   ✓ MySQL Database Connected
   ✓ Database synced - All tables ready
   Server running on port 3005
   ```

If you see database errors, fix those first.

## Step 2: Test API Endpoints Directly

Open your browser and test each endpoint:

### Test News
```
http://localhost:3005/api/news?published=true&limit=4
```
**Expected**: JSON array of news articles

### Test Events
```
http://localhost:3005/api/events?published=true&upcoming=true&limit=6
```
**Expected**: JSON array of events

### Test Jobs
```
http://localhost:3005/api/jobs?published=true&open=true&limit=8
```
**Expected**: JSON array of jobs

### Test Talents
```
http://localhost:3005/api/talents?published=true
```
**Expected**: JSON array of talents

### Test Sales/Rentals
```
http://localhost:3005/api/sales-rentals?published=true&available=true&limit=12
```
**Expected**: JSON array of items

## Step 3: Check Browser Console

1. Open `http://localhost:3005` in browser
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Look for error messages
5. You should see logs like:
   - `Fetching news from: http://localhost:3005/api/news...`
   - `Loaded news from API: X articles`

## Step 4: Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for requests to `/api/...`
4. Click on each request to see:
   - **Status**: Should be 200 (green)
   - **Response**: Should show JSON data
   - **Headers**: Check if CORS headers are present

## Common Issues and Fixes

### Issue 1: "Failed to fetch" or Network Error

**Cause**: Server not running or wrong port

**Fix**:
1. Make sure server is running: `npm start`
2. Check the port in `.env` file matches what you're using
3. Access via `http://localhost:3005` (not file://)

### Issue 2: "404 Not Found"

**Cause**: Route not registered or wrong URL

**Fix**:
1. Check `server.js` - routes should be registered:
   ```javascript
   app.use('/api/events', require('./routes/events'));
   app.use('/api/jobs', require('./routes/jobs'));
   app.use('/api/talents', require('./routes/talents'));
   app.use('/api/sales-rentals', require('./routes/salesRentals'));
   ```
2. Check server logs for route registration messages

### Issue 3: "500 Internal Server Error"

**Cause**: Database error or server-side error

**Fix**:
1. Check server terminal for error messages
2. Verify database connection in `.env`
3. Check if database tables exist
4. Look for specific error in server logs

### Issue 4: "CORS error"

**Cause**: CORS not configured properly

**Fix**:
1. Check `server.js` has:
   ```javascript
   app.use(cors({
       origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
       credentials: true
   }));
   ```
2. Make sure you're accessing via `http://localhost:3005` not `file://`

### Issue 5: Empty Arrays Returned

**Cause**: No data in database

**Fix**:
1. This is normal if you haven't added any data yet
2. Use the admin panel to add test data
3. Or check database directly to see if tables have data

## Step 5: Check Database

1. Open MySQL Workbench
2. Connect to your database
3. Check if tables exist:
   ```sql
   SHOW TABLES;
   ```
4. Check if tables have data:
   ```sql
   SELECT COUNT(*) FROM events;
   SELECT COUNT(*) FROM jobs;
   SELECT COUNT(*) FROM talents;
   SELECT COUNT(*) FROM sales_rentals;
   ```

## Step 6: Enable Detailed Logging

The updated code now logs:
- The exact URL being fetched
- Response status codes
- Error messages
- Response data

Check browser console (F12) to see these logs.

## Still Not Working?

1. **Check server logs** - Look at terminal where `npm start` is running
2. **Check browser console** - F12 → Console tab
3. **Check network tab** - F12 → Network tab → See failed requests
4. **Run test script**: `node test-api-endpoints.js`
5. **Test endpoints directly** in browser

## What the Updated Code Does

The updated `index.html` now:
- ✅ Logs the exact URL being fetched
- ✅ Shows detailed error messages
- ✅ Handles empty responses gracefully
- ✅ Provides helpful error messages
- ✅ Detects if server is not running
- ✅ Works with any port automatically

Check the browser console to see what's happening!

