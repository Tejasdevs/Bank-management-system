import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import paymentRequestRoutes from "./routes/paymentRequest.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

app.get("/", (req, res) => res.json({ message: "BMS API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payment-requests", paymentRequestRoutes);

app.use(errorHandler);

export default app;
