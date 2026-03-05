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

async function getUserAccountsController(req, res){
    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        message: "User accounts retrieved successfully.",
        status: "success",
        accounts: accounts,
    });
}

async function getAccountBalanceController(req, res){
    const { accountId } = req.params;

    const account = await accountModel.findOne({ _id: accountId, user: req.user._id });

    if(!account){
        return res.status(404).json({
            success: false,
            message: "Account not found.",
            status: "failed",
        });
    }

    res.status(200).json({
        success: true,
        message: "Account balance retrieved successfully.",
        status: "success",
        balance: account.balance,
    });
}

module.exports = {
    createAccount,
    getUserAccountsController,
    getAccountBalanceController
};
