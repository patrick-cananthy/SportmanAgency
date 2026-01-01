# MySQL Setup Guide

This guide will help you set up the MySQL database for the Sportsman Talent Agency backend.

## Option 1: Automatic Setup (Recommended)

The easiest way is to let the application create the tables automatically:

1. **Create the database in MySQL Workbench:**
   ```sql
   CREATE DATABASE sportsman_agency;
   ```

2. **Update your `.env` file with your MySQL credentials:**
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=sportsman_agency
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

3. **Run the setup script:**
   ```bash
   node setup.js
   ```
   
   This will:
   - Connect to your database
   - Create all necessary tables
   - Create the default admin user

## Option 2: Manual Setup

If you prefer to set up the database manually:

1. **Open MySQL Workbench**

2. **Create the database:**
   ```sql
   CREATE DATABASE sportsman_agency;
   USE sportsman_agency;
   ```

3. **Run the SQL script:**
   - Open `database_setup.sql` in MySQL Workbench
   - Execute the script to create all tables

4. **Create admin user:**
   - Run the `setup.js` script to create the admin user
   - Or manually insert a user (password will need to be bcrypt hashed)

## Verifying the Setup

After setup, you can verify in MySQL Workbench:

1. **Check tables exist:**
   ```sql
   SHOW TABLES;
   ```
   Should show: `users` and `news`

2. **Check admin user:**
   ```sql
   SELECT id, username, email, role FROM users WHERE role = 'admin';
   ```

## Connection Settings

Make sure your `.env` file has the correct MySQL connection settings:

```
DB_HOST=localhost          # Your MySQL host
DB_PORT=3306              # MySQL port (default is 3306)
DB_NAME=sportsman_agency   # Database name
DB_USER=root              # Your MySQL username
DB_PASSWORD=your_password # Your MySQL password
```

## Troubleshooting

**Connection Refused:**
- Make sure MySQL server is running
- Check if the port (3306) is correct
- Verify firewall settings

**Access Denied:**
- Check your MySQL username and password
- Ensure the user has privileges to create databases and tables
- Try connecting with MySQL Workbench first to verify credentials

**Database doesn't exist:**
- Create the database manually in MySQL Workbench
- Or grant CREATE DATABASE privilege to your MySQL user

## Next Steps

After setting up the database:

1. Start the server: `npm start`
2. Access admin panel: `http://localhost:3000/admin`
3. Login with default credentials:
   - Email: `admin@sportsmantalent.com`
   - Password: `admin123`
4. **Change the password immediately!**


