const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware');

router.post('/borrow', authenticateToken, async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.user_id;

    try {
        const checkResult = await pool.query(
            'SELECT b.available_copies, EXISTS9(SELECT 1 FROM borrows WHERE user_id = $1 AND book_id = $2 AND return_date IS NULL) AS already_borrowed FROM books b where book_id = $2',
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
        await pool.query(
            'INSERT INTO borrows (user_id, book_id, due_date) VALUES ($1, $2, CURRENT_DATE + INTERVAL \'14 days\') RETURNING *',
            [user_id, book_id]
        );
        await pool.query(
            'UPDATE books SET available_copies = available_copies - 1 WHERE book_id = $1',
            [book_id]
        );
        await pool.query('COMMIT');
        res.status(201).json(already_borrowed.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message || 'Server error processing borrow request.' });
    }
});

router.post('/return', authenticateToken, async (req, res) => {
    const { borrow_id, bookId } = req.body;

    try{
        await pool.query('BEGIN');
        const result = await pool.query(
            'UPDATE borrows SET return_date = CURRENT_DATE WHERE borrow_id = $1 AND return_date IS NULL RETURNING book_id',
            [borrow_id]
        );

        if (result.rowCount === 0){
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Invalid borrow ID or book already returned.' });
        }
        await pool.query(
            'UPDATE books SET available_copies = available_copies + 1 WHERE book_id = $1',
            [book_id]);
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
            `SELECT br.borrow_id, b.title, b.author, b.borrow_date, br.due_date
             FROM borrows br
             JOIN books b ON br.book_id = b.book_id = b.book_id
             WHERE br.user_id = $1 AND br.return_date IS NULL
             ORDER BY br.due_date ASC`,
            [user_id]
        );
        res.json(borrowedBooks.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching borrowed books.' });
    }
});

module.exports = router;