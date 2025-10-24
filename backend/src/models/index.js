import sequelize from "../config/db.js";
import UserModel from "./user.model.js";
import AccountModel from "./account.model.js";
import TransactionModel from "./transaction.model.js";
import AuditModel from "./audit.model.js";
import LoanModel from "./loan.model.js";
import PaymentRequestModel from "./PaymentRequest.js";

// initialize models
const User = UserModel(sequelize);
const Account = AccountModel(sequelize);
const Transaction = TransactionModel(sequelize);
const Audit = AuditModel(sequelize);
const Loan = LoanModel(sequelize);
const PaymentRequest = PaymentRequestModel(sequelize);

// associations
User.hasMany(Account, { foreignKey: "userId" });
Account.belongsTo(User, { foreignKey: "userId" });

Account.hasMany(Transaction, { foreignKey: "accountId" });
Transaction.belongsTo(Account, { foreignKey: "accountId" });

// Payment Request associations
PaymentRequest.belongsTo(User, { as: 'requester', foreignKey: 'fromUserId' });
PaymentRequest.belongsTo(User, { as: 'payer', foreignKey: 'toUserId' });

export { sequelize, User, Account, Transaction, Audit, Loan, PaymentRequest };
