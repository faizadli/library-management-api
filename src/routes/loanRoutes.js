const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoanItem:
 *       type: object
 *       required:
 *         - book_id
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the loan item
 *         loan_id:
 *           type: integer
 *           description: The id of the loan
 *         book_id:
 *           type: integer
 *           description: The id of the book
 *         quantity:
 *           type: integer
 *           description: The quantity of books borrowed
 *       example:
 *         id: 1
 *         loan_id: 1
 *         book_id: 1
 *         quantity: 2
 *     Loan:
 *       type: object
 *       required:
 *         - admin_id
 *         - user_id
 *         - borrow_date
 *         - return_date
 *         - loan_items
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the loan
 *         admin_id:
 *           type: integer
 *           description: The id of the admin who processed the loan
 *         user_id:
 *           type: integer
 *           description: The id of the user who borrowed the books
 *         borrow_date:
 *           type: string
 *           format: date
 *           description: The date when books were borrowed
 *         return_date:
 *           type: string
 *           format: date
 *           description: The expected return date
 *         status:
 *           type: string
 *           enum: [borrowed, returned]
 *           description: The status of the loan
 *         days_late:
 *           type: integer
 *           description: Number of days the loan is late
 *         penalty_fee:
 *           type: number
 *           description: Penalty fee for late return
 *         loan_items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LoanItem'
 *       example:
 *         id: 1
 *         admin_id: 1
 *         user_id: 1
 *         borrow_date: "2023-01-01"
 *         return_date: "2023-01-15"
 *         status: "borrowed"
 *         days_late: 0
 *         penalty_fee: 0
 *         loan_items:
 *           - id: 1
 *             loan_id: 1
 *             book_id: 1
 *             quantity: 2
 */

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