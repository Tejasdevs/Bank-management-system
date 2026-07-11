import cron from "node-cron";
import { Account, Transaction } from "../models/index.js";


export const scheduleInterest = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const accounts = await Account.findAll();
      for (const acc of accounts) {
        const rate = 3;
        const interest = (parseFloat(acc.balance) * (rate / 100)) / 365; 
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
