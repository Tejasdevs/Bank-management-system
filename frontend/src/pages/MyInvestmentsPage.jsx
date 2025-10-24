import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal, SuccessToast, ErrorToast } from "../components/Modal";
import client from "../api/apiClient";

export default function MyInvestmentsPage() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [investmentToDeduct, setInvestmentToDeduct] = useState(null);

  useEffect(() => {
    loadInvestments();
  }, []);

  // Helper to get user-specific storage key
  function getStorageKey() {
    const userData = localStorage.getItem('bms_user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    return `investments_${user.id}`;
  }

  function loadInvestments() {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    const savedInvestments = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Update old investments to have new fields
    const updatedInvestments = savedInvestments.map(inv => {
      // If investment doesn't have new fields, add them
      if (!inv.accountId) {
        return {
          ...inv,
          accountId: null,
          monthsPaid: 0,
          totalMonths: inv.type === 'SIP' ? inv.timePeriod * 12 : 1,
          nextDeductionDate: new Date().toISOString()
        };
      }
      return inv;
    });
    
    // Save updated investments back to localStorage
    if (JSON.stringify(savedInvestments) !== JSON.stringify(updatedInvestments)) {
      localStorage.setItem(storageKey, JSON.stringify(updatedInvestments));
    }
    
    console.log('Loaded investments:', updatedInvestments);
    setInvestments(updatedInvestments);
  }

  const handleDeleteClick = (investment) => {
    setInvestmentToDelete(investment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (investmentToDelete) {
      // Remove investment from array
      const updatedInvestments = investments.filter(inv => inv.id !== investmentToDelete.id);
      
      // Save to localStorage
      const storageKey = getStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updatedInvestments));
      }
      
      // Update state
      setInvestments(updatedInvestments);
      
      // Close modal and show success
      setShowDeleteModal(false);
      setToastMessage("Investment deleted successfully!");
      setShowSuccessToast(true);
      setInvestmentToDelete(null);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleDeductClick = (investment) => {
    setInvestmentToDeduct(investment);
    setShowDeductModal(true);
  };

  const handleConfirmDeduction = async () => {
    if (!investmentToDeduct) return;

    try {
      // Call API to withdraw from account
      const response = await client.post('/transactions/withdraw', {
        accountId: investmentToDeduct.accountId,
        amount: investmentToDeduct.amount,
        narration: `${investmentToDeduct.type} Investment Deduction - Month ${(investmentToDeduct.monthsPaid || 0) + 1}`
      });

      const newMonthsPaid = (investmentToDeduct.monthsPaid || 0) + 1;
      const isCompleted = newMonthsPaid >= investmentToDeduct.totalMonths;

      // If investment is completed, add maturity amount to account
      if (isCompleted) {
        console.log('Investment completed! Crediting maturity amount...');
        console.log('Account ID:', investmentToDeduct.accountId);
        console.log('Maturity Amount:', investmentToDeduct.totalValue);
        
        try {
          const depositResponse = await client.post('/transactions/deposit', {
            accountId: investmentToDeduct.accountId,
            amount: investmentToDeduct.totalValue,
            narration: `🎉 Investment Maturity - ${investmentToDeduct.type} Completed! Total Value: ₹${investmentToDeduct.totalValue.toLocaleString('en-IN')}`
          });
          console.log('Maturity deposit successful:', depositResponse.data);
        } catch (depositError) {
          console.error('Maturity deposit failed:', depositError);
          console.error('Error details:', depositError.response?.data);
          throw depositError; // Re-throw to be caught by outer catch
        }
      }

      // Update investment in localStorage
      const updatedInvestments = investments.map(inv => {
        if (inv.id === investmentToDeduct.id) {
          const nextDate = new Date(inv.nextDeductionDate || new Date());
          nextDate.setMonth(nextDate.getMonth() + 1);
          
          return {
            ...inv,
            monthsPaid: newMonthsPaid,
            nextDeductionDate: nextDate.toISOString(),
            status: isCompleted ? 'completed' : 'active',
            maturityDate: isCompleted ? new Date().toISOString() : null
          };
        }
        return inv;
      });

      // Save to localStorage
      const storageKey = getStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updatedInvestments));
      }
      
      // Update state
      setInvestments(updatedInvestments);
      
      // Close modal and show success
      setShowDeductModal(false);
      
      if (isCompleted) {
        setToastMessage(`🎉 Investment Completed! ₹${investmentToDeduct.totalValue.toLocaleString('en-IN')} credited to your account! Redirecting to dashboard...`);
        
        // Redirect to dashboard after 3 seconds to show updated balance and transactions
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setToastMessage(`₹${investmentToDeduct.amount.toLocaleString('en-IN')} deducted successfully!`);
      }
      
      setShowSuccessToast(true);
      setInvestmentToDeduct(null);
      
      // Hide toast after longer duration for completion message
      setTimeout(() => setShowSuccessToast(false), isCompleted ? 5000 : 3000);
    } catch (error) {
      console.error('Deduction error:', error);
      setShowDeductModal(false);
      setToastMessage(error.response?.data?.error || 'Deduction failed. Please check account balance.');
      setShowErrorToast(true);
      setInvestmentToDeduct(null);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const calculateTotalInvested = () => {
    return investments.reduce((total, inv) => {
      if (inv.type === 'SIP') {
        return total + (inv.amount * inv.timePeriod * 12);
      }
      return total + inv.amount;
    }, 0);
  };

  const calculateTotalExpectedValue = () => {
    return investments.reduce((total, inv) => total + inv.totalValue, 0);
  };

  return (
    <div className="my-investments-page">
      <div className="investments-page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>💰 My Investments</h1>
      </div>

      <div className="investments-page-content">
        {investments.length > 0 && (
          <div className="investments-summary-cards">
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-info">
                <p className="summary-label">Total Plans</p>
                <p className="summary-value">{investments.length}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">💵</div>
              <div className="summary-info">
                <p className="summary-label">Total Invested</p>
                <p className="summary-value">₹{calculateTotalInvested().toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="summary-card highlight">
              <div className="summary-icon">📈</div>
              <div className="summary-info">
                <p className="summary-label">Expected Value</p>
                <p className="summary-value">₹{calculateTotalExpectedValue().toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        <div className="investments-main-card">
          {investments.length > 0 ? (
            <div className="investments-list">
              {investments.map((investment) => (
                <div key={investment.id} className="investment-item">
                  <div className="investment-info">
                    <div className="investment-header-group">
                      <div className="investment-type-badge">{investment.type}</div>
                      <button 
                        className="delete-investment-btn" 
                        onClick={() => handleDeleteClick(investment)}
                        title="Delete Investment"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="investment-details">
                      <p className="investment-amount">
                        ₹{investment.amount.toLocaleString('en-IN')}
                        {investment.type === 'SIP' ? '/month' : ' lumpsum'}
                      </p>
                      <p className="investment-duration">
                        {investment.timePeriod} years @ {investment.returnRate}% p.a.
                      </p>
                      <p className="investment-date">
                        Started: {new Date(investment.startDate).toLocaleDateString('en-IN')}
                      </p>
                      <div className="investment-progress">
                        <p className="progress-text">
                          Progress: {investment.monthsPaid || 0}/{investment.totalMonths || 0} months paid 
                          ({((investment.monthsPaid || 0) / (investment.totalMonths || 1) * 100).toFixed(1)}%)
                        </p>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{width: `${((investment.monthsPaid || 0) / (investment.totalMonths || 1) * 100)}%`}}
                          ></div>
                        </div>
                        {investment.nextDeductionDate && (
                          <p className="next-deduction">
                            Next Deduction: {new Date(investment.nextDeductionDate).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                      {investment.accountId && investment.monthsPaid < investment.totalMonths && (
                        <button className="deduct-now-btn" onClick={() => handleDeductClick(investment)}>
                          💳 Deduct Now
                        </button>
                      )}
                      {investment.monthsPaid >= investment.totalMonths && (
                        <div className="investment-completed-card">
                          <p className="completed-title">🎉 Investment Completed!</p>
                          <div className="maturity-details">
                            <div className="maturity-row">
                              <span className="maturity-label">Total Invested:</span>
                              <span className="maturity-value">₹{investment.investedAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="maturity-row">
                              <span className="maturity-label">Total Returns:</span>
                              <span className="maturity-value positive">₹{investment.estimatedReturns.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="maturity-row highlight">
                              <span className="maturity-label">Maturity Value:</span>
                              <span className="maturity-value">₹{investment.totalValue.toLocaleString('en-IN')}</span>
                            </div>
                            {investment.maturityDate && (
                              <div className="maturity-row">
                                <span className="maturity-label">Maturity Date:</span>
                                <span className="maturity-value">{new Date(investment.maturityDate).toLocaleDateString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                          <p className="maturity-note">✅ Amount credited to your account</p>
                        </div>
                      )}
                      {!investment.accountId && (
                        <p className="no-account-warning">⚠️ No account linked - Create new investment to link account</p>
                      )}
                    </div>
                  </div>
                  <div className="investment-value">
                    <p className="value-label">Invested Amount</p>
                    <p className="value-amount-small">₹{investment.investedAmount.toLocaleString('en-IN')}</p>
                    <p className="value-label">Expected Returns</p>
                    <p className="value-amount-small">₹{investment.estimatedReturns.toLocaleString('en-IN')}</p>
                    <p className="value-label">Total Value</p>
                    <p className="value-amount">₹{investment.totalValue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-investments">
              <p className="no-investments-icon">📊</p>
              <p className="no-investments-text">No active investments yet</p>
              <p className="no-investments-subtext">Use the SIP Calculator to start investing!</p>
              <button className="start-investing-btn" onClick={() => navigate('/sip-calculator')}>
                Start Investing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Investment?"
        message="Are you sure you want to delete this investment plan? This action cannot be undone."
        details={investmentToDelete ? [
          { label: "Type", value: investmentToDelete.type },
          { label: "Amount", value: `₹${investmentToDelete.amount.toLocaleString('en-IN')}${investmentToDelete.type === 'SIP' ? '/month' : ' lumpsum'}` },
          { label: "Duration", value: `${investmentToDelete.timePeriod} years` },
          { label: "Expected Value", value: `₹${investmentToDelete.totalValue.toLocaleString('en-IN')}` }
        ] : []}
      />

      {/* Deduction Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeductModal}
        onClose={() => setShowDeductModal(false)}
        onConfirm={handleConfirmDeduction}
        title="Confirm Deduction?"
        message="This will deduct the investment amount from your linked account."
        details={investmentToDeduct ? [
          { label: "Type", value: investmentToDeduct.type },
          { label: "Amount to Deduct", value: `₹${investmentToDeduct.amount.toLocaleString('en-IN')}` },
          { label: "Current Progress", value: `${investmentToDeduct.monthsPaid || 0}/${investmentToDeduct.totalMonths || 0} months` },
          { label: "After Deduction", value: `${(investmentToDeduct.monthsPaid || 0) + 1}/${investmentToDeduct.totalMonths || 0} months` }
        ] : []}
      />

      {/* Success Toast */}
      <SuccessToast
        isOpen={showSuccessToast}
        message={toastMessage}
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Error Toast */}
      <ErrorToast
        isOpen={showErrorToast}
        message={toastMessage}
        onClose={() => setShowErrorToast(false)}
      />
    </div>
  );
}
