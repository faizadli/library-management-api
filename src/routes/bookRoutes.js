const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, bookController.createBook);
router.get('/', authenticateToken, bookController.getAllBooks);
router.get('/:id', authenticateToken, bookController.getBookById);
router.put('/:id', authenticateToken, bookController.updateBook);
router.delete('/:id', authenticateToken, bookController.deleteBook);

module.exports = router;