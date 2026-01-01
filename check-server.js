// Quick diagnostic script to check server setup
const sequelize = require('./config/database');
require('dotenv').config();

async function checkSetup() {
    console.log('=== Server Diagnostic Check ===\n');
    
    // Check .env
    console.log('1. Environment Variables:');
    console.log('   PORT:', process.env.PORT || '3000 (default)');
    console.log('   DB_HOST:', process.env.DB_HOST || 'localhost (default)');
    console.log('   DB_NAME:', process.env.DB_NAME || 'sportsman_agency (default)');
    console.log('   DB_USER:', process.env.DB_USER || 'root (default)');
    console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : '(empty)');
    console.log('');
    
    // Check database connection
    console.log('2. Database Connection:');
    try {
        await sequelize.authenticate();
        console.log('   ✓ Database connection successful');
    } catch (error) {
        console.log('   ✗ Database connection failed:', error.message);
        console.log('   → Make sure MySQL is running and credentials are correct');
        return;
    }
    
    // Check models
    console.log('3. Models:');
    try {
        const User = require('./models/User')(sequelize);
        const News = require('./models/News')(sequelize);
        const Like = require('./models/Like')(sequelize);
        const Comment = require('./models/Comment')(sequelize);
        console.log('   ✓ All models loaded successfully');
        
        // Check if tables exist
        console.log('4. Database Tables:');
        const [results] = await sequelize.query("SHOW TABLES");
        const tables = results.map(r => Object.values(r)[0]);
        console.log('   Found tables:', tables.join(', ') || 'None');
        
        const requiredTables = ['users', 'news', 'likes', 'comments'];
        const missingTables = requiredTables.filter(t => !tables.includes(t));
        
        if (missingTables.length > 0) {
            console.log('   ⚠ Missing tables:', missingTables.join(', '));
            console.log('   → Run: node server.js (it will create tables automatically)');
        } else {
            console.log('   ✓ All required tables exist');
        }
        
    } catch (error) {
        console.log('   ✗ Model loading failed:', error.message);
    }
    
    // Check routes
    console.log('5. Routes:');
    const routes = [
        './routes/auth',
        './routes/news',
        './routes/content',
        './routes/likes',
        './routes/comments',
        './routes/users'
    ];
    
    routes.forEach(route => {
        try {
            require(route);
            console.log(`   ✓ ${route} loaded`);
        } catch (error) {
            console.log(`   ✗ ${route} failed:`, error.message);
        }
    });
    
    console.log('\n=== Diagnostic Complete ===');
    console.log('\nIf you see errors above, fix them before starting the server.');
    console.log('To start the server: node server.js');
    
    process.exit(0);
}

checkSetup().catch(err => {
    console.error('Diagnostic error:', err);
    process.exit(1);
});

