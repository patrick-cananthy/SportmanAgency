const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Talent = sequelize.define('Talent', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        sport: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        shortBio: {
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
        achievements: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
        },
        nationality: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        position: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        team: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        stats: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
        },
        socialMedia: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
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
        tableName: 'talents',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    return Talent;
};

