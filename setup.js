// Setup script to create initial admin user
const sequelize = require('./config/database');
require('dotenv').config();

async function setup() {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('Connected to MySQL');

        // Import and initialize models
        const User = require('./models/User')(sequelize);
        
        // Sync database
        await sequelize.sync({ alter: true });
        console.log('Database synced');

        // Check if admin exists
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            username: 'admin',
            email: 'admin@sportsmantalent.com',
            password: 'admin123', // Change this in production!
            role: 'admin'
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@sportsmantalent.com');
        console.log('Password: admin123');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('Setup error:', error);
        process.exit(1);
    }
}

setup();

