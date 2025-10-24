import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Using SQLite - no MySQL installation needed!
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite", // Database file will be created here
  logging: false
});

export default sequelize;
