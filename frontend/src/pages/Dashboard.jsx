import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client, { setAuthToken } from "../api/apiClient";
import { ConfirmModal, SuccessToast, ErrorToast } from "../components/Modal";
import HamburgerMenu from "../components/HamburgerMenu";
import NotificationBell from "../components/NotificationBell";
import ProfileSettings from "../components/ProfileSettings";
import DarkModeToggle from "../components/DarkModeToggle";

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
  
  // Transaction form states
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNarration, setDepositNarration] = useState("");
  const [depositType, setDepositType] = useState("main"); // "main" or "savings"
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNarration, setWithdrawNarration] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferNarration, setTransferNarration] = useState("");
  
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Transaction deletion states
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showDeleteTransactionsModal, setShowDeleteTransactionsModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("bms_token");
    const userData = sessionStorage.getItem("bms_user");
    
    if (!token) { 
      navigate("/login"); 
      return; 
    }
    
    setAuthToken(token);
    if (userData) setUser(JSON.parse(userData));
    fetchAccounts();
    loadInvestments();
  }, [navigate]);

  function loadInvestments() {
    const savedInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
    console.log('Loaded investments:', savedInvestments);
    setInvestments(savedInvestments);
  }

  async function fetchAccounts() {
    try {
      const res = await client.get("/accounts/user");
      setAccounts(res.data);
      if (res.data.length > 0) {
        setSelectedAccount(res.data[0]);
        fetchTransactions(res.data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("bms_token");
        localStorage.removeItem("bms_user");
        navigate("/login");
      }
      setLoading(false);
    }
  }

  async function fetchTransactions(accountId) {
    try {
      const res = await client.get(`/accounts/${accountId}/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleDeposit(e) {
    e.preventDefault();
    if (!selectedAccount || !depositAmount) return;
    setShowDepositModal(true);
  }

  async function confirmDeposit() {
    setShowDepositModal(false);
    const amount = parseFloat(depositAmount);
    
    try {
      if (depositType === "main") {
        // Deposit to main bank balance
        await client.post("/transactions/deposit", { 
          accountId: selectedAccount.id, 
          amount: amount,
          narration: depositNarration || "Deposit"
        });
        setToastMessage("Deposit successful!");
        setShowSuccessToast(true);
      } else {
        // Deposit to savings goal - deduct from balance
        const goalNarration = depositNarration 
          ? `${depositNarration} - Savings Goal Deposit`
          : "Savings Goal Deposit";
        
        await client.post("/transactions/withdraw", { 
          accountId: selectedAccount.id, 
          amount: amount,
          narration: goalNarration
        });
        setToastMessage("Amount deducted and added to savings goal!");
        setShowSuccessToast(true);
      }
      
      setDepositAmount("");
      setDepositNarration("");
      setDepositType("main");
      fetchAccounts();
      fetchTransactions(selectedAccount.id);
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Transaction failed");
      setShowErrorToast(true);
    }
  }

  function handleWithdraw(e) {
    e.preventDefault();
    if (!selectedAccount || !withdrawAmount) return;
    setShowWithdrawModal(true);
  }

  async function confirmWithdraw() {
    setShowWithdrawModal(false);
    const amount = parseFloat(withdrawAmount);
    
    try {
      await client.post("/transactions/withdraw", { 
        accountId: selectedAccount.id, 
        amount: amount,
        narration: withdrawNarration || "Withdrawal"
      });
      setToastMessage("Withdrawal successful!");
      setShowSuccessToast(true);
      setWithdrawAmount("");
      setWithdrawNarration("");
      fetchAccounts();
      fetchTransactions(selectedAccount.id);
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Withdrawal failed");
      setShowErrorToast(true);
    }
  }

  function handleTransfer(e) {
    e.preventDefault();
    if (!selectedAccount || !transferAmount || !transferTo) return;
    setShowTransferModal(true);
  }

  async function confirmTransfer() {
    setShowTransferModal(false);
    const amount = parseFloat(transferAmount);
    
    try {
      await client.post("/transactions/transfer", { 
        fromAccountId: selectedAccount.id, 
        toAccountNumber: transferTo,
        amount: amount,
        narration: transferNarration || "Transfer"
      });
      setToastMessage("Transfer successful!");
      setShowSuccessToast(true);
      setTransferAmount("");
      setTransferTo("");
      setTransferNarration("");
      fetchAccounts();
      fetchTransactions(selectedAccount.id);
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Transfer failed");
      setShowErrorToast(true);
    }
  }

  function handleLogout() {
    // Only remove auth data, keep investments
    localStorage.removeItem("bms_token");
    localStorage.removeItem("bms_user");
    // Note: investments stay in localStorage for this browser
    navigate("/");
  }

  function handleAccountChange(accountId) {
    const account = accounts.find(acc => acc.id === parseInt(accountId));
    setSelectedAccount(account);
    fetchTransactions(accountId);
  }

  async function handleRefresh() {
    if (!selectedAccount) return;
    
    try {
      // Show loading state
      const refreshBtn = document.querySelector('.refresh-btn');
      if (refreshBtn) {
        refreshBtn.textContent = '⏳ Refreshing...';
        refreshBtn.disabled = true;
      }

      // Fetch updated account data
      await fetchAccounts();
      
      // Fetch updated transactions
      if (selectedAccount) {
        await fetchTransactions(selectedAccount.id);
      }

      // Reset button
      if (refreshBtn) {
        refreshBtn.textContent = '✅ Updated!';
        setTimeout(() => {
          refreshBtn.textContent = '🔄 Refresh';
          refreshBtn.disabled = false;
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to refresh. Please try again.');
      const refreshBtn = document.querySelector('.refresh-btn');
      if (refreshBtn) {
        refreshBtn.textContent = '🔄 Refresh';
        refreshBtn.disabled = false;
      }
    }
  }

  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAllTransactions = (e) => {
    if (e.target.checked) {
      setSelectedTransactions(transactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleDeleteTransactionsClick = () => {
    if (selectedTransactions.length === 0) {
      alert('Please select at least one transaction to delete');
      return;
    }
    setShowDeleteTransactionsModal(true);
  };

  const handleConfirmDeleteTransactions = async () => {
    try {
      console.log('Deleting transactions:', selectedTransactions);
      const count = selectedTransactions.length;
      
      // Delete transactions one by one to avoid database lock issues
      for (const txnId of selectedTransactions) {
        console.log('Deleting transaction:', txnId);
        try {
          const response = await client.delete(`/transactions/${txnId}`);
          console.log('Delete response:', response.data);
        } catch (err) {
          console.error('Failed to delete transaction:', txnId, err);
          throw err;
        }
      }
      
      console.log('All transactions deleted successfully');

      // Refresh transactions
      await fetchTransactions(selectedAccount.id);
      
      // Refresh account balance
      const res = await client.get("/accounts/user");
      setAccounts(res.data);
      const updatedAccount = res.data.find(acc => acc.id === selectedAccount.id);
      if (updatedAccount) {
        setSelectedAccount(updatedAccount);
      }

      setShowDeleteTransactionsModal(false);
      setSelectedTransactions([]);
      setToastMessage(`${count} transaction(s) deleted successfully!`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response?.data);
      setShowDeleteTransactionsModal(false);
      setToastMessage(error.response?.data?.message || error.response?.data?.error || 'Failed to delete transactions');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user?.name}!</h2>
        <div className="header-actions">
          <NotificationBell />
          <DarkModeToggle />
          <ProfileSettings />
          <HamburgerMenu />
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="no-accounts">
          <p>No accounts found. Please contact support.</p>
        </div>
      ) : (
        <>
          <div className="account-selector">
            <label>Select Account: </label>
            <select onChange={(e) => handleAccountChange(e.target.value)} value={selectedAccount?.id || ""}>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} ({acc.accountType})
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div className="account-card">
              <div className="account-card-header">
                <div>
                  <h3>{selectedAccount.accountNumber}</h3>
                  <p className="account-type">{selectedAccount.accountType.toUpperCase()} Account</p>
                </div>
                <button className="refresh-btn" onClick={handleRefresh} title="Refresh Balance">
                  🔄 Refresh
                </button>
              </div>
              <p className="balance">Balance: ₹{parseFloat(selectedAccount.balance).toFixed(2)}</p>
              <p className="status">Status: <span className={`status-${selectedAccount.status}`}>{selectedAccount.status}</span></p>
            </div>
          )}

          <div className="transaction-forms">
            <div className="form-section">
              <h3>Deposit</h3>
              <form onSubmit={handleDeposit}>
                <select 
                  value={depositType} 
                  onChange={e=>setDepositType(e.target.value)}
                  className="deposit-type-select"
                >
                  <option value="main">💰 Main Bank Balance</option>
                  <option value="savings">🎯 Savings Goal</option>
                </select>
                <input 
                  type="number" 
                  step="0.01"
                  value={depositAmount} 
                  onChange={e=>setDepositAmount(e.target.value)} 
                  placeholder="Amount" 
                  required
                />
                <input 
                  value={depositNarration} 
                  onChange={e=>setDepositNarration(e.target.value)} 
                  placeholder={depositType === "savings" ? "Goal name (e.g., house, car)" : "Narration (optional)"} 
                />
                <button type="submit">
                  {depositType === "main" ? "Deposit to Balance" : "Save to Goal"}
                </button>
              </form>
            </div>

            <div className="form-section">
              <h3>Withdraw</h3>
              <form onSubmit={handleWithdraw}>
                <input 
                  type="number" 
                  step="0.01"
                  value={withdrawAmount} 
                  onChange={e=>setWithdrawAmount(e.target.value)} 
                  placeholder="Amount" 
                  required
                />
                <input 
                  value={withdrawNarration} 
                  onChange={e=>setWithdrawNarration(e.target.value)} 
                  placeholder="Narration (optional)" 
                />
                <button type="submit">Withdraw</button>
              </form>
            </div>

            <div className="form-section">
              <h3>Transfer</h3>
              <form onSubmit={handleTransfer}>
                <input 
                  value={transferTo} 
                  onChange={e=>setTransferTo(e.target.value)} 
                  placeholder="To Account Number" 
                  required
                />
                <input 
                  type="number" 
                  step="0.01"
                  value={transferAmount} 
                  onChange={e=>setTransferAmount(e.target.value)} 
                  placeholder="Amount" 
                  required
                />
                <input 
                  value={transferNarration} 
                  onChange={e=>setTransferNarration(e.target.value)} 
                  placeholder="Narration (optional)" 
                />
                <button type="submit">Transfer</button>
              </form>
            </div>
          </div>

          <div className="transactions-section">
            <div className="transactions-header">
              <h3>Recent Transactions</h3>
              {transactions.length > 0 && (
                <button 
                  className="delete-transactions-btn" 
                  onClick={handleDeleteTransactionsClick}
                  disabled={selectedTransactions.length === 0}
                >
                  🗑️ Delete Selected ({selectedTransactions.length})
                </button>
              )}
            </div>
            {transactions.length === 0 ? (
              <p>No transactions yet.</p>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAllTransactions}
                        checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                      />
                    </th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Narration</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => {
                    // Determine if money is coming in or going out
                    let isMoneyIn = false;
                    let displayType = tx.type;
                    
                    if (tx.type === 'deposit') {
                      isMoneyIn = true;
                    } else if (tx.type === 'withdraw') {
                      isMoneyIn = false;
                    } else if (tx.type === 'transfer') {
                      // Check if this is money received (balance increased) or sent (balance decreased)
                      // If relatedAccountId exists, it means this is a transfer
                      // We need to check if the balance went up or down
                      const prevTransaction = transactions[transactions.indexOf(tx) + 1];
                      if (prevTransaction) {
                        isMoneyIn = parseFloat(tx.balanceAfter) > parseFloat(prevTransaction.balanceAfter);
                      } else {
                        // First transaction or can't determine, check if balance increased
                        isMoneyIn = tx.relatedAccountId && parseFloat(tx.balanceAfter) >= parseFloat(tx.amount);
                      }
                      displayType = isMoneyIn ? 'transfer-in' : 'transfer-out';
                    }
                    
                    return (
                      <tr key={tx.id} className={selectedTransactions.includes(tx.id) ? 'selected-row' : ''}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedTransactions.includes(tx.id)}
                            onChange={() => handleTransactionSelect(tx.id)}
                          />
                        </td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                        <td className={`type-${tx.type}`}>
                          {tx.type === 'transfer' ? (isMoneyIn ? 'Transfer In' : 'Transfer Out') : tx.type}
                        </td>
                        <td className={isMoneyIn ? 'positive' : 'negative'}>
                          {isMoneyIn ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                        </td>
                        <td>₹{parseFloat(tx.balanceAfter).toFixed(2)}</td>
                        <td>{tx.narration || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onConfirm={confirmDeposit}
        title="Confirm Deposit"
        message="Please review the deposit details below:"
        details={selectedAccount && depositAmount ? [
          { label: "Account", value: selectedAccount.accountNumber },
          { label: "Amount", value: `₹${parseFloat(depositAmount).toFixed(2)}` },
          { label: "Current Balance", value: `₹${parseFloat(selectedAccount.balance).toFixed(2)}` },
          { label: "New Balance", value: `₹${(parseFloat(selectedAccount.balance) + parseFloat(depositAmount)).toFixed(2)}` }
        ] : []}
      />

      <ConfirmModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={confirmWithdraw}
        title="Confirm Withdrawal"
        message="Please review the withdrawal details below:"
        details={selectedAccount && withdrawAmount ? [
          { label: "Account", value: selectedAccount.accountNumber },
          { label: "Amount", value: `₹${parseFloat(withdrawAmount).toFixed(2)}` },
          { label: "Current Balance", value: `₹${parseFloat(selectedAccount.balance).toFixed(2)}` },
          { label: "New Balance", value: `₹${(parseFloat(selectedAccount.balance) - parseFloat(withdrawAmount)).toFixed(2)}` }
        ] : []}
      />

      <ConfirmModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onConfirm={confirmTransfer}
        title="Confirm Transfer"
        message="Are you sure you want to transfer this amount?"
        details={selectedAccount && transferAmount && transferTo ? [
          { label: "From Account", value: selectedAccount.accountNumber },
          { label: "To Account", value: transferTo },
          { label: "Amount", value: `₹${parseFloat(transferAmount).toFixed(2)}` },
          { label: "Current Balance", value: `₹${parseFloat(selectedAccount.balance).toFixed(2)}` }
        ] : []}
      />

      {/* Delete Transactions Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteTransactionsModal}
        onClose={() => setShowDeleteTransactionsModal(false)}
        onConfirm={handleConfirmDeleteTransactions}
        title="Delete Transactions?"
        message={`Are you sure you want to delete ${selectedTransactions.length} transaction(s)? This action cannot be undone.`}
        details={[
          { label: "Transactions Selected", value: selectedTransactions.length },
          { label: "Warning", value: "Account balance will be recalculated" }
        ]}
      />

      {/* Toast Notifications */}
      <SuccessToast
        isOpen={showSuccessToast}
        message={toastMessage}
        onClose={() => setShowSuccessToast(false)}
      />

      <ErrorToast
        isOpen={showErrorToast}
        message={toastMessage}
        onClose={() => setShowErrorToast(false)}
      />
    </div>
  );
}
