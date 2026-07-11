import { sequelize, Account, Transaction, Audit, User } from "../models/index.js";
import bcrypt from "bcrypt";

/**
 * deposit/withdraw/transfer operations must use DB transactions to keep balances consistent
 */
const verifyLoginPassword = async (userId, password) => {
  if (!password) {
    throw { status: 400, message: "Password is required" };
  }

  const user = await User.findByPk(userId);
  if (!user?.passwordHash) {
    throw { status: 404, message: "User not found or invalid user data" };
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    throw { status: 401, message: "Invalid password" };
  }
};

export const deposit = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    console.log('Deposit request:', req.body);
    const { accountId, amount, narration, password } = req.body;
    await verifyLoginPassword(req.user.id, password);
    const account = await Account.findByPk(accountId, { 
      transaction: t, 
      lock: t.LOCK.UPDATE 
    });
    
    if (!account) {
      console.log('Account not found:', accountId);
      throw { status: 404, message: "Account not found" };
    }
    
    const newBalance = parseFloat(account.balance) + parseFloat(amount);
    console.log(`Updating balance from ${account.balance} to ${newBalance}`);
    
    account.balance = newBalance;
    await account.save({ transaction: t });

    const txn = await Transaction.create({
      accountId: account.id,
      type: "deposit",
      amount,
      balanceAfter: newBalance,
      narration: narration || "Deposit"
    }, { transaction: t });

    await Audit.create({
      entity: "account",
      entityId: account.id,
      action: "deposit",
      dataBefore: { balance: (newBalance - amount) },
      dataAfter: { balance: newBalance },
      performedBy: req.user.id
    }, { transaction: t });

    await t.commit();
    console.log('Deposit successful:', txn.toJSON());
    res.json(txn);
  } catch (err) {
    console.error('Deposit error:', err);
    await t.rollback();
    next(err);
  }
};

export const withdraw = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { accountId, amount, narration, password } = req.body;
    await verifyLoginPassword(req.user.id, password);
    const account = await Account.findByPk(accountId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!account) throw { status: 404, message: "Account not found" };
    if (parseFloat(account.balance) < parseFloat(amount)) throw { status: 400, message: "Insufficient funds" };
    const newBalance = parseFloat(account.balance) - parseFloat(amount);
    account.balance = newBalance;
    await account.save({ transaction: t });

    const txn = await Transaction.create({
      accountId: account.id,
      type: "withdraw",
      amount,
      balanceAfter: newBalance,
      narration
    }, { transaction: t });

    await Audit.create({
      entity: "account",
      entityId: account.id,
      action: "withdraw",
      dataBefore: { balance: (newBalance + amount) },
      dataAfter: { balance: newBalance },
      performedBy: req.user.id
    }, { transaction: t });

    await t.commit();
    res.json(txn);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

export const transfer = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { fromAccountId, toAccountNumber, amount, narration, password } = req.body;
    
    await verifyLoginPassword(req.user.id, password);
    const from = await Account.findByPk(fromAccountId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!from) throw { status: 404, message: "From account not found" };
    if (parseFloat(from.balance) < parseFloat(amount)) throw { status: 400, message: "Insufficient funds" };
    const to = await Account.findOne({ where: { accountNumber: toAccountNumber } , transaction: t, lock: t.LOCK.UPDATE });
    if (!to) throw { status: 404, message: "To account not found" };

    // debit
    from.balance = parseFloat(from.balance) - parseFloat(amount);
    await from.save({ transaction: t });

    // credit
    to.balance = parseFloat(to.balance) + parseFloat(amount);
    await to.save({ transaction: t });

    // create txns
    const txn1 = await Transaction.create({
      accountId: from.id,
      type: "transfer",
      amount: -amount, // Negative amount for sender
      relatedAccountId: to.id,
      balanceAfter: from.balance,
      narration: `Transfer to ${to.accountNumber}`
    }, { transaction: t });

    const txn2 = await Transaction.create({
      accountId: to.id,
      type: "transfer",
      amount,
      relatedAccountId: from.id,
      balanceAfter: to.balance,
      narration
    }, { transaction: t });

    await Audit.create({
      entity: "transfer",
      entityId: `${txn1.id}`,
      action: "transfer",
      dataBefore: { fromBalance: (parseFloat(from.balance) + parseFloat(amount)), toBalance: (parseFloat(to.balance) - parseFloat(amount)) },
      dataAfter: { fromBalance: from.balance, toBalance: to.balance },
      performedBy: req.user.id
    }, { transaction: t });

    await t.commit();
    res.json({ fromTxn: txn1, toTxn: txn2 });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    console.log('Deleting transaction ID:', id);
    
    // Find the transaction
    const transaction = await Transaction.findByPk(id, { transaction: t });
    if (!transaction) {
      console.log('Transaction not found:', id);
      throw { status: 404, message: "Transaction not found" };
    }
    
    console.log('Found transaction:', transaction.toJSON());
    
    // Get the account (just for verification)
    const account = await Account.findByPk(transaction.accountId, { transaction: t });
    if (!account) {
      console.log('Account not found:', transaction.accountId);
      throw { status: 404, message: "Account not found" };
    }
    
    console.log('Current account balance (unchanged):', account.balance);
    
    // Delete the transaction WITHOUT changing balance
    await transaction.destroy({ transaction: t });
    console.log('Transaction deleted (balance unchanged)');
    
    // Create audit log
    await Audit.create({
      entity: "transaction",
      entityId: id,
      action: "delete",
      dataBefore: { transaction: transaction.toJSON() },
      dataAfter: null,
      performedBy: req.user.id
    }, { transaction: t });
    
    await t.commit();
    console.log('Transaction deletion committed successfully');
    res.json({ message: "Transaction history deleted successfully", balance: account.balance });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    await t.rollback();
    next(err);
  }
};
