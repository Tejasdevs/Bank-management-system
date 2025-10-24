import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Loan", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.BIGINT, allowNull: false },
    principal: { type: DataTypes.DECIMAL(18,2), allowNull: false },
    rate: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    tenureMonths: { type: DataTypes.INTEGER, allowNull: false },
    outstanding: { type: DataTypes.DECIMAL(18,2), defaultValue: 0.00 },
    status: { type: DataTypes.ENUM("applied","approved","rejected","closed"), defaultValue: "applied" }
  }, {
    tableName: "loans",
    timestamps: true
  });
};
