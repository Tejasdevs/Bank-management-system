import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/apiClient";
import { SuccessToast, ErrorToast } from "../components/Modal";
import "../styles/budget.css";

export default function BudgetPlanner() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const categories = [
    { name: "Food & Dining", icon: "🍔", color: "#ef4444" },
    { name: "Transportation", icon: "🚗", color: "#f59e0b" },
    { name: "Shopping", icon: "🛍️", color: "#8b5cf6" },
    { name: "Entertainment", icon: "🎬", color: "#ec4899" },
    { name: "Bills & Utilities", icon: "💡", color: "#3b82f6" },
    { name: "Healthcare", icon: "🏥", color: "#10b981" },
    { name: "Education", icon: "📚", color: "#6366f1" },
    { name: "Others", icon: "📦", color: "#64748b" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load budgets from localStorage
      const userData = localStorage.getItem('bms_user');
      const user = userData ? JSON.parse(userData) : null;
      const storageKey = user ? `budgets_${user.id}` : 'budgets';
      const savedBudgets = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setBudgets(savedBudgets);

      // Load accounts and transactions
      const accountsRes = await client.get("/accounts/user");
      const accountsData = accountsRes.data;
      setAccounts(accountsData);
      
      if (accountsData.length > 0) {
        const txnRes = await client.get(`/accounts/${accountsData[0].id}/transactions`);
        setTransactions(txnRes.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const calculateSpending = (categoryName) => {
    // Find the budget for this category
    const budget = budgets.find(b => b.category === categoryName);
    
    // Get manual expenses
    const manualSpent = budget?.spent || 0;
    
    // Get current month transactions with matching narration
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const categoryTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.createdAt);
      const isCurrentMonth = txnDate.getMonth() === currentMonth && 
                            txnDate.getFullYear() === currentYear;
      const isWithdraw = txn.type === 'withdraw';
      
      // Check if narration contains category name (case insensitive)
      const narration = (txn.narration || '').toLowerCase();
      const categoryLower = categoryName.toLowerCase();
      
      // Match full category name or keywords
      const categoryKeywords = {
        'Food & Dining': ['food', 'dining', 'restaurant', 'meal', 'lunch', 'dinner', 'breakfast'],
        'Transportation': ['transport', 'uber', 'taxi', 'petrol', 'fuel', 'bus', 'train', 'metro'],
        'Shopping': ['shopping', 'shop', 'clothes', 'amazon', 'flipkart', 'purchase'],
        'Entertainment': ['entertainment', 'movie', 'cinema', 'game', 'netflix', 'spotify'],
        'Bills & Utilities': ['bill', 'utility', 'electricity', 'water', 'gas', 'internet', 'phone'],
        'Healthcare': ['health', 'medical', 'doctor', 'medicine', 'hospital', 'pharmacy'],
        'Education': ['education', 'course', 'book', 'study', 'tuition', 'school', 'college'],
        'Others': ['other', 'misc', 'miscellaneous']
      };
      
      const keywords = categoryKeywords[categoryName] || [categoryLower];
      const matchesCategory = keywords.some(keyword => narration.includes(keyword));
      
      return isCurrentMonth && isWithdraw && matchesCategory;
    });
    
    const autoSpent = categoryTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
    
    // Return total of manual + automatic spending
    return manualSpent + autoSpent;
  };

  const handleAddExpense = async (budgetId, amount) => {
    const expenseAmount = parseFloat(amount);
    
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
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
    
    if (expenseAmount > totalBalance) {
      setToastMessage(`Insufficient bank balance! Available: ₹${totalBalance.toLocaleString('en-IN')}`);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    try {
      // Get the budget category name for narration
      const budget = budgets.find(b => b.id === budgetId);
      const categoryName = budget ? budget.category : 'Budget Expense';

      // Deduct money from bank account
      await client.post("/transactions/withdraw", { 
        accountId: accounts[0].id, 
        amount: expenseAmount,
        narration: `${categoryName} - Manual Expense`
      });

      // Update budget spending
      const updatedBudgets = budgets.map(b => {
        if (b.id === budgetId) {
          const currentSpent = b.spent || 0;
          return { ...b, spent: currentSpent + expenseAmount };
        }
        return b;
      });

      setBudgets(updatedBudgets);

      // Save to localStorage
      const userData = localStorage.getItem('bms_user');
      const user = userData ? JSON.parse(userData) : null;
      const storageKey = user ? `budgets_${user.id}` : 'budgets';
      localStorage.setItem(storageKey, JSON.stringify(updatedBudgets));

      // Reload accounts to show updated balance
      await loadData();

      setToastMessage(`₹${expenseAmount} deducted from bank and added to ${categoryName}!`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      setToastMessage(error.response?.data?.message || "Failed to add expense");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const handleAddBudget = () => {
    if (!category || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      setToastMessage("Please select a category and enter a valid amount");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.category === category);
    if (existingBudget) {
      setToastMessage("Budget already exists for this category. Delete it first to create a new one.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const newBudget = {
      id: Date.now(),
      category,
      amount: parseFloat(budgetAmount),
      spent: 0,
      createdAt: new Date().toISOString()
    };

    const updatedBudgets = [...budgets, newBudget];
    setBudgets(updatedBudgets);

    // Save to localStorage
    const userData = localStorage.getItem('bms_user');
    const user = userData ? JSON.parse(userData) : null;
    const storageKey = user ? `budgets_${user.id}` : 'budgets';
    localStorage.setItem(storageKey, JSON.stringify(updatedBudgets));

    setCategory("");
    setBudgetAmount("");
    setShowForm(false);
    setToastMessage("Budget added successfully!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleDeleteBudget = (id) => {
    const updatedBudgets = budgets.filter(b => b.id !== id);
    setBudgets(updatedBudgets);

    // Save to localStorage
    const userData = localStorage.getItem('bms_user');
    const user = userData ? JSON.parse(userData) : null;
    const storageKey = user ? `budgets_${user.id}` : 'budgets';
    localStorage.setItem(storageKey, JSON.stringify(updatedBudgets));

    setToastMessage("Budget deleted successfully!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const getCategoryInfo = (categoryName) => {
    return categories.find(c => c.name === categoryName) || categories[categories.length - 1];
  };

  if (loading) {
    return (
      <div className="budget-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-page">
      <div className="budget-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>💰 Budget Planner</h1>
        <p>Track your monthly spending by category</p>
      </div>

      <div className="budget-container">
        {/* Info Card */}
        <div className="budget-info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h4>How Budget Tracking Works:</h4>
            <p>
              <strong>Automatic:</strong> When you withdraw money from Dashboard, add keywords in the narration 
              (e.g., "food", "uber", "shopping") and it will automatically track to the matching budget category!
            </p>
            <p>
              <strong>Manual:</strong> You can also manually add expenses using the "+ Add Expense" button on each budget card.
            </p>
          </div>
        </div>

        {/* Add Budget Button */}
        <div className="budget-actions">
          <button className="add-budget-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Budget'}
          </button>
        </div>

        {/* Add Budget Form */}
        {showForm && (
          <div className="budget-form-card">
            <h3>Create New Budget</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Budget (₹)</label>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="form-input"
                />
              </div>
              <button className="submit-budget-btn" onClick={handleAddBudget}>
                Add Budget
              </button>
            </div>
          </div>
        )}

        {/* Budget Cards */}
        {budgets.length === 0 ? (
          <div className="no-budgets">
            <span className="no-budget-icon">💰</span>
            <h3>No Budgets Yet</h3>
            <p>Create your first budget to start tracking your spending</p>
          </div>
        ) : (
          <div className="budget-grid">
            {budgets.map(budget => {
              const categoryInfo = getCategoryInfo(budget.category);
              const spent = calculateSpending(budget.category);
              const remaining = budget.amount - spent;
              const percentage = (spent / budget.amount) * 100;
              const isOverBudget = spent > budget.amount;

              return (
                <div key={budget.id} className="budget-card">
                  <div className="budget-card-header">
                    <div className="budget-category">
                      <span className="category-icon" style={{ color: categoryInfo.color }}>
                        {categoryInfo.icon}
                      </span>
                      <h3>{budget.category}</h3>
                    </div>
                    <button 
                      className="delete-budget-btn"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="budget-amounts">
                    <div className="amount-item">
                      <span className="amount-label">Budget</span>
                      <span className="amount-value">₹{budget.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Spent</span>
                      <span className={`amount-value ${isOverBudget ? 'over-budget' : ''}`}>
                        ₹{spent.toFixed(2)}
                      </span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Remaining</span>
                      <span className={`amount-value ${isOverBudget ? 'over-budget' : 'remaining'}`}>
                        ₹{remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="budget-progress">
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: categoryInfo.color
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {percentage.toFixed(1)}% {isOverBudget ? 'Over Budget!' : 'Used'}
                    </span>
                  </div>

                  {isOverBudget && (
                    <div className="budget-alert">
                      ⚠️ You've exceeded your budget by ₹{Math.abs(remaining).toFixed(2)}
                    </div>
                  )}

                  {/* Add Expense Input */}
                  <div className="add-expense-section">
                    <input
                      type="number"
                      placeholder="Enter expense amount"
                      className="expense-input"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddExpense(budget.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button 
                      className="add-expense-btn"
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        handleAddExpense(budget.id, input.value);
                        input.value = '';
                      }}
                    >
                      + Add Expense
                    </button>
                  </div>
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
