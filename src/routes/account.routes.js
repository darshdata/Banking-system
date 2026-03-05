const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller');

const router = express.Router();

/**
 * - POST /api/accounts
 * - create a new account
 * - Protected Route
 */
router.post('/', authMiddleware, accountController.createAccount);

/**
 * - GET /api/accounts
 * - get all accounts of the logged in user
 * - Protected Route
 */
router.get('/', authMiddleware, accountController.getUserAccountsController);


/**
 * - GET /api/accounts/balance/:accountId
 * - get balance of a specific account
 * - Protected Route
 */
router.get('/balance/:accountId', authMiddleware, accountController.getAccountBalanceController);


module.exports = router;