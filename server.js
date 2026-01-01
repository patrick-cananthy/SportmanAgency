const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory FIRST (this will serve styles.css and script.js)
app.use(express.static('public'));

// Serve static directories
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('images'));

// Also serve CSS and JS from root as fallback (in case files are in root)
app.get('/styles.css', (req, res, next) => {
    const publicPath = path.join(__dirname, 'public', 'styles.css');
    const rootPath = path.join(__dirname, 'styles.css');
    
    // Try public first, then root
    if (require('fs').existsSync(publicPath)) {
        res.setHeader('Content-Type', 'text/css');
        res.sendFile(publicPath);
    } else if (require('fs').existsSync(rootPath)) {
        res.setHeader('Content-Type', 'text/css');
        res.sendFile(rootPath);
    } else {
        next();
    }
});

app.get('/script.js', (req, res, next) => {
    const publicPath = path.join(__dirname, 'public', 'script.js');
    const rootPath = path.join(__dirname, 'script.js');
    
    // Try public first, then root
    if (require('fs').existsSync(publicPath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(publicPath);
    } else if (require('fs').existsSync(rootPath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(rootPath);
    } else {
        next();
    }
});

// Serve index.html from root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Error loading page: ' + err.message);
        }
    });
});

// Initialize models
let User, News, Like, Comment;

try {
    User = require('./models/User')(sequelize);
    News = require('./models/News')(sequelize);
    Like = require('./models/Like')(sequelize);
    Comment = require('./models/Comment')(sequelize);
    console.log('✓ Models loaded successfully');
} catch (error) {
    console.error('✗ Error loading models:', error);
    process.exit(1);
}

// Define associations
try {
    News.hasMany(Like, { foreignKey: 'newsId', onDelete: 'CASCADE' });
    Like.belongsTo(News, { foreignKey: 'newsId' });
    
    News.hasMany(Comment, { foreignKey: 'newsId', onDelete: 'CASCADE' });
    Comment.belongsTo(News, { foreignKey: 'newsId' });
    console.log('✓ Model associations defined');
} catch (error) {
    console.error('✗ Error defining associations:', error);
}

// Make models available to routes
app.locals.models = { User, News, Like, Comment };

// Routes
try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/news', require('./routes/news'));
    app.use('/api/content', require('./routes/content'));
    app.use('/api/likes', require('./routes/likes'));
    app.use('/api/comments', require('./routes/comments'));
    app.use('/api/users', require('./routes/users'));
    console.log('✓ Routes registered successfully');
} catch (error) {
    console.error('✗ Error registering routes:', error);
    process.exit(1);
}

// Serve admin panel
app.use('/admin', express.static('admin'));

// Test connection and sync models
sequelize.authenticate()
    .then(() => {
        console.log('✓ MySQL Connected');
        // Sync database (create tables if they don't exist)
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('✓ Database synced - All tables ready');
    })
    .catch(err => {
        console.error('✗ Database Error:', err.message);
        console.error('   → Check your .env file and MySQL connection');
        console.error('   → Make sure MySQL server is running');
        process.exit(1);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});

