const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Event = sequelize.define('Event', {
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
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        eventDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        eventTime: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'General'
        },
        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        registrationUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        contactEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        contactPhone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        }
    }, {
        tableName: 'events',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    return Event;
};

