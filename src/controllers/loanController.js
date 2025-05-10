const pool = require('../config/db');

// Create a new loan with loan items
const createLoan = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { admin_id, user_id, borrow_date, return_date, loan_items } = req.body;
    
    // Insert loan
    const [loanResult] = await connection.query(
      'INSERT INTO loans (admin_id, user_id, borrow_date, return_date, status) VALUES (?, ?, ?, ?, ?)',
      [admin_id, user_id, borrow_date, return_date, 'borrowed']
    );
    
    const loan_id = loanResult.insertId;
    
    // Insert loan items and update book stock
    for (const item of loan_items) {
      const { book_id, quantity } = item;
      
      // Check if book exists and has enough stock
      const [books] = await connection.query('SELECT stock FROM books WHERE id = ?', [book_id]);
      
      if (books.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `Book with ID ${book_id} not found` });
      }
      
      const book = books[0];
      
      if (book.stock < quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Not enough stock for book ID ${book_id}. Available: ${book.stock}, Requested: ${quantity}` 
        });
      }
      
      // Insert loan item
      await connection.query(
        'INSERT INTO loan_items (loan_id, book_id, quantity) VALUES (?, ?, ?)',
        [loan_id, book_id, quantity]
      );
      
      // Update book stock
      await connection.query(
        'UPDATE books SET stock = stock - ? WHERE id = ?',
        [quantity, book_id]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      message: 'Loan created successfully',
      loan_id
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// Get all loans
const getAllLoans = async (req, res) => {
  try {
    const [loans] = await pool.query(`
      SELECT l.*, a.name as admin_name, u.name as user_name 
      FROM loans l
      JOIN admin a ON l.admin_id = a.id
      JOIN users u ON l.user_id = u.id
    `);
    
    // Get loan items for each loan
    for (const loan of loans) {
      const [items] = await pool.query(`
        SELECT li.*, b.title, b.author 
        FROM loan_items li
        JOIN books b ON li.book_id = b.id
        WHERE li.loan_id = ?
      `, [loan.id]);
      
      loan.items = items;
    }
    
    res.status(200).json(loans);
  } catch (error) {
    console.error('Error getting loans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get loan by ID
const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [loans] = await pool.query(`
      SELECT l.*, a.name as admin_name, u.name as user_name 
      FROM loans l
      JOIN admin a ON l.admin_id = a.id
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, [id]);
    
    if (loans.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    const loan = loans[0];
    
    // Get loan items
    const [items] = await pool.query(`
      SELECT li.*, b.title, b.author 
      FROM loan_items li
      JOIN books b ON li.book_id = b.id
      WHERE li.loan_id = ?
    `, [id]);
    
    loan.items = items;
    
    res.status(200).json(loan);
  } catch (error) {
    console.error('Error getting loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Return loan
const returnLoan = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { actual_return_date } = req.body;
    
    // Get loan details
    const [loans] = await connection.query('SELECT * FROM loans WHERE id = ?', [id]);
    
    if (loans.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    const loan = loans[0];
    
    if (loan.status === 'returned') {
      await connection.rollback();
      return res.status(400).json({ message: 'Loan has already been returned' });
    }
    
    // Calculate days late and penalty fee
    const returnDate = new Date(loan.return_date);
    const actualReturnDate = new Date(actual_return_date);
    const daysLate = Math.max(0, Math.floor((actualReturnDate - returnDate) / (1000 * 60 * 60 * 24)));
    const penaltyFee = daysLate * 5; // $5 per day late
    
    // Update loan status
    await connection.query(
      'UPDATE loans SET status = ?, days_late = ?, penalty_fee = ? WHERE id = ?',
      ['returned', daysLate, penaltyFee, id]
    );
    
    // Get loan items and update book stock
    const [items] = await connection.query('SELECT * FROM loan_items WHERE loan_id = ?', [id]);
    
    for (const item of items) {
      await connection.query(
        'UPDATE books SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.book_id]
      );
    }
    
    await connection.commit();
    
    res.status(200).json({
      message: 'Loan returned successfully',
      days_late: daysLate,
      penalty_fee: penaltyFee
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error returning loan:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// Delete loan
const deleteLoan = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Check if loan exists
    const [loans] = await connection.query('SELECT * FROM loans WHERE id = ?', [id]);
    
    if (loans.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    const loan = loans[0];
    
    // If loan is still borrowed, return books to inventory
    if (loan.status === 'borrowed') {
      const [items] = await connection.query('SELECT * FROM loan_items WHERE loan_id = ?', [id]);
      
      for (const item of items) {
        await connection.query(
          'UPDATE books SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.book_id]
        );
      }
    }
    
    // Delete loan items
    await connection.query('DELETE FROM loan_items WHERE loan_id = ?', [id]);
    
    // Delete loan
    await connection.query('DELETE FROM loans WHERE id = ?', [id]);
    
    await connection.commit();
    
    res.status(200).json({ message: 'Loan deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting loan:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  returnLoan,
  deleteLoan
};