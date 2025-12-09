// ✅ Corrected Code for transactions.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware');

// --- 1. Borrow Book Route (Corrected SQL and Response)
router.post('/borrow', authenticateToken, async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.user_id;

    try {
        const checkResult = await pool.query(
            // FIX: Corrected EXISTS typo and WHERE clause structure
            `SELECT 
                b.available_copies, 
                EXISTS(SELECT 1 FROM borrows WHERE user_id = $1 AND book_id = $2 AND return_date IS NULL) AS already_borrowed 
             FROM books b 
             WHERE book_id = $2`, 
            [user_id, book_id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        const { available_copies, already_borrowed } = checkResult.rows[0];
        if (already_borrowed) {
            return res.status(400).json({ error: 'You have already borrowed this book.' });
        }
        if (available_copies < 1) {
            return res.status(400).json({ error: 'No available copies to borrow.' });
        }
        
        await pool.query('BEGIN');
        const newBorrow = await pool.query(
            "INSERT INTO borrows (user_id, book_id, borrow_date, due_date) VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days') RETURNING *",
            [user_id, book_id]
        );
        await pool.query(
            'UPDATE books SET available_copies = available_copies - 1 WHERE book_id = $1',
            [book_id]
        );
        await pool.query('COMMIT');
        res.status(201).json(newBorrow.rows[0]); 
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message || 'Server error processing borrow request.' });
    }
});

// --- 2. Return Book Route 
router.put('/return/:borrowId', authenticateToken, async (req, res) => {
    const borrow_id = req.params.borrowId; // FIX: Get ID from URL parameter
    const user_id = req.user.user_id;

    try{
        await pool.query('BEGIN');
        
        const findBook = await pool.query(
            'SELECT book_id FROM borrows WHERE borrow_id = $1 AND user_id = $2 AND return_date IS NULL',
            [borrow_id, user_id]
        );

        if (findBook.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Invalid transaction ID, book already returned, or you are not the borrower.' });
        }
        const bookId = findBook.rows[0].book_id;
        
        const result = await pool.query(
            'UPDATE borrows SET return_date = CURRENT_DATE WHERE borrow_id = $1 AND return_date IS NULL',
            [borrow_id]
        );

        await pool.query(
            'UPDATE books SET available_copies = available_copies + 1 WHERE book_id = $1',
            [bookId]); 
        
        await pool.query('COMMIT');
        res.json({ message: 'Book returned successfully.' });
    }
    catch (err){
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message || 'Server error processing return request.' });
    }
});

router.get('/my-books', authenticateToken, async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const borrows = await pool.query(
            `SELECT 
                 br.borrow_id, 
                 b.title AS book_title, 
                 b.author AS book_author, 
                 br.borrow_date, 
                 br.due_date, 
                 br.return_date 
             FROM borrows br
             JOIN books b ON br.book_id = b.book_id
             WHERE br.user_id = $1
             ORDER BY br.borrow_date DESC`,
            [user_id]
        );
        res.json(borrows.rows);
    } catch (err) {
        console.error("Fetch My Books Error:", err);
        res.status(500).json({ error: err.message || 'Server error fetching your books.' });
    }
});
module.exports = router;