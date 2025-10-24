import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SIPCalculatorPage from "./pages/SIPCalculatorPage.jsx";
import MyInvestmentsPage from "./pages/MyInvestmentsPage.jsx";
import AccountStatements from "./pages/AccountStatements.jsx";
import BudgetPlanner from "./pages/BudgetPlanner.jsx";
import SavingsGoals from "./pages/SavingsGoals.jsx";
import PaymentRequests from "./pages/PaymentRequests.jsx";
import HelpSupport from "./pages/HelpSupport.jsx";
import About from "./pages/About.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sip-calculator" element={<SIPCalculatorPage />} />
        <Route path="my-investments" element={<MyInvestmentsPage />} />
        <Route path="account-statements" element={<AccountStatements />} />
        <Route path="budget-planner" element={<BudgetPlanner />} />
        <Route path="savings-goals" element={<SavingsGoals />} />
        <Route path="payment-requests" element={<PaymentRequests />} />
        <Route path="help-support" element={<HelpSupport />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
