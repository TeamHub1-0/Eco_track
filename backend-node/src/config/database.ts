    import mysql from "mysql2/promise";

    export const pool = mysql.createPool({
        //Connection pool
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        // Connection pool management
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        maxIdle:5,
        idleTimeout: 600000,

         // Query settings
        multipleStatements: false,
    });