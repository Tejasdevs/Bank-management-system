import React from "react";

export default function InvestmentConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  investmentData 
}) {
  if (!isOpen) return null;

  const { type, amount, returnRate, timePeriod, totalValue } = investmentData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content investment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Confirm Investment</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="investment-summary">
            <div className="summary-icon">💰</div>
            <h3>
              {type === 'SIP' 
                ? `Start investing ₹${amount.toLocaleString('en-IN')}/month?` 
                : `Invest ₹${amount.toLocaleString('en-IN')} as lumpsum?`
              }
            </h3>
            <p className="summary-description">
              {type === 'SIP'
                ? 'This amount will be deducted from your account monthly'
                : 'This amount will be deducted from your account once'
              }
            </p>
          </div>

          <div className="investment-details">
            <div className="detail-row">
              <span className="detail-label">Investment Type</span>
              <span className="detail-value">{type}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                {type === 'SIP' ? 'Monthly Amount' : 'Total Amount'}
              </span>
              <span className="detail-value">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Expected Return Rate</span>
              <span className="detail-value">{returnRate}% p.a.</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time Period</span>
              <span className="detail-value">{timePeriod} years</span>
            </div>
            <div className="detail-row highlight">
              <span className="detail-label">Expected Total Value</span>
              <span className="detail-value">₹{totalValue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="investment-note">
            <span className="note-icon">ℹ️</span>
            <p>Your investment will be activated immediately and tracked in your dashboard.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Confirm Investment
          </button>
        </div>
      </div>
    </div>
  );
}
