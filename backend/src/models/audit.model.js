import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Audit", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    entity: DataTypes.STRING,
    entityId: DataTypes.STRING,
    action: DataTypes.STRING,
    dataBefore: DataTypes.JSON,
    dataAfter: DataTypes.JSON,
    performedBy: DataTypes.BIGINT
  }, {
    tableName: "audits",
    timestamps: true
  });
};
