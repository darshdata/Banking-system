const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// post. /api/auth/register
router.post("/register", authController.userRegisterController); 

module.exports = router;