/**
 * Script to update all users with 'super_admin' role to 'admin' role
 * Run this once to migrate from super_admin to admin role system
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');

async function updateSuperAdminToAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Get User model
        const User = sequelize.define('User', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: DataTypes.STRING,
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            role: DataTypes.STRING,
            lastActivity: DataTypes.DATE
        }, {
            tableName: 'users',
            timestamps: true
        });

        // Find all users with super_admin role
        const superAdmins = await User.findAll({
            where: {
                role: 'super_admin'
            }
        });

        if (superAdmins.length === 0) {
            console.log('✓ No users with super_admin role found. All users are already migrated.');
            process.exit(0);
        }

        console.log(`Found ${superAdmins.length} user(s) with super_admin role:`);
        superAdmins.forEach(user => {
            console.log(`  - ${user.username} (${user.email})`);
        });

        // Update all super_admin users to admin
        const updated = await User.update(
            { role: 'admin' },
            { where: { role: 'super_admin' } }
        );

        console.log(`\n✓ Successfully updated ${updated[0]} user(s) from super_admin to admin role.`);
        console.log('\n⚠️  IMPORTANT: All users with super_admin role have been changed to admin.');
        console.log('   Users will need to log out and log back in for changes to take effect.');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error updating users:', error.message);
        process.exit(1);
    }
}

updateSuperAdminToAdmin();

