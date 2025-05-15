const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Create a new loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - admin_id
 *               - user_id
 *               - borrow_date
 *               - return_date
 *               - loan_items
 *             properties:
 *               admin_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               borrow_date:
 *                 type: string
 *                 format: date
 *               return_date:
 *                 type: string
 *                 format: date
 *               loan_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - book_id
 *                     - quantity
 *                   properties:
 *                     book_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Loan created successfully
 *       400:
 *         description: Not enough stock for book
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, loanController.createLoan);

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all loans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, loanController.getAllLoans);

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, loanController.getLoanById);

/**
 * @swagger
 * /api/loans/{id}/return:
 *   put:
 *     summary: Return a loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - actual_return_date
 *             properties:
 *               actual_return_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Loan returned successfully
 *       400:
 *         description: Loan has already been returned
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.put('/:id/return', authenticateToken, loanController.returnLoan);

/**
 * @swagger
 * /api/loans/{id}:
 *   delete:
 *     summary: Delete loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, loanController.deleteLoan);

module.exports = router;