import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/apiClient";
import { SuccessToast, ErrorToast } from "../components/Modal";
import "../styles/statements.css";

export default function AccountStatements() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Date range states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await client.get("/accounts/user");
      setAccounts(res.data);
      if (res.data.length > 0) {
        setSelectedAccount(res.data[0]);
        fetchTransactions(res.data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId) => {
    try {
      const res = await client.get(`/accounts/${accountId}/transactions`);
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAccountChange = (accountId) => {
    const account = accounts.find(acc => acc.id === parseInt(accountId));
    setSelectedAccount(account);
    fetchTransactions(accountId);
  };

  const filterTransactionsByDate = () => {
    if (!startDate && !endDate) return transactions;
    
    return transactions.filter(txn => {
      const txnDate = new Date(txn.createdAt);
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      
      return txnDate >= start && txnDate <= end;
    });
  };

  const filteredTransactions = filterTransactionsByDate();

  const calculateSummary = () => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalTransfersIn = 0;
    let totalTransfersOut = 0;

    filteredTransactions.forEach(txn => {
      const amount = parseFloat(txn.amount);
      
      if (txn.type === 'deposit') {
        totalDeposits += amount;
      } else if (txn.type === 'withdraw') {
        totalWithdrawals += amount;
      } else if (txn.type === 'transfer') {
        if (txn.toAccountId === selectedAccount?.id) {
          totalTransfersIn += amount;
        } else {
          totalTransfersOut += amount;
        }
      }
    });

    return {
      totalDeposits,
      totalWithdrawals,
      totalTransfersIn,
      totalTransfersOut,
      netChange: totalDeposits + totalTransfersIn - totalWithdrawals - totalTransfersOut
    };
  };

  const summary = calculateSummary();

  const downloadStatement = () => {
    setGenerating(true);
    
    try {
      // Create CSV content
      let csvContent = "Date,Type,Amount,Balance After,Narration\n";
      
      filteredTransactions.forEach(txn => {
        const date = new Date(txn.createdAt).toLocaleString();
        const type = txn.type.charAt(0).toUpperCase() + txn.type.slice(1);
        const amount = parseFloat(txn.amount).toFixed(2);
        const balance = parseFloat(txn.balanceAfter).toFixed(2);
        const narration = txn.narration || '-';
        
        csvContent += `"${date}","${type}","${amount}","${balance}","${narration}"\n`;
      });
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${selectedAccount?.accountNumber}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setToastMessage('Statement downloaded successfully!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Download error:', error);
      setToastMessage('Failed to download statement');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="statements-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statements-page">
      <div className="statements-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>📊 Account Statements</h1>
      </div>

      <div className="statements-container">
        {/* Account Selector */}
        <div className="statement-card">
          <h3>Select Account</h3>
          <select 
            value={selectedAccount?.id || ''} 
            onChange={(e) => handleAccountChange(e.target.value)}
            className="account-select"
          >
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.accountNumber} - {account.accountType} (₹{parseFloat(account.balance).toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="statement-card">
          <h3>Select Date Range</h3>
          <div className="date-range-inputs">
            <div className="date-input-group">
              <label>From:</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>To:</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            <button 
              className="clear-dates-btn"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="statement-card summary-card">
          <h3>Transaction Summary</h3>
          <div className="summary-grid">
            <div className="summary-item positive">
              <span className="summary-label">💰 Total Deposits</span>
              <span className="summary-value">₹{summary.totalDeposits.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="summary-item negative">
              <span className="summary-label">💸 Total Withdrawals</span>
              <span className="summary-value">₹{summary.totalWithdrawals.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="summary-item positive">
              <span className="summary-label">📥 Transfers In</span>
              <span className="summary-value">₹{summary.totalTransfersIn.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="summary-item negative">
              <span className="summary-label">📤 Transfers Out</span>
              <span className="summary-value">₹{summary.totalTransfersOut.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className={`summary-item net ${summary.netChange >= 0 ? 'positive' : 'negative'}`}>
              <span className="summary-label">📊 Net Change</span>
              <span className="summary-value">
                {summary.netChange >= 0 ? '+' : ''}₹{summary.netChange.toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">📝 Total Transactions</span>
              <span className="summary-value">{filteredTransactions.length}</span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="download-section">
          <button 
            className="download-statement-btn"
            onClick={downloadStatement}
            disabled={generating || filteredTransactions.length === 0}
          >
            {generating ? '⏳ Generating...' : '📥 Download Statement (CSV)'}
          </button>
        </div>

        {/* Transactions Table */}
        <div className="statement-card">
          <h3>Transaction History ({filteredTransactions.length})</h3>
          {filteredTransactions.length === 0 ? (
            <p className="no-transactions">No transactions found for the selected period.</p>
          ) : (
            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Narration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(txn => {
                    const isMoneyIn = txn.type === 'deposit' || 
                                     (txn.type === 'transfer' && txn.toAccountId === selectedAccount?.id);
                    
                    return (
                      <tr key={txn.id}>
                        <td>{new Date(txn.createdAt).toLocaleString('en-IN')}</td>
                        <td className={`type-${txn.type}`}>
                          {txn.type === 'transfer' 
                            ? (isMoneyIn ? 'Transfer In' : 'Transfer Out')
                            : txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                        </td>
                        <td className={isMoneyIn ? 'positive' : 'negative'}>
                          {isMoneyIn ? '+' : '-'}₹{parseFloat(txn.amount).toFixed(2)}
                        </td>
                        <td>₹{parseFloat(txn.balanceAfter).toFixed(2)}</td>
                        <td>{txn.narration || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
