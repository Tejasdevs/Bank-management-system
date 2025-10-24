import dotenv from "dotenv";
dotenv.config();
import { sequelize, User, Account } from "../models/index.js";
import bcrypt from "bcryptjs";
import generateAccountNumber from "../utils/generateAccountNumber.js";

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    const salt = Number(process.env.BCRYPT_SALT || 10);
    const adminPass = await bcrypt.hash("Admin123!", salt);
    const alicePass = await bcrypt.hash("Alice123!", salt);
    const bobPass = await bcrypt.hash("Bob123!", salt);

    const admin = await User.create({ name: "Admin", email: "admin@bank.com", passwordHash: adminPass, role: "admin" });
    const alice = await User.create({ name: "Alice", email: "alice@bank.com", passwordHash: alicePass, role: "customer" });
    const bob = await User.create({ name: "Bob", email: "bob@bank.com", passwordHash: bobPass, role: "customer" });

    const aliceAccount = await Account.create({ userId: alice.id, accountNumber: generateAccountNumber(), accountType: "savings", balance: 50000 });
    const bobAccount = await Account.create({ userId: bob.id, accountNumber: generateAccountNumber(), accountType: "savings", balance: 7500 });

    console.log("✅ Seed complete!");
    console.log("\n📝 Test Accounts Created:");
    console.log("   👤 Alice: alice@bank.com / Alice123!");
    console.log("      💰 Balance: ₹50,000");
    console.log("      🏦 Account: " + aliceAccount.accountNumber);
    console.log("\n   👤 Bob: bob@bank.com / Bob123!");
    console.log("      💰 Balance: ₹7,500");
    console.log("      🏦 Account: " + bobAccount.accountNumber);
    console.log("\n   👤 Admin: admin@bank.com / Admin123!");
    console.log("\n🎉 You can now login at http://localhost:3000");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
