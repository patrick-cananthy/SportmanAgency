# Sportsman Talent Agency - Backend CMS

This is the backend content management system for the Sportsman Talent Agency website. It allows administrators to manage news articles and other content.

## Features

- **News Management**: Create, edit, delete, and publish news articles
- **Image Upload**: Upload images for news articles
- **Authentication**: Secure login system with JWT tokens
- **Admin Panel**: User-friendly interface for content management
- **Statistics Dashboard**: View content statistics

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (local installation or MySQL hosting)
- MySQL Workbench (for database management)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MySQL database:**
   - Open MySQL Workbench
   - Create a new database: `sportsman_agency`
   - Or use an existing database

3. **Set up environment variables:**
   - Create a `.env` file in the root directory
   - Add the following:
     ```
     PORT=3000
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=sportsman_agency
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     ```

4. **Create uploads directory:**
   ```bash
   mkdir -p uploads/news
   ```

5. **Start MySQL:**
   - Make sure MySQL server is running
   - Verify your database credentials in `.env`

6. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Create admin user:**
   ```bash
   node setup.js
   ```
   
   This creates a default admin:
   - Email: `admin@sportsmantalent.com`
   - Password: `admin123`
   
   ⚠️ **Change the password after first login!**

## Creating an Admin User

**Option 1: Using the setup script (Recommended)**
```bash
node setup.js
```

**Option 2: Using API**
You can create an admin user by making a POST request to `/api/auth/register`:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@sportsmantalent.com",
    "password": "yourpassword",
    "role": "admin"
  }'
```

Or use a tool like Postman to make the request.

## Accessing the Admin Panel

1. Start the server
2. Navigate to: `http://localhost:3000/admin`
3. Login with your credentials

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### News
- `GET /api/news` - Get all news (public)
- `GET /api/news/:id` - Get single news item (public)
- `POST /api/news` - Create news (protected)
- `PUT /api/news/:id` - Update news (protected)
- `DELETE /api/news/:id` - Delete news (protected, admin only)

### Content
- `GET /api/content/stats` - Get statistics (protected)

## Frontend Integration

Update your frontend `script.js` to fetch news from the API:

```javascript
// Fetch news from API
async function loadNews() {
    try {
        const response = await fetch('http://localhost:3000/api/news?published=true&limit=4');
        const news = await response.json();
        displayNews(news);
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function displayNews(news) {
    const newsGrid = document.querySelector('.news-grid');
    // Update the news grid with fetched data
}
```

## Security Notes

- Change the `JWT_SECRET` in production
- Use strong passwords for admin accounts
- Consider adding rate limiting for production
- Use HTTPS in production
- Regularly update dependencies

## Troubleshooting

**MySQL Connection Error:**
- Make sure MySQL server is running
- Check your database credentials in `.env`
- Verify the database exists in MySQL Workbench
- Test connection in MySQL Workbench first

**Image Upload Issues:**
- Ensure `uploads/news` directory exists
- Check file permissions
- Verify file size limits (currently 5MB)

**Authentication Issues:**
- Clear browser localStorage
- Check JWT_SECRET is set correctly
- Verify token expiration

## Support

For issues or questions, please contact the development team.

