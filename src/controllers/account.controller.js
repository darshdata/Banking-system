const accountModel = require('../models/account.model');

async function createAccount(userId, currency){
    const user = req.user;

    const account = await accountModel.create({
        user: user._id,
        currency
    });

    res.status(201).json({
        account
});
}

module.exports = {
    createAccount
};
