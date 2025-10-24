import express from "express";
import { sequelize, PaymentRequest, User, Account, Transaction } from "../models/index.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all users (for dropdown) - excluding current user
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        id: { [sequelize.Sequelize.Op.ne]: req.user.id }
      },
      attributes: ['id', 'name', 'email'],
      include: [{
        model: Account,
        attributes: ['accountNumber'],
        limit: 1
      }]
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to load users" });
  }
});

// Send payment request
router.post("/", protect, async (req, res) => {
  try {
    const { toUserId, toAccountNumber, amount, reason } = req.body;
    const fromUserId = req.user.id;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!toUserId && !toAccountNumber) {
      return res.status(400).json({ message: "Please provide user ID or account number" });
    }

    let recipientUserId = toUserId;

    // If account number provided, find user
    if (toAccountNumber) {
      const account = await Account.findOne({ 
        where: { accountNumber: toAccountNumber },
        include: [{ model: User }]
      });
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      recipientUserId = account.userId;
      console.log("Found recipient user ID:", recipientUserId);
    }

    if (fromUserId === parseInt(recipientUserId)) {
      return res.status(400).json({ message: "Cannot request money from yourself" });
    }

    // Check if recipient exists
    const recipient = await User.findByPk(recipientUserId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    console.log("Creating payment request:");
    console.log("From User ID:", fromUserId);
    console.log("To User ID:", recipientUserId);
    console.log("Amount:", amount);

    // Create payment request
    const paymentRequest = await PaymentRequest.create({
      fromUserId,
      toUserId: parseInt(recipientUserId),
      amount: parseFloat(amount),
      reason: reason || null,
      status: 'pending'
    });

    console.log("Payment request created:", paymentRequest.toJSON());

    res.status(201).json({ 
      message: "Payment request sent successfully",
      request: paymentRequest 
    });
  } catch (error) {
    console.error("Error creating payment request:", error);
    res.status(500).json({ message: "Failed to send payment request" });
  }
});

// Get incoming requests (requests TO me)
router.get("/incoming", protect, async (req, res) => {
  try {
    const requests = await PaymentRequest.findAll({
      where: {
        toUserId: req.user.id,
        status: 'pending'
      },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    res.status(500).json({ message: "Failed to load requests" });
  }
});

// Get sent requests (requests FROM me)
router.get("/sent", protect, async (req, res) => {
  try {
    const requests = await PaymentRequest.findAll({
      where: {
        fromUserId: req.user.id
      },
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({ message: "Failed to load requests" });
  }
});

// Approve payment request
router.post("/:id/approve", protect, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const requestId = req.params.id;
    const payerId = req.user.id;
    const { password } = req.body;

    // Verify password
    if (!password) {
      await transaction.rollback();
      return res.status(400).json({ message: "Password is required" });
    }

    const bcrypt = await import("bcryptjs");
    const user = await User.findByPk(payerId);
    const isPasswordValid = await bcrypt.default.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      await transaction.rollback();
      return res.status(401).json({ message: "Invalid password" });
    }

    // Find the request
    const paymentRequest = await PaymentRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'payer' }
      ],
      transaction
    });

    if (!paymentRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: "Payment request not found" });
    }

    // Verify the user is the payer
    if (paymentRequest.toUserId !== payerId) {
      await transaction.rollback();
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if already processed
    if (paymentRequest.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: "Request already processed" });
    }

    // Get payer's account
    const payerAccount = await Account.findOne({ 
      where: { userId: payerId },
      transaction
    });
    
    if (!payerAccount) {
      await transaction.rollback();
      return res.status(404).json({ message: "Payer account not found" });
    }

    // Check balance
    if (parseFloat(payerAccount.balance) < parseFloat(paymentRequest.amount)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Get requester's account
    const requesterAccount = await Account.findOne({ 
      where: { userId: paymentRequest.fromUserId },
      transaction
    });
    
    if (!requesterAccount) {
      await transaction.rollback();
      return res.status(404).json({ message: "Requester account not found" });
    }

    // Perform transfer
    payerAccount.balance = parseFloat(payerAccount.balance) - parseFloat(paymentRequest.amount);
    requesterAccount.balance = parseFloat(requesterAccount.balance) + parseFloat(paymentRequest.amount);

    await payerAccount.save({ transaction });
    await requesterAccount.save({ transaction });

    // Update request status
    paymentRequest.status = 'approved';
    paymentRequest.respondedAt = new Date();
    await paymentRequest.save({ transaction });

    // Create transaction records
    await Transaction.create({
      accountId: payerAccount.id,
      type: 'withdraw',
      amount: paymentRequest.amount,
      narration: `Payment to ${paymentRequest.requester.name} - ${paymentRequest.reason || 'Payment Request'}`
    }, { transaction });

    await Transaction.create({
      accountId: requesterAccount.id,
      type: 'deposit',
      amount: paymentRequest.amount,
      narration: `Payment from ${paymentRequest.payer.name} - ${paymentRequest.reason || 'Payment Request'}`
    }, { transaction });

    await transaction.commit();

    res.json({ 
      message: "Payment approved successfully",
      paymentRequest
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error approving payment:", error);
    res.status(500).json({ message: "Failed to approve payment" });
  }
});

// Reject payment request
router.post("/:id/reject", protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const payerId = req.user.id;

    const paymentRequest = await PaymentRequest.findByPk(requestId);

    if (!paymentRequest) {
      return res.status(404).json({ message: "Payment request not found" });
    }

    if (paymentRequest.toUserId !== payerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: "Request already processed" });
    }

    paymentRequest.status = 'rejected';
    paymentRequest.respondedAt = new Date();
    await paymentRequest.save();

    res.json({ 
      message: "Payment request rejected",
      paymentRequest
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ message: "Failed to reject payment" });
  }
});

export default router;
