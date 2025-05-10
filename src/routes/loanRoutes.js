const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, loanController.createLoan);
router.get('/', authenticateToken, loanController.getAllLoans);
router.get('/:id', authenticateToken, loanController.getLoanById);
router.put('/:id/return', authenticateToken, loanController.returnLoan);
router.delete('/:id', authenticateToken, loanController.deleteLoan);

module.exports = router;