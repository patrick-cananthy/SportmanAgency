# Troubleshooting Login Issues

## Problem: "Invalid credentials" when trying to login

### Possible Causes:

1. **Default admin user wasn't created** (most common after fresh deployment)
2. **Wrong email or password**
3. **Database connection issues
4. **Email case sensitivity**

---

## Quick Fixes

### Solution 1: Check if Admin User Exists

Run this script to check and create admin user:

```bash
node check-admin-user.js
```

This will:
- Show all admin users in the database
- Create default admin if none exists
- Display login credentials

### Solution 2: Verify Default Credentials

**Default Admin Credentials:**
- **Email**: `admin@sportsmantalent.com`
- **Password**: `Admin@2026`

**Important Notes:**
- Email is case-insensitive (but use exactly as shown)
- Password is case-sensitive
- Make sure there are no extra spaces

### Solution 3: Check Railway Logs

1. Go to Railway dashboard
2. Click on your web service
3. Go to **"Deployments"** → **"Logs"**
4. Look for:
   - `✓ Default Admin Created` (admin was created)
   - `✓ Admin account exists` (admin already exists)
   - `⚠️ Could not create default admin` (error creating admin)

### Solution 4: Verify Database Connection

If you see database errors in logs:
1. Check database service is running in Railway
2. Verify environment variables are set correctly
3. Ensure database tables were created (check logs for "Database synced")

---

## Step-by-Step Debugging

### Step 1: Check Server Logs

Look for these messages when server starts:

```
✓ MYSQL Database Connected
✓ Database synced - All tables ready
✓ Default Admin Created
   Username: admin
   Email: admin@sportsmantalent.com
   Password: Admin@2026
```

If you DON'T see "Default Admin Created", the admin wasn't created.

### Step 2: Check Login Attempts

When you try to login, check logs for:
- `[AUTH] Login attempt failed: User not found` → User doesn't exist
- `[AUTH] Login attempt failed: Invalid password` → Wrong password
- `[AUTH] Login successful` → Login worked

### Step 3: Verify Email Format

Make sure you're using:
- ✅ `admin@sportsmantalent.com` (correct)
- ❌ `Admin@SportsmanTalent.com` (wrong case)
- ❌ `admin@SportsmanTalent.com` (wrong case)
- ❌ ` admin@sportsmantalent.com ` (extra spaces)

---

## Manual Admin Creation

If admin user doesn't exist, you can create it manually:

### Option A: Use the Check Script

```bash
node check-admin-user.js
```

### Option B: Create via API (if you have another admin)

```bash
POST /api/users
Headers: Authorization: Bearer YOUR_ADMIN_TOKEN
Body: {
  "username": "admin",
  "email": "admin@sportsmantalent.com",
  "password": "Admin@2026",
  "role": "admin"
}
```

### Option C: Direct Database Access

If you have database access:

```sql
-- Check existing users
SELECT id, username, email, role FROM users;

-- Create admin (password will be hashed automatically by app)
-- Note: You'll need to hash the password manually or use the app
```

---

## Common Issues

### Issue 1: "User not found"

**Cause**: Admin user wasn't created during deployment

**Fix**:
1. Run `node check-admin-user.js`
2. Or wait for server to create it on next restart
3. Check database connection is working

### Issue 2: "Invalid password"

**Cause**: Wrong password or password hash mismatch

**Fix**:
1. Use exact password: `Admin@2026`
2. Check for extra spaces
3. Password is case-sensitive
4. If still fails, reset password via database or create new admin

### Issue 3: Database not connected

**Cause**: Database connection failed, so admin wasn't created

**Fix**:
1. Check Railway database service is running
2. Verify environment variables (DB_HOST, DB_USER, etc.)
3. Check database connection in logs
4. Fix database connection first, then admin will be created

### Issue 4: Email case mismatch

**Cause**: Email lookup is case-sensitive in some cases

**Fix**:
- Use exactly: `admin@sportsmantalent.com`
- The code now handles case-insensitive, but use the exact format

---

## Verification Checklist

- [ ] Database is connected (check logs for "Database Connected")
- [ ] Tables were created (check logs for "Database synced")
- [ ] Admin user exists (run `check-admin-user.js` or check logs)
- [ ] Using correct email: `admin@sportsmantalent.com`
- [ ] Using correct password: `Admin@2026`
- [ ] No extra spaces in email or password
- [ ] Server is running and accessible
- [ ] API endpoint is reachable (`/api/auth/login`)

---

## Still Having Issues?

1. **Check Railway Logs**: Look for error messages
2. **Run Check Script**: `node check-admin-user.js`
3. **Verify Environment**: Make sure all database variables are set
4. **Test Database**: Ensure database connection works
5. **Check Network**: Verify Railway service is accessible

---

**Last Updated**: 2024

