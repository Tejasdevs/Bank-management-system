import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("User", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("customer", "admin", "teller"), defaultValue: "customer" },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: "users",
    timestamps: true
  });
};
