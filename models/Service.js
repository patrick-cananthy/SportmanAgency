const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Service = sequelize.define('Service', {
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
            type: DataTypes.STRING(500),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 500]
            }
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        features: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: '',
            // Store as JSON string or newline-separated
            get() {
                const value = this.getDataValue('features');
                if (!value) return [];
                try {
                    return JSON.parse(value);
                } catch {
                    return value.split('\n').filter(f => f.trim());
                }
            },
            set(value) {
                if (Array.isArray(value)) {
                    this.setDataValue('features', JSON.stringify(value));
                } else {
                    this.setDataValue('features', value);
                }
            }
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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
        tableName: 'services',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    return Service;
};

