const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;
let isDemoMode = false;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'lollys_food_joint',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 2000 // Fast timeout for demo mode
  });

  // Check connection
  pool.getConnection()
    .then(conn => {
      console.log('Connected to real database.');
      conn.release();
    })
    .catch(err => {
      console.warn('Database connection failed. Falling back to DEMO MODE.');
      isDemoMode = true;
    });

} catch (err) {
  console.warn('Database pool creation failed. Falling back to DEMO MODE.');
  isDemoMode = true;
}

// Wrapper for execute/query to handle demo mode
const db = {
  execute: async (sql, params) => {
    if (isDemoMode) {
      console.log(`[DEMO] Executing: ${sql}`);
      return [[]]; // Return empty result in demo mode
    }
    return pool.execute(sql, params);
  },
  query: async (sql, params) => {
    if (isDemoMode) {
      console.log(`[DEMO] Querying: ${sql}`);
      return [[]]; // Return empty result in demo mode
    }
    return pool.query(sql, params);
  },
  getConnection: async () => {
    if (isDemoMode) {
      return {
        release: () => {},
        execute: async (sql, params) => [[]],
        query: async (sql, params) => [[]]
      };
    }
    return pool.getConnection();
  },
  isDemoMode: () => isDemoMode
};

module.exports = db;
