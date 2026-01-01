const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SalesRental = sequelize.define('SalesRental', {
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
        type: {
            type: DataTypes.ENUM('sale', 'rental'),
            allowNull: false,
            defaultValue: 'sale'
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'General'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        priceDisplay: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        condition: {
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
        },
        availability: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        }
    }, {
        tableName: 'sales_rentals',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    return SalesRental;
};

