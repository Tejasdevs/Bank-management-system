import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/apiClient";
import { SuccessToast, ErrorToast } from "../components/Modal";
import "../styles/savings.css";

export default function SavingsGoals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  
  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const goalCategories = [
    { name: "Vacation", icon: "✈️", color: "#3b82f6" },
    { name: "Car", icon: "🚗", color: "#ef4444" },
    { name: "House", icon: "🏠", color: "#10b981" },
    { name: "Education", icon: "🎓", color: "#8b5cf6" },
    { name: "Wedding", icon: "💍", color: "#ec4899" },
    { name: "Emergency Fund", icon: "🛡️", color: "#f59e0b" },
    { name: "Gadget", icon: "📱", color: "#6366f1" },
    { name: "Other", icon: "🎯", color: "#64748b" }
  ];

  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, []);

  const loadGoals = () => {
    const userData = localStorage.getItem('bms_user');
    const user = userData ? JSON.parse(userData) : null;
    const storageKey = user ? `savings_goals_${user.id}` : 'savings_goals';
    const savedGoals = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setGoals(savedGoals);
  };

  const loadTransactions = async () => {
    try {
      const accountsRes = await client.get("/accounts/user");
      const accountsData = accountsRes.data;
      setAccounts(accountsData);
      
      if (accountsData.length > 0) {
        const txnRes = await client.get(`/accounts/${accountsData[0].id}/transactions`);
        setTransactions(txnRes.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const calculateAutoSavings = (goalName, category) => {
    // Get transactions with matching narration
    // Only count transactions from Dashboard "Savings Goal" deposit option
    const goalTransactions = transactions.filter(txn => {
      const narration = (txn.narration || '').toLowerCase();
      const goalNameLower = goalName.toLowerCase();
      
      // STRICT FILTER: Only match transactions from Dashboard deposit to savings goal
      // Must be withdraw type AND contain EXACTLY "savings goal deposit" phrase
      // This ensures we ONLY count new transactions, not old ones
      const isGoalTransaction = txn.type === 'withdraw' && 
        narration.includes('savings goal deposit') &&
        narration.includes(goalNameLower);
      
      return isGoalTransaction;
    });
    
    return goalTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
  };

  const handleAddGoal = () => {
    if (!goalName || !targetAmount || currentAmount === '' || !deadline || !category) {
      setToastMessage("Please fill all fields");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount);

    if (target <= 0 || current < 0 || isNaN(target) || isNaN(current)) {
      setToastMessage("Please enter valid amounts");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    if (parseFloat(currentAmount) > parseFloat(targetAmount)) {
      setToastMessage("Current amount cannot exceed target amount");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const newGoal = {
      id: Date.now(),
      name: goalName,
      target: parseFloat(targetAmount),
      manualSavings: parseFloat(currentAmount) || 0, // Only store manual savings
      deadline,
      category,
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);

    // Save to localStorage
    const userData = localStorage.getItem('bms_user');
    const user = userData ? JSON.parse(userData) : null;
    const storageKey = user ? `savings_goals_${user.id}` : 'savings_goals';
    localStorage.setItem(storageKey, JSON.stringify(updatedGoals));

    // Reset form
    setGoalName("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    setCategory("");
    setShowForm(false);

    setToastMessage("Goal created successfully!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleUpdateProgress = async (id, amount) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const addAmount = parseFloat(amount);
    if (isNaN(addAmount) || addAmount <= 0) {
      setToastMessage("Please enter a valid amount");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    // Check if user has sufficient balance
    if (accounts.length === 0) {
      setToastMessage("No bank account found!");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    
    if (addAmount > totalBalance) {
      setToastMessage(`Insufficient bank balance! Available: ₹${totalBalance.toLocaleString('en-IN')}`);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    // Calculate what the new total would be
    const currentManual = goal.manualSavings || 0;
    const currentAuto = calculateAutoSavings(goal.name, goal.category);
    const currentTotal = currentManual + currentAuto;
    const newTotal = currentTotal + addAmount;
    
    if (newTotal > goal.target) {
      setToastMessage(`Cannot add ₹${addAmount}. It will exceed target by ₹${(newTotal - goal.target).toLocaleString('en-IN')}`);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    try {
      // Deduct money from bank account
      await client.post("/transactions/withdraw", { 
        accountId: accounts[0].id, 
        amount: addAmount,
        narration: `${goal.name} - Manual Savings Update`
      });

      // Update goal progress - only update manual savings
      const updatedGoals = goals.map(g => {
        if (g.id === id) {
          const newManualSavings = (g.manualSavings || 0) + addAmount;
          return { ...g, manualSavings: newManualSavings };
        }
        return g;
      });
      setGoals(updatedGoals);

      // Save to localStorage
      const userData = localStorage.getItem('bms_user');
      const user = userData ? JSON.parse(userData) : null;
      const storageKey = user ? `savings_goals_${user.id}` : 'savings_goals';
      localStorage.setItem(storageKey, JSON.stringify(updatedGoals));

      // Reload data to show updated balance
      await loadTransactions();

      setToastMessage(`₹${addAmount} deducted from bank and added to ${goal.name}!`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      setToastMessage(error.response?.data?.message || "Failed to update goal");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const handleDeleteGoal = async (id) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    // Calculate total amount to refund (manual + auto savings)
    const manualSavings = goal.manualSavings || 0;
    const autoSavings = calculateAutoSavings(goal.name, goal.category);
    const totalRefund = manualSavings + autoSavings;

    if (totalRefund > 0 && accounts.length > 0) {
      try {
        // Refund all savings back to bank account
        await client.post("/transactions/deposit", { 
          accountId: accounts[0].id, 
          amount: totalRefund,
          narration: `${goal.name} - Goal Deleted (Refund)`
        });

        setToastMessage(`Goal deleted! ₹${totalRefund.toLocaleString('en-IN')} refunded to your account.`);
      } catch (error) {
        setToastMessage("Goal deleted but refund failed. Please contact support.");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    } else {
      setToastMessage("Goal deleted successfully!");
    }

    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);

    // Save to localStorage
    const userData = localStorage.getItem('bms_user');
    const user = userData ? JSON.parse(userData) : null;
    const storageKey = user ? `savings_goals_${user.id}` : 'savings_goals';
    localStorage.setItem(storageKey, JSON.stringify(updatedGoals));

    // Reload data to show updated balance
    await loadTransactions();

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const getCategoryInfo = (categoryName) => {
    return goalCategories.find(c => c.name === categoryName) || goalCategories[goalCategories.length - 1];
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="savings-page">
      <div className="savings-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🎯 Savings Goals</h1>
        <p>Set and track your financial goals</p>
      </div>

      <div className="savings-container">
        {/* Info Card */}
        <div className="savings-info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h4>How Automatic Savings Works:</h4>
            <p>
              <strong>Automatic:</strong> When you deposit money from Dashboard, add the goal name or category in the narration 
              (e.g., "house", "car", "vacation") and it will automatically add to that savings goal!
            </p>
            <p>
              <strong>Manual:</strong> You can also manually update progress using the "Update" button on each goal card.
            </p>
            <p className="info-note">
              💰 <strong>Note:</strong> Deposits are deducted from your bank balance and tracked towards your goal automatically!
            </p>
          </div>
        </div>

        {/* Add Goal Button */}
        <div className="savings-actions">
          <button className="add-goal-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Create Goal'}
          </button>
        </div>

        {/* Add Goal Form */}
        {showForm && (
          <div className="goal-form-card">
            <h3>Create New Goal</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g., Dream Vacation"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  {goalCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Target Amount (₹)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="Enter target amount"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Current Savings (₹)</label>
                <input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="Enter current amount"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="form-input"
                />
              </div>
              <button className="submit-goal-btn" onClick={handleAddGoal}>
                Create Goal
              </button>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="no-goals">
            <span className="no-goal-icon">🎯</span>
            <h3>No Goals Yet</h3>
            <p>Create your first savings goal to get started</p>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map(goal => {
              const categoryInfo = getCategoryInfo(goal.category);
              const manualSavings = goal.manualSavings || 0;
              const autoSavings = calculateAutoSavings(goal.name, goal.category);
              const totalCurrent = manualSavings + autoSavings;
              const percentage = (totalCurrent / goal.target) * 100;
              const remaining = goal.target - totalCurrent;
              const daysLeft = getDaysRemaining(goal.deadline);
              const isCompleted = totalCurrent >= goal.target;

              return (
                <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                  <div className="goal-card-header">
                    <div className="goal-category">
                      <span className="category-icon" style={{ color: categoryInfo.color }}>
                        {categoryInfo.icon}
                      </span>
                      <div>
                        <h3>{goal.name}</h3>
                        <span className="goal-category-name">{goal.category}</span>
                      </div>
                    </div>
                    <button 
                      className="delete-goal-btn"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="goal-progress-section">
                    <div className="goal-progress-bar">
                      <div 
                        className="goal-progress-fill"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: categoryInfo.color
                        }}
                      ></div>
                    </div>
                    <span className="goal-progress-text">
                      {percentage.toFixed(1)}% Complete
                    </span>
                  </div>

                  <div className="goal-amounts">
                    <div className="goal-amount-item">
                      <span className="goal-amount-label">Current</span>
                      <span className="goal-amount-value">₹{totalCurrent.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="goal-amount-item">
                      <span className="goal-amount-label">Target</span>
                      <span className="goal-amount-value">₹{goal.target.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="goal-amount-item">
                      <span className="goal-amount-label">Remaining</span>
                      <span className="goal-amount-value remaining">₹{remaining.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Show breakdown of manual vs auto savings */}
                  {autoSavings > 0 && (
                    <div className="savings-breakdown">
                      <div className="breakdown-item">
                        <span className="breakdown-label">💰 Manual:</span>
                        <span className="breakdown-value">₹{manualSavings.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">⚡ Auto:</span>
                        <span className="breakdown-value">₹{autoSavings.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  <div className="goal-deadline">
                    <span className="deadline-icon">📅</span>
                    <span className="deadline-text">
                      {daysLeft > 0 ? `${daysLeft} days remaining` : 
                       daysLeft === 0 ? 'Due today!' : 
                       `${Math.abs(daysLeft)} days overdue`}
                    </span>
                  </div>

                  {isCompleted && (
                    <div className="goal-completed-badge">
                      🎉 Goal Achieved!
                    </div>
                  )}

                  {!isCompleted && (
                    <div className="goal-update">
                      <input
                        type="number"
                        placeholder="Update amount"
                        className="update-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateProgress(goal.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button 
                        className="update-btn"
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          handleUpdateProgress(goal.id, input.value);
                          input.value = '';
                        }}
                      >
                        Update
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
