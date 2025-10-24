import cron from "node-cron";
import { Account, Transaction } from "../models/index.js";

/**
 * Simple interest job that runs once a day at midnight
 * (Just an example; real interest calc would be monthly/quarterly)
 */
export const scheduleInterest = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const accounts = await Account.findAll();
      for (const acc of accounts) {
        const rate = 3; // annual percent for demo; realistically per-account
        const interest = (parseFloat(acc.balance) * (rate / 100)) / 365; // daily approx
        if (interest > 0) {
          acc.balance = parseFloat(acc.balance) + interest;
          await acc.save();
          await Transaction.create({
            accountId: acc.id,
            type: "interest",
            amount: interest,
            balanceAfter: acc.balance,
            narration: "Daily interest"
          });
        }
      }
      console.log("Interest job completed");
    } catch (err) {
      console.error("Interest job error", err);
    }
  });
};
