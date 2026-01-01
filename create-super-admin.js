const sequelize = require('./config/database');
require('dotenv').config();

async function createSuperAdmin() {
    try {
        const User = require('./models/User')(sequelize);
        
        await sequelize.authenticate();
        console.log('✓ Database connected');
        
        await sequelize.sync({ alter: true });
        console.log('✓ Models synced');
        
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const question = (query) => new Promise(resolve => rl.question(query, resolve));
        
        console.log('\n=== Create Super Admin Account ===\n');
        
        const username = await question('Username: ');
        const email = await question('Email: ');
        const password = await question('Password (min 6 characters): ');
        
        if (password.length < 6) {
            console.error('❌ Password must be at least 6 characters');
            process.exit(1);
        }
        
        // Check if user exists
        const existingUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [{ email }, { username }]
            }
        });
        
        if (existingUser) {
            console.error('❌ User with this username or email already exists');
            process.exit(1);
        }
        
        // Create super admin
        const superAdmin = await User.create({
            username,
            email,
            password,
            role: 'super_admin',
            lastActivity: new Date()
        });
        
        console.log('\n✅ Super Admin created successfully!');
        console.log(`   Username: ${superAdmin.username}`);
        console.log(`   Email: ${superAdmin.email}`);
        console.log(`   Role: ${superAdmin.role}`);
        console.log('\nYou can now log in to the admin panel.');
        
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
}

createSuperAdmin();

