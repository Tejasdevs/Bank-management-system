import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { ConfirmModal, SuccessToast } from "./Modal";
import client from "../api/apiClient";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [investmentCount, setInvestmentCount] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvestmentCount();
  }, []);

  const loadInvestmentCount = () => {
    // Get user-specific investments
    const userData = sessionStorage.getItem('bms_user');
    const user = userData ? JSON.parse(userData) : null;
    const storageKey = user ? `investments_${user.id}` : 'investments';
    
    const investments = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setInvestmentCount(investments.length);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    loadInvestmentCount(); // Refresh count when opening menu
  };

  const handleSIPCalculatorClick = () => {
    navigate('/sip-calculator');
    setIsOpen(false);
  };

  const handleMyInvestmentsClick = () => {
    navigate('/my-investments');
    setIsOpen(false);
  };

  const handleAccountStatementsClick = () => {
    navigate('/account-statements');
    setIsOpen(false);
  };

  const handleBudgetPlannerClick = () => {
    navigate('/budget-planner');
    setIsOpen(false);
  };

  const handleSavingsGoalsClick = () => {
    navigate('/savings-goals');
    setIsOpen(false);
  };

  const handlePaymentRequestsClick = () => {
    navigate('/payment-requests');
    setIsOpen(false);
  };

  const handleHelpSupportClick = () => {
    navigate('/help-support');
    setIsOpen(false);
  };

  const handleAboutClick = () => {
    navigate('/about');
    setIsOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bms_token");
    sessionStorage.removeItem("bms_user");
    navigate("/");
  };

  const handleResetClick = () => {
    setShowResetModal(true);
    setIsOpen(false);
  };

  const handleConfirmReset = async () => {
    try {
      // Get current user
      const userData = sessionStorage.getItem('bms_user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user) return;

      // Delete all transactions for user's accounts
      const accountsRes = await client.get("/accounts/user");
      const accounts = accountsRes.data;
      
      for (const account of accounts) {
        // Get all transactions for this account
        const txnRes = await client.get(`/accounts/${account.id}/transactions`);
        const transactions = txnRes.data;
        
        // Delete each transaction
        for (const txn of transactions) {
          await client.delete(`/transactions/${txn.id}`);
        }
      }

      // Clear user-specific investments from localStorage
      const storageKey = `investments_${user.id}`;
      localStorage.removeItem(storageKey);

      // Close modal and show success
      setShowResetModal(false);
      setShowSuccessToast(true);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Reset error:', error);
      alert('Failed to reset data. Please try again.');
      setShowResetModal(false);
    }
  };

  return (
    <>
      <div className="hamburger-container">
        <button className="hamburger-btn" onClick={toggleMenu}>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {isOpen && (
        <>
          <div className="hamburger-overlay" onClick={toggleMenu}></div>
          <div className="hamburger-menu">
            <div className="menu-header">
              <h3>Menu</h3>
              <button className="menu-close-btn" onClick={toggleMenu}>✕</button>
            </div>
            <ul className="menu-list">
              <li className="menu-item" onClick={handleSIPCalculatorClick}>
                <span className="menu-icon">📊</span>
                <span>SIP Calculator</span>
              </li>
              <li className="menu-item" onClick={handleMyInvestmentsClick}>
                <span className="menu-icon">💰</span>
                <span>My Investments</span>
                {investmentCount > 0 && (
                  <span className="menu-badge">{investmentCount}</span>
                )}
              </li>
              
              {/* Add more features here - they will appear between My Investments and Reset */}
              <li className="menu-item" onClick={handleAccountStatementsClick}>
                <span className="menu-icon">📊</span>
                <span>Account Statements</span>
              </li>
              
              <li className="menu-item" onClick={handleBudgetPlannerClick}>
                <span className="menu-icon">💰</span>
                <span>Budget Planner</span>
              </li>
              
              <li className="menu-item" onClick={handleSavingsGoalsClick}>
                <span className="menu-icon">🎯</span>
                <span>Savings Goals</span>
              </li>
              
              <li className="menu-item" onClick={handlePaymentRequestsClick}>
                <span className="menu-icon">💸</span>
                <span>Payment Requests</span>
              </li>
              
              <li className="menu-item" onClick={handleHelpSupportClick}>
                <span className="menu-icon">❓</span>
                <span>Help & Support</span>
              </li>
              
              <li className="menu-item" onClick={handleAboutClick}>
                <span className="menu-icon">ℹ️</span>
                <span>About</span>
              </li>
              
              {/* Logout - 2nd last */}
              <li className="menu-item menu-item-logout" onClick={handleLogout}>
                <span className="menu-icon">🚪</span>
                <span>Logout</span>
              </li>
              
              {/* Reset button stays at the bottom */}
              <li className="menu-item menu-item-danger" onClick={handleResetClick}>
                <span className="menu-icon">🔄</span>
                <span>Reset All Data</span>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && ReactDOM.createPortal(
        <ConfirmModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleConfirmReset}
          title="Reset All Data?"
          message="This will permanently delete ALL your transactions and investments. This action cannot be undone!"
          details={[
            { label: "⚠️ Warning", value: "All transaction history will be deleted" },
            { label: "⚠️ Warning", value: "All investments will be removed" },
            { label: "✅ Note", value: "Your accounts will remain (balance reset to initial)" }
          ]}
        />,
        document.body
      )}

      {/* Success Toast */}
      {showSuccessToast && ReactDOM.createPortal(
        <SuccessToast
          isOpen={showSuccessToast}
          message="All data reset successfully! Reloading..."
          onClose={() => setShowSuccessToast(false)}
        />,
        document.body
      )}
    </>
  );
}
