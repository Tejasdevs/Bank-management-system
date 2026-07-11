import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Transaction = sequelize.define("Transaction", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.BIGINT, allowNull: false },
    type: { type: DataTypes.ENUM("deposit","withdraw","transfer","fee","interest"), allowNull: false },
    amount: { type: DataTypes.DECIMAL(18,2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    relatedAccountId: { type: DataTypes.BIGINT, allowNull: true },
    balanceAfter: { type: DataTypes.DECIMAL(18,2) },
    narration: { type: DataTypes.STRING }
  }, {
    tableName: "transactions",
    timestamps: true
  });

  // Define association with Account model for relatedAccount
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Account, {
      as: 'relatedAccount',
      foreignKey: 'relatedAccountId',
      onDelete: 'SET NULL',
      hooks: true
    });
  };

  return Transaction;
};
