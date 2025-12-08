const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, 
    },
});

// Check connection immediately to catch errors early
pool.connect((err) => {
    if (err) {
        console.error('connection error', err.stack);
    } else {
        console.log('Connected to Render PostgreSQL database successfully!');
    }
});

module.exports = pool;