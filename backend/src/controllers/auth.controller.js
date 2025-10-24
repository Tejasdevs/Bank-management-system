import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { User, Account } from "../models/index.js";
import generateAccountNumber from "../utils/generateAccountNumber.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "User exists" });
    const salt = Number(process.env.BCRYPT_SALT || 10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, passwordHash, role: "customer" });

    // Create default account for user
    const accountNumber = generateAccountNumber();
    const account = await Account.create({
      userId: user.id,
      accountNumber,
      accountType: "savings",
      balance: 0
    });

    res.status(201).json({ message: "Registered", user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res.json({ 
      message: "Profile updated successfully", 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = Number(process.env.BCRYPT_SALT || 10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) { next(err); }
};
