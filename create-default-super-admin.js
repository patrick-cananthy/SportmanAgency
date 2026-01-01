const sequelize = require('./config/database');
require('dotenv').config();

async function createDefaultSuperAdmin() {
    try {
        const User = require('./models/User')(sequelize);
        
        await sequelize.authenticate();
        console.log('✓ Database connected');
        
        // Sync database (create tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log('✓ Database tables synced');
        
        // Default super admin credentials
        const defaultUsername = 'superadmin';
        const defaultEmail = 'superadmin@sportsmantalent.com';
        const defaultPassword = 'SuperAdmin@2025!';
        
        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email: defaultEmail },
                    { username: defaultUsername },
                    { role: 'super_admin' }
                ]
            }
        });
        
        if (existingSuperAdmin) {
            console.log('\n⚠️  Super admin already exists!');
            console.log(`   Username: ${existingSuperAdmin.username}`);
            console.log(`   Email: ${existingSuperAdmin.email}`);
            console.log(`   Role: ${existingSuperAdmin.role}`);
            console.log('\nIf you want to reset the password, use the password reset feature in the admin panel.');
            process.exit(0);
        }
        
        // Create super admin
        const superAdmin = await User.create({
            username: defaultUsername,
            email: defaultEmail,
            password: defaultPassword,
            role: 'super_admin',
            lastActivity: new Date()
        });
        
        console.log('\n✅ Default Super Admin created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Username: superadmin');
        console.log('   Email: superadmin@sportsmantalent.com');
        console.log('   Password: SuperAdmin@2025!');
        console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!');
        console.log('\nYou can now log in to the admin panel at: http://localhost:3005/admin');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
}

createDefaultSuperAdmin();

