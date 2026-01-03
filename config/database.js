const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support both MySQL and PostgreSQL
// Priority: DATABASE_URL > MYSQL_URL > Individual parameters
let sequelize;

// Check for connection URL (Railway, Render, etc.)
if (process.env.DATABASE_URL) {
    // PostgreSQL connection URL (Render, Railway PostgreSQL)
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
} else if (process.env.MYSQL_URL) {
    // MySQL connection URL (Railway MySQL)
    // Parse the connection string
    const mysqlUrl = process.env.MYSQL_URL;
    // Format: mysql://user:password@host:port/database
    sequelize = new Sequelize(mysqlUrl, {
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        retry: {
            max: 3
        }
    });
} else {
    // Use individual connection parameters
    const dialect = process.env.DB_DIALECT || 'mysql';
    const port = process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306);

    // Log connection details (without password) for debugging
    if (process.env.NODE_ENV === 'development') {
        console.log('Database Config:', {
            dialect,
            host: process.env.DB_HOST || 'localhost',
            port,
            database: process.env.DB_NAME || 'sportsman_agency',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD ? '***' : 'not set'
        });
    }

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
            },
            retry: {
                max: 3
            }
        }
    );
}

module.exports = sequelize;


