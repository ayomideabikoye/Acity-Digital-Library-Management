const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware');

// Get books with search and filter 
router.get('/', async (req, res) => {
     const { search, category} = req.query;
     let query = 'SELECT * FROM books WHERE 1=1';
     let params = [];

     if (search) {
            params.push(`%${search}%`);
            query += ` AND (title ILIKE $${params.length} OR author ILIKE $${params.length}) `;
     }
        if (category) {
            params.push(category);
            query += ` AND category = $${params.length} `;
        }
        
    try {
        const books = await pool.query(query, params);
        res.json(books.rows);
    } catch (err) {
        console.error("Books Fetch Error:", err);
        res.status(500).json({ error: 'Server error fetching books.' });
    }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    const { title, author, isbn, category, total_copies } = req.body; 
    
    if (!title || !isbn || !category || !total_copies) {
        return res.status(400).json({ error: 'Missing title, ISBN, category, or total copies.' }); 
    }
    
    try {
        const newBook = await pool.query(
            `INSERT INTO books 
                (title, author, isbn, category, total_copies, available_copies) 
             VALUES 
                ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [
                title, 
                author, 
                isbn, 
                category, 
                total_copies, 
                total_copies 
            ]
        );
        res.status(201).json(newBook.rows[0]);
    } catch (err) {
        console.error("Book Add Error:", err); 
        res.status(500).json({ error: 'Server error adding book.' });
    }
});
module.exports = router;