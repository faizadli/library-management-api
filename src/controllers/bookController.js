const pool = require('../config/db');

// Create a new book
const createBook = async (req, res) => {
  try {
    const { title, author, stock } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO books (title, author, stock) VALUES (?, ?, ?)',
      [title, author, stock]
    );
    
    res.status(201).json({
      message: 'Book created successfully',
      book_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const [books] = await pool.query('SELECT * FROM books');
    res.status(200).json(books);
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(200).json(books[0]);
  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, stock } = req.body;
    
    const [result] = await pool.query(
      'UPDATE books SET title = ?, author = ?, stock = ? WHERE id = ?',
      [title, author, stock, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
};