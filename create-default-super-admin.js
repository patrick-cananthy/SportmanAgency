const sequelize = require('./config/database');
require('dotenv').config();

async function createDefaultSuperAdmin() {
    try {
        const User = require('./models/User')(sequelize);
        const bcrypt = require('bcryptjs');
        
        await sequelize.authenticate();
        console.log('✓ Database connected');
        
        await sequelize.sync({ alter: true });
        console.log('✓ Models synced');
        
        // Default super admin credentials
        const defaultUsername = 'superadmin';
        const defaultEmail = 'admin@sportsmantalent.com';
        const defaultPassword = 'Admin@2026';
        
        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({
            where: {
                role: 'super_admin'
            }
        });
        
        if (existingSuperAdmin) {
            console.log('\n⚠️  Super Admin already exists:');
            console.log(`   Username: ${existingSuperAdmin.username}`);
            console.log(`   Email: ${existingSuperAdmin.email}`);
            console.log(`   Role: ${existingSuperAdmin.role}`);
            console.log('\nTo reset password, use the password reset feature in admin panel.');
            process.exit(0);
        }
        
        // Check if username or email is taken
        const existingUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email: defaultEmail },
                    { username: defaultUsername }
                ]
            }
        });
        
        if (existingUser) {
            console.log('\n⚠️  User with this username or email already exists.');
            console.log('   Please use a different username/email or delete the existing user first.');
            process.exit(1);
        }
        
        // Create super admin
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const superAdmin = await User.create({
            username: defaultUsername,
            email: defaultEmail,
            password: hashedPassword,
            role: 'super_admin',
            lastActivity: new Date()
        });
        
        console.log('\n✅ Default Super Admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Username: superadmin');
        console.log('   Email: admin@sportsmantalent.com');
        console.log('   Password: Admin@2026');
        console.log('   Role: super_admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Change this password after first login!');
        console.log('\nYou can now log in to the admin panel.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
}

createDefaultSuperAdmin();
