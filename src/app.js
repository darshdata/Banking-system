const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());

/**
 * Routes Required
 */
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');


/**
 * -use Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);

module.exports = app;