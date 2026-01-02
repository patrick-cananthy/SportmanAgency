const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support both MySQL and PostgreSQL
// If DATABASE_URL is provided (Render PostgreSQL), use it directly
let sequelize;

if (process.env.DATABASE_URL) {
    // Use connection URL (Render PostgreSQL)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Use individual connection parameters
    const dialect = process.env.DB_DIALECT || 'mysql';
    const port = process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306);

    sequelize = new Sequelize(
        process.env.DB_NAME || 'sportsman_agency',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: port,
            dialect: dialect,
            dialectOptions: dialect === 'postgres' ? {
                ssl: process.env.NODE_ENV === 'production' ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            } : {},
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

module.exports = sequelize;


