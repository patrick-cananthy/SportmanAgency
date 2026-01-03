/**
 * Script to check if admin user exists and create one if needed
 * Run this to verify/administer admin users in your database
 */

require('dotenv').config();
const sequelize = require('./config/database');

async function checkAdminUser() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Load models (same way as server.js)
        const fs = require('fs');
        const path = require('path');
        const models = {};
        const modelsPath = path.join(__dirname, 'models');
        
        // Load all model files
        fs.readdirSync(modelsPath)
            .filter(file => file.endsWith('.js') && file !== 'index.js')
            .forEach(file => {
                const model = require(path.join(modelsPath, file))(sequelize);
                models[model.name] = model;
            });
        
        // Set up associations
        Object.keys(models).forEach(modelName => {
            if (models[modelName].associate) {
                models[modelName].associate(models);
            }
        });
        
        const User = models.User;

        // Check for admin users
        const admins = await User.findAll({
            where: { role: 'admin' },
            attributes: ['id', 'username', 'email', 'role', 'createdAt']
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin Users in Database:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (admins.length === 0) {
            console.log('❌ No admin users found!');
            console.log('\nCreating default admin user...');
            
            const defaultEmail = 'admin@sportsmantalent.com';
            const defaultUsername = 'admin';
            const defaultPassword = 'Admin@2026';
            
            const admin = await User.create({
                username: defaultUsername,
                email: defaultEmail,
                password: defaultPassword,
                role: 'admin',
                lastActivity: new Date()
            });
            
            console.log('✓ Default Admin Created:');
            console.log('   Username: admin');
            console.log('   Email: admin@sportsmantalent.com');
            console.log('   Password: Admin@2026');
        } else {
            console.log(`✓ Found ${admins.length} admin user(s):\n`);
            admins.forEach((admin, index) => {
                console.log(`   ${index + 1}. ${admin.username} (${admin.email})`);
                console.log(`      Created: ${admin.createdAt}`);
            });
        }

        // Check for all users
        const allUsers = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt']
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`All Users (${allUsers.length} total):`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Default Login Credentials:');
        console.log('   Email: admin@sportsmantalent.com');
        console.log('   Password: Admin@2026');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error:', error.message);
        console.error('   Details:', error);
        process.exit(1);
    }
}

checkAdminUser();

