import express from "express";
import { createAccount, getAccount, getUserAccounts, getAccountTransactions, freezeAccount } from "../controllers/account.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/user", protect, getUserAccounts); // Get all accounts for logged-in user
router.post("/", protect, createAccount); // customers can open account for themselves
router.get("/:id", protect, getAccount);
router.get("/:accountId/transactions", protect, getAccountTransactions); // Get transactions for an account
router.patch("/:id/freeze", protect, authorize("admin"), freezeAccount);

export default router;
