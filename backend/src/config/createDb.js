import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export async function createDatabase() {
  try {
    // Connect without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS || ""
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' is ready`);
    
    await connection.end();
    return true;
  } catch (err) {
    console.error("❌ Database creation failed:", err.message);
    return false;
  }
}
