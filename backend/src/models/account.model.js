import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Account", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    accountNumber: { type: DataTypes.STRING, unique: true },
    userId: { type: DataTypes.BIGINT, allowNull: false },
    accountType: { type: DataTypes.ENUM("savings","current","fixed"), defaultValue: "savings" },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    balance: { type: DataTypes.DECIMAL(18,2), defaultValue: 0.00 },
    status: { type: DataTypes.ENUM("active","frozen","closed"), defaultValue: "active" }
  }, {
    tableName: "accounts",
    timestamps: true
  });
};
