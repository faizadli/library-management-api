const mysql = require('mysql2/promise');

let pool;

// Check if running in Google Cloud or locally
if (process.env.NODE_ENV === 'production') {
  // Cloud SQL configuration
  pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
  });
} else {
  // Local MySQL configuration
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
}

module.exports = pool;