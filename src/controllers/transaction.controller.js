const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * - create a new transaction
 * The 10 step Transfer process:
 * 1. Validate the request.
 * 2. Validate idempotency key.
 * 3. Check account status.
 * 4. Derive sender balance from ledger.
 * 5. Create Transaction with PENDING status.
 * 6. Create DEBIT ledger entry for sender.
 * 7. Create CREDIT ledger entry for receiver.
 * 8. Update Transaction status to COMPLETED.
 * 9. Commit MongoDB session.
 * 10. Send email notification.
 */
async function createTransaction(req, res) {
  /**
   * 1. Validate the request.
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      success: false,
      message: "All fields are required for creating transaction.",
      status: "failed",
    });
  }

  const fromUserAccount = await accountModel.findById({ _id: fromAccount });

  const toUserAccount = await accountModel.findById({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      success: false,
      message: "Invalid account ID.",
      status: "failed",
    });
  }

  /**
   * 2. Validate idempotency key.
   */
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        success: true,
        message: "Transaction already completed with this idempotency key.",
        status: "success",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        success: true,
        message: "Transaction is still pending with this idempotency key.",
        status: "pending",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        success: false,
        message: "Transaction already failed with this idempotency key.",
        status: "failed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        success: false,
        message: "Transaction already reversed with this idempotency key.",
        status: "failed",
        transaction: isTransactionAlreadyExists,
      });
    }
  }

  /**
   * 3. Check account status.
   */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      success: false,
      message: "Both accounts must be active to perform transaction.",
      status: "failed",
    });
  }

  /**
   * 4. Derive sender balance from ledger.
   */

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      success: false,
      message: "Insufficient balance in sender account.",
      status: "failed",
    });
  }

  /**
   * 5. Create Transaction with PENDING status.
   * 6. Create DEBIT ledger entry for sender.
   * 7. Create CREDIT ledger entry for receiver.
   * 8. Update Transaction status to COMPLETED.
   * 9. Commit MongoDB session.
   * We need to perform steps 5-9 in a MongoDB transaction to ensure atomicity and consistency of data.
   * If any step fails, the entire transaction will be rolled back to maintain data integrity.
   * This is crucial in a banking system to prevent issues like double spending or inconsistent account balances.
   */
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create(
    {
      fromAccount: fromAccount,
      toAccount: toAccount,
      amount: amount,
      idempotencyKey: idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  /**
   * 10. Send email notification.
   */
  await emailService.sendTransactionEmail(
    req.user.email,
    re.user.name,
    amount,
    toAccount
  );

  res.status(201).json({
    success: true,
    message: "Transaction completed successfully.",
    status: "success",
    transaction: transaction,
  });

}

module.exports = {
  createTransactionController,
};
