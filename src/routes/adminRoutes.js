const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', adminController.register);
router.post('/login', adminController.login);

// Protected routes
router.get('/', authenticateToken, adminController.getAllAdmins);
router.get('/:id', authenticateToken, adminController.getAdminById);
router.put('/:id', authenticateToken, adminController.updateAdmin);
router.delete('/:id', authenticateToken, adminController.deleteAdmin);

module.exports = router;