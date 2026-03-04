const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const transactionRoutes = Router();

/**
 * - POST /api/transactions
 * - create a new transaction
 */
transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransactionController);


/**
 * POST /api/transactions/system/initial-funds
 * - create initial funds for system user
 */
transactionRoutes.post('/system/initial-funds', authMiddleware.authSystemAuthMiddleware, transactionController.createInitialFundsController);

module.exports = transactionRoutes;