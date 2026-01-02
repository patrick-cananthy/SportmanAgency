# Fix Database Timeout Error

## Why You're Getting This Error

Your app is trying to connect to a database, but:
- ❌ No database exists on Render yet, OR
- ❌ Environment variables are pointing to wrong database, OR
- ❌ Trying to connect to local MySQL (which Render can't access)

## ✅ Quick Fix (5 minutes)

### Step 1: Create PostgreSQL Database on Render

1. **In Render Dashboard:**
   - Click **"New +"** button (top right)
   - Click **"PostgreSQL"**

2. **Fill in:**
   - **Name**: `sportsman-db`
   - **Database**: (leave default or name it `sportsman_db`)
   - **Plan**: **Free** ✅
   - **Region**: Same region as your web service

3. **Click "Create Database"**
4. **Wait 2-3 minutes** for it to be created

### Step 2: Get Database Connection Details

1. **Click on your database** (`sportsman-db`)
2. **You'll see connection details. Copy these:**

   Look for:
   - **Internal Database URL** (starts with `postgresql://`)
   - OR individual values:
     - **Host**: Something like `dpg-xxxxx-a.oregon-postgres.render.com`
     - **Port**: `5432`
     - **Database**: Something like `sportsman_db_xxxx`
     - **User**: Something like `sportsman_user`
     - **Password**: (shown once - **COPY IT NOW!**)

### Step 3: Update Your Web Service Environment Variables

1. **Go to your Web Service** (the one showing the error)
2. **Click "Environment"** tab
3. **Delete old database variables** (if any):
   - Delete `DB_HOST` (if pointing to localhost or wrong host)
   - Delete `DB_USER` (if wrong)
   - Delete `DB_PASSWORD` (if wrong)
   - Delete `DB_NAME` (if wrong)

4. **Add/Update these variables** (click "Add Environment Variable" for each):

```
DB_DIALECT = postgres
DB_HOST = [paste the Host from database - e.g., dpg-xxxxx-a.oregon-postgres.render.com]
DB_PORT = 5432
DB_NAME = [paste Database name from database]
DB_USER = [paste User from database]
DB_PASSWORD = [paste Password from database - the one you copied!]
```

**Important:**
- Replace `[paste...]` with actual values from your database
- Make sure `DB_DIALECT = postgres` (not mysql)
- No spaces around the `=` sign
- Copy values exactly as shown

### Step 4: Verify Other Variables

Make sure you also have:

```
NODE_ENV = production
PORT = 10000
JWT_SECRET = SuperSecretKey123!ChangeThis
EMAIL_USER = sportsmantalenta56@gmail.com
EMAIL_PASS = [your Gmail app password]
ALLOWED_ORIGINS = https://sportmanagency-1.onrender.com
```

### Step 5: Redeploy

1. **Scroll down** in Environment tab
2. **Click "Save Changes"**
3. **Go to "Events" tab**
4. **Click "Manual Deploy"** → **"Deploy latest commit"**
5. **Wait 5-10 minutes**
6. **Check logs** - Should see: `✓ POSTGRES Database Connected` ✅

---

## 🔍 How to Verify It's Working

After redeploy, check the logs. You should see:

```
✓ POSTGRES Database Connected
✓ Database synced - All tables ready
Server running on port 10000
```

If you still see "Database Error", check:
1. ✅ Database is "Available" (green status)
2. ✅ All environment variables are correct
3. ✅ No typos in values
4. ✅ `DB_DIALECT = postgres` is set

---

## ❌ Common Mistakes

### Mistake 1: Using `localhost` as DB_HOST
- ❌ `DB_HOST = localhost` (won't work on Render)
- ✅ `DB_HOST = dpg-xxxxx-a.oregon-postgres.render.com` (correct)

### Mistake 2: Missing DB_DIALECT
- ❌ Not setting `DB_DIALECT = postgres`
- ✅ Must set `DB_DIALECT = postgres`

### Mistake 3: Wrong Database Type
- ❌ Trying to use MySQL from MyTrueHost (needs external connection setup)
- ✅ Use Render PostgreSQL (works immediately)

### Mistake 4: Typos in Values
- ❌ Extra spaces: `DB_HOST = dpg-xxxxx...` (space before =)
- ✅ No spaces: `DB_HOST=dpg-xxxxx...`

---

## 🎯 Summary

**The Problem:**
- Your app is trying to connect to a database that doesn't exist or isn't accessible

**The Solution:**
1. Create PostgreSQL database on Render
2. Copy connection details
3. Update environment variables
4. Redeploy

**That's it!** After this, your database will connect successfully. 🎉

---

## 🆘 Still Not Working?

1. **Check database status** - Should be green "Available"
2. **Double-check environment variables** - Copy exactly, no typos
3. **Check logs** - Look for specific error messages
4. **Verify DB_DIALECT** - Must be `postgres` (not `mysql`)

