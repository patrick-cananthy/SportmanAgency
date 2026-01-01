const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Job = sequelize.define('Job', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        shortDescription: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 200]
            }
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        jobType: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Full-time'
        },
        department: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'General'
        },
        requirements: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
        },
        salary: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        applicationUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        contactEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        postedDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        closingDate: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'jobs',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    return Job;
};

