import express from "express";
import { deposit, withdraw, transfer, deleteTransaction } from "../controllers/transaction.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/deposit", protect, deposit);
router.post("/withdraw", protect, withdraw);
router.post("/transfer", protect, transfer);
router.delete("/:id", protect, deleteTransaction);

export default router;
