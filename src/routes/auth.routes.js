const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// post. /api/auth/register
router.post("/register", authController.userRegisterController); 

//POST. /api/auth/login
router.post("/login", authController.userLoginController);

/**
 * POST. /api/auth/logout
 * - Logout the user by blacklisting the token
 * - Protected Route
 */
router.post("/logout", authController.authMiddleware, authController.userLogoutController);
module.exports = router;