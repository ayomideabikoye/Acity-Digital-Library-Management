const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, requireAdmin } = require("../middleware");

// Get books with search and filter
router.get("/", async (req, res) => {
  const { search, category } = req.query;
  let query = "SELECT * FROM books WHERE 1=1";
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
    res.status(500).json({ error: "Server error fetching books." });
  }
});

// Add new book
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  const { title, author, isbn, category, total_copies } = req.body;

  if (!title || !isbn || !category || !total_copies) {
    return res
      .status(400)
      .json({ error: "Missing title, ISBN, category, or total copies." });
  }

  try {
    const newBook = await pool.query(
      `INSERT INTO books 
                (title, author, isbn, category, total_copies, available_copies) 
             VALUES 
                ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
      [title, author, isbn, category, total_copies, total_copies]
    );
    res.status(201).json(newBook.rows[0]);
  } catch (err) {
    console.error("Book Add Database Error:", err);
    res.status(500).json({ error: "Server error adding book." });
  }
});

// Delete a book
router.delete("/:bookId", authenticateToken, requireAdmin, async (req, res) => {
  const { bookId } = req.params;

  if (!bookId || isNaN(bookId)) {
    return res.status(400).json({ error: "Invalid book ID." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM books WHERE book_id = $1 RETURNING *",
      [bookId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Book not found." });
    }

    res.json({ message: `Book ${bookId} deleted successfully.` });
  } catch (err) {
    console.error("Delete Book Error:", err);
    if (err.code === "23503") {
      return res.status(400).json({
        error:
          "Cannot delete book: Active borrows or transactions exist. Return all copies first.",
      });
    }
    res.status(500).json({ error: "Server error processing delete request." });
  }
});
module.exports = router;
