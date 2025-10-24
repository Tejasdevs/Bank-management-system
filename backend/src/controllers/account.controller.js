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
    const transactions = await Transaction.findAll({ 
      where: { accountId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(transactions);
  } catch (err) { next(err); }
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
