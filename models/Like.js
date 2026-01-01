const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Like = sequelize.define('Like', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        newsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'news',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        userIp: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'likes',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        indexes: [
            {
                unique: true,
                fields: ['newsId', 'userIp']
            }
        ]
    });

    return Like;
};

