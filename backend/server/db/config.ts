import mysql from 'mysql2/promise';
import 'dotenv/config'

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    port: typeof(process.env.DB_PORT) == "string" && parseInt(process.env.DB_PORT) || 3306,
    password: process.env.DB_PASSWD
});