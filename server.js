const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy (required for Render and other hosting platforms behind proxies)
// Trust only the first proxy (Render's load balancer)
// This is more secure than trusting all proxies
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Rate Limiting
// With trust proxy set to 1, express-rate-limit will automatically handle IP extraction
// and IPv6 addresses correctly, so we don't need a custom keyGenerator
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true
});

// More lenient rate limiter for authenticated admin operations
const adminApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Higher limit for admin operations
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter for token verification (more lenient since it's called periodically)
const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Allow 50 verify requests per 15 minutes (should be enough for periodic checks)
    message: 'Too many verification requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting BEFORE routes
// Note: Order matters - rate limiters must be applied before routes are registered
// We'll apply them after routes are registered but before they're used

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
let User, News, Like, Comment, Event, Job, Talent, SalesRental, Service;

try {
    User = require('./models/User')(sequelize);
    News = require('./models/News')(sequelize);
    Like = require('./models/Like')(sequelize);
    Comment = require('./models/Comment')(sequelize);
    Event = require('./models/Event')(sequelize);
    Job = require('./models/Job')(sequelize);
    Talent = require('./models/Talent')(sequelize);
    SalesRental = require('./models/SalesRental')(sequelize);
    Service = require('./models/Service')(sequelize);
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
app.locals.models = { User, News, Like, Comment, Event, Job, Talent, SalesRental, Service };

// Apply rate limiting to specific routes BEFORE registering them
// Note: Express applies middleware in order, so more specific routes must come first
// Auth routes (very strict)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify', verifyLimiter); // More lenient for verify endpoint
// Admin routes (more lenient - will be further restricted by auth middleware)
app.use('/api/users', adminApiLimiter);
app.use('/api/news', adminApiLimiter);
app.use('/api/events', adminApiLimiter);
app.use('/api/jobs', adminApiLimiter);
app.use('/api/talents', adminApiLimiter);
app.use('/api/sales-rentals', adminApiLimiter);
app.use('/api/comments', adminApiLimiter);
app.use('/api/services', adminApiLimiter);
// Public API routes (stricter - applied last to catch remaining routes)
app.use('/api/', apiLimiter);

// Routes
try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/news', require('./routes/news'));
    app.use('/api/content', require('./routes/content'));
    app.use('/api/likes', require('./routes/likes'));
    app.use('/api/comments', require('./routes/comments'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/events', require('./routes/events'));
    app.use('/api/jobs', require('./routes/jobs'));
    app.use('/api/talents', require('./routes/talents'));
    app.use('/api/sales-rentals', require('./routes/salesRentals'));
    app.use('/api/services', require('./routes/services'));
    app.use('/api/contact', require('./routes/contact'));
    console.log('✓ Routes registered successfully');
} catch (error) {
    console.error('✗ Error registering routes:', error);
    process.exit(1);
}

// Serve admin panel
app.use('/admin', express.static('admin'));

// Ensure upload directories exist
const uploadDirs = [
    'uploads/news',
    'uploads/events',
    'uploads/jobs',
    'uploads/talents',
    'uploads/sales-rentals',
    'uploads/services'
];

uploadDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created upload directory: ${dir}`);
    }
});

// Test connection and sync models
sequelize.authenticate()
    .then(() => {
        const dbType = process.env.DB_DIALECT || 'mysql';
        console.log(`✓ ${dbType.toUpperCase()} Database Connected`);
        // Sync database (create tables if they don't exist)
        return sequelize.sync({ alter: true });
    })
    .then(async () => {
        console.log('✓ Database synced - All tables ready');
        
        // Auto-create default admin if none exists
        try {
            const existingAdmin = await User.findOne({
                where: { role: 'admin' }
            });
            
            if (!existingAdmin) {
                const defaultEmail = 'admin@sportsmantalent.com';
                const defaultUsername = 'admin';
                const defaultPassword = 'Admin@2026';
                
                // Check if username or email is already taken
                const existingUser = await User.findOne({
                    where: {
                        [require('sequelize').Op.or]: [
                            { email: defaultEmail },
                            { username: defaultUsername }
                        ]
                    }
                });
                
                if (!existingUser) {
                    const admin = await User.create({
                        username: defaultUsername,
                        email: defaultEmail,
                        password: defaultPassword, // Will be hashed by beforeCreate hook
                        role: 'admin',
                        lastActivity: new Date()
                    });
                    
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('✓ Default Admin Created');
                    console.log('   Username: admin');
                    console.log('   Email: admin@sportsmantalent.com');
                    console.log('   Password: Admin@2026');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('⚠️  IMPORTANT: Change this password after first login!');
                } else {
                    console.log('⚠️  Admin already exists or username/email is taken');
                    console.log('   Existing user:', existingUser.email, existingUser.username);
                }
            } else {
                console.log('✓ Admin account exists');
                console.log('   Admin email:', existingAdmin.email);
                console.log('   Admin username:', existingAdmin.username);
            }
        } catch (error) {
            console.error('⚠️  Could not create default admin:', error.message);
            console.error('   Error details:', error);
        }
    })
    .catch(err => {
        console.error('✗ Database Error:', err.message);
        console.error('   → Check your .env file and database connection');
        console.error('   → Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are correct');
        console.error('   → Make sure database server is running and accessible');
        
        // Log environment variables for debugging (without sensitive data)
        console.error('\n   Current Database Configuration:');
        console.error('   DB_DIALECT:', process.env.DB_DIALECT || 'not set');
        console.error('   DB_HOST:', process.env.DB_HOST || 'not set');
        console.error('   DB_PORT:', process.env.DB_PORT || 'not set');
        console.error('   DB_NAME:', process.env.DB_NAME || 'not set');
        console.error('   DB_USER:', process.env.DB_USER || 'not set');
        console.error('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');
        console.error('   MYSQL_URL:', process.env.MYSQL_URL ? 'set' : 'not set');
        console.error('   DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'not set');
        
        if (process.env.DB_DIALECT === 'postgres') {
            console.error('   → For PostgreSQL: Check SSL settings and connection string');
        } else {
            console.error('   → For MySQL: Check if external connections are allowed');
            console.error('   → For Railway: Try using MYSQL_URL connection string instead');
        }
        
        // Don't exit in production - let the app try to reconnect
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});

