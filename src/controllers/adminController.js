const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register a new admin
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin already exists
    const [existingAdmin] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
    
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new admin
    const [result] = await pool.query(
      'INSERT INTO admin (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    res.status(201).json({ 
      message: 'Admin registered successfully',
      admin_id: result.insertId
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if admin exists
    const [admins] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
    
    if (admins.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    const admin = admins[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, admin.password);
    
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Create and assign token
    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await pool.query('SELECT id, name, email FROM admin');
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error getting admins:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const [admins] = await pool.query('SELECT id, name, email FROM admin WHERE id = ?', [id]);
    
    if (admins.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json(admins[0]);
  } catch (error) {
    console.error('Error getting admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const [result] = await pool.query(
      'UPDATE admin SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json({ message: 'Admin updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM admin WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
};