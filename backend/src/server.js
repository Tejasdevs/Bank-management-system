import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { sequelize } from "./models/index.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Creates tables automatically
    console.log("✅ SQLite database connected & synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err.message);
    process.exit(1);
  }
}

start();
