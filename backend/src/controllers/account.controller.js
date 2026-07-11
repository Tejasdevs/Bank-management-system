import { Account, Audit, Transaction } from "../models/index.js";
import generateAccountNumber from "../utils/generateAccountNumber.js";

export const createAccount = async (req, res, next) => {
  try {
    const { userId, accountType } = req.body;
    const accountNumber = generateAccountNumber();
    const account = await Account.create({ userId, accountNumber, accountType, balance: 0 });
    res.status(201).json(account);
  } catch (err) { next(err); }
};

export const getAccount = async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: "Not found" });
    res.json(account);
  } catch (err) { next(err); }
};

export const getUserAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.findAll({ where: { userId: req.user.id } });
    res.json(accounts);
  } catch (err) { next(err); }
};

export const getAccountTransactions = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    console.log(`Fetching transactions for account: ${accountId}, user: ${req.user.id}`);
    
    // Verify account exists and belongs to user
    const account = await Account.findOne({
      where: { id: accountId, userId: req.user.id }
    });
    
    if (!account) {
      console.log(`Account not found or access denied: ${accountId}`);
      return res.status(404).json({ message: 'Account not found or access denied' });
    }
    
    // Get transactions with related account info
    const transactions = await Transaction.findAll({ 
      where: { accountId },
      order: [['createdAt', 'DESC']],
      limit: 100, // Limit to 100 most recent transactions
      raw: true // Get plain objects instead of model instances
    });
    
    console.log(`Found ${transactions.length} transactions for account ${accountId}`);
    
    // Format the response with related account numbers
    const formattedTransactions = await Promise.all(transactions.map(async (tx) => {
      if (tx.relatedAccountId) {
        const relatedAccount = await Account.findByPk(tx.relatedAccountId, {
          attributes: ['accountNumber'],
          raw: true
        });
        return {
          ...tx,
          relatedAccountNumber: relatedAccount?.accountNumber || null
        };
      }
      return tx;
    }));

    res.json(formattedTransactions);
  } catch (err) { 
    console.error('Error in getAccountTransactions:', err);
    next(err); 
  }
};

export const freezeAccount = async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: "Not found" });
    const before = account.toJSON();
    account.status = "frozen";
    await account.save();
    await Audit.create({
      entity: "account",
      entityId: account.id,
      action: "freeze",
      dataBefore: before, dataAfter: account.toJSON(),
      performedBy: req.user.id
    });
    res.json(account);
  } catch (err) { next(err); }
};
