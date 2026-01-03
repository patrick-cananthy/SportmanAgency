# How to Start the Backend Server

## Quick Start

1. **Open Terminal/Command Prompt** in the project directory

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Create/Check .env file** with your database configuration:
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

4. **Start the server**:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Verify server is running**:
   - You should see: `Server running on port 3005` (or whatever port is in your .env)
   - Open browser: `http://localhost:3005` (or your configured port)
   - Admin panel: `http://localhost:3005/admin`

## Check Server Status

Run this command to check if the server is running:
```bash
node check-server-status.js
```

## Common Issues

### "Network error" or "Unable to connect"

**Problem**: Frontend can't connect to backend

**Solutions**:
1. ✅ Make sure server is running (`npm start`)
2. ✅ Don't open HTML files directly (file://) - use `http://localhost:3000`
3. ✅ Check if port 3000 is available
4. ✅ Verify database connection in `.env` file

### "Database Connection Error"

**Problem**: Can't connect to MySQL database

**Solutions**:
1. ✅ Make sure MySQL server is running
2. ✅ Check database credentials in `.env` file
3. ✅ Verify database exists: `CREATE DATABASE sportsmandb;`
4. ✅ Test connection in MySQL Workbench first

### "Port already in use"

**Problem**: Port 3005 (or your configured port) is already taken

**Solutions**:
1. Change PORT in `.env` file to another port (e.g., 3006)
2. Or stop the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3005
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3005 | xargs kill
   ```

## Testing the API

Once the server is running, test the API:

```bash
# Test news endpoint (use your actual port)
curl http://localhost:3005/api/news

# Test server status
node check-server-status.js
```

## Access Points

- **Frontend**: http://localhost:3005 (or your configured port)
- **Admin Panel**: http://localhost:3005/admin
- **API Base**: http://localhost:3005/api

## Next Steps

1. Start the server: `npm start`
2. Open browser: `http://localhost:3005` (or your configured port from .env)
3. If you see errors, check the console output
4. Verify database connection is successful
5. Test the admin panel login

