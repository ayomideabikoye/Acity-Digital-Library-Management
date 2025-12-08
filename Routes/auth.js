const express= require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    // 1. DEBUG LOG: Print what data the server received
    console.log('-------------------------------------------');
    console.log('📩 Register request received!');
    console.log('Data:', req.body); 

    const { username, password, role } = req.body || {};

    if (!username || !password || !role) {
      console.error('❌ Error: Missing fields');
      return res.status(400).json({ error: 'Missing required field(s)' });
    }

    console.log('🔑 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('💾 Inserting into database...');
    const newUser = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, username, role',
      [username, hashedPassword, role]
    );

    console.log('✅ User created successfully:', newUser.rows[0]);
    console.log('-------------------------------------------');
    return res.status(201).json(newUser.rows[0]);

  } catch (err) {
    console.error('-------------------------------------------');
    console.error('💥 SERVER ERROR DETECTED');
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code); 
    console.error('-------------------------------------------');

    if (err.code === '23505') {
        return res.status(409).json({ error: 'Username already exists.' });
    }
    
    return res.status(500).json({ error: err.message });
  }
});
    
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
        { user_id: user.rows[0].user_id, role: user.rows[0].role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
        );

        res.json({ token, role: user.rows[0].role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;