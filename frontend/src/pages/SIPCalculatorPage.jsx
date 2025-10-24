import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from 'chart.js/auto';
import InvestmentConfirmationModal from "../components/InvestmentConfirmationModal";
import { SuccessToast } from "../components/Modal";
import client from "../api/apiClient";

export default function SIPCalculatorPage() {
  const navigate = useNavigate();
  const [monthlyInvestment, setMonthlyInvestment] = useState(10600);
  const [returnRate, setReturnRate] = useState(23.4);
  const [timePeriod, setTimePeriod] = useState(40);
  const [activeTab, setActiveTab] = useState('SIP');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await client.get("/accounts/user");
      setAccounts(res.data);
      if (res.data.length > 0) {
        setSelectedAccount(res.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  }

  // Calculate values
  const calculateSIP = () => {
    if (activeTab === 'SIP') {
      const P = monthlyInvestment;
      const r = returnRate / 100 / 12; // Monthly rate
      const n = timePeriod * 12; // Total months

      // Future Value = P × ((1 + r)^n - 1) / r × (1 + r)
      const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
      const investedAmount = P * n;
      const estimatedReturns = futureValue - investedAmount;

      return {
        investedAmount: Math.round(investedAmount),
        estimatedReturns: Math.round(estimatedReturns),
        totalValue: Math.round(futureValue)
      };
    } else {
      // Lumpsum calculation
      const P = monthlyInvestment; // Using same input for lumpsum amount
      const r = returnRate / 100; // Annual rate
      const n = timePeriod; // Years

      // Future Value = P × (1 + r)^n
      const futureValue = P * Math.pow(1 + r, n);
      const investedAmount = P;
      const estimatedReturns = futureValue - investedAmount;

      return {
        investedAmount: Math.round(investedAmount),
        estimatedReturns: Math.round(estimatedReturns),
        totalValue: Math.round(futureValue)
      };
    }
  };

  const results = calculateSIP();

  // Handle invest now button
  const handleInvestNow = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmInvestment = () => {
    if (!selectedAccount) {
      alert("Please select an account for investment");
      return;
    }

    // Save investment to localStorage
    const investment = {
      id: Date.now(),
      type: activeTab,
      amount: monthlyInvestment,
      returnRate: returnRate,
      timePeriod: timePeriod,
      totalValue: results.totalValue,
      investedAmount: results.investedAmount,
      estimatedReturns: results.estimatedReturns,
      startDate: new Date().toISOString(),
      status: 'active',
      accountId: selectedAccount,
      monthsPaid: 0,
      totalMonths: activeTab === 'SIP' ? timePeriod * 12 : 1,
      nextDeductionDate: new Date().toISOString()
    };

    // Get existing investments (user-specific)
    const userData = localStorage.getItem('bms_user');
    const user = userData ? JSON.parse(userData) : null;
    const storageKey = user ? `investments_${user.id}` : 'investments';
    
    const existingInvestments = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingInvestments.push(investment);
    localStorage.setItem(storageKey, JSON.stringify(existingInvestments));

    // Close modal and show success
    setShowConfirmModal(false);
    setShowSuccessToast(true);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  // Create/Update chart
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }

    console.log('Chart data:', results);

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
      const ctx = canvas.getContext('2d');
      
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Invested amount', 'Est. returns'],
          datasets: [{
            data: [results.investedAmount, results.estimatedReturns],
            backgroundColor: ['#E8EAFF', '#5B68EB'],
            borderWidth: 0,
            hoverOffset: 4
          }],
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              callbacks: {
                label: function(context) {
                  return context.label + ': ₹' + context.parsed.toLocaleString('en-IN');
                }
              }
            }
          },
        },
      });
      
      console.log('Chart created:', chartInstance.current);
    } catch (error) {
      console.error('Chart creation error:', error);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [results.investedAmount, results.estimatedReturns, activeTab]);

  return (
    <div className="sip-calculator-page">
      <div className="sip-page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>SIP Calculator</h1>
      </div>

      <div className="sip-page-content">
        <div className="sip-card">
          <div className="sip-tabs">
            <button 
              className={`tab-btn ${activeTab === 'SIP' ? 'active' : ''}`}
              onClick={() => setActiveTab('SIP')}
            >
              SIP
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Lumpsum' ? 'active' : ''}`}
              onClick={() => setActiveTab('Lumpsum')}
            >
              Lumpsum
            </button>
          </div>

          {accounts.length > 0 && (
            <div className="account-selector-sip">
              <label>Select Account for Investment:</label>
              <select 
                value={selectedAccount || ''} 
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="account-select"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} ({acc.accountType}) - Balance: ₹{parseFloat(acc.balance).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="sip-content">
            <div className="sip-inputs">
              <div className="input-group">
                <label>{activeTab === 'SIP' ? 'Monthly investment' : 'Total investment'}</label>
                <div className="input-with-currency">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                    className="sip-input"
                  />
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="100"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="input-group">
                <label>Expected return rate (p.a)</label>
                <div className="input-with-currency">
                  <input
                    type="number"
                    value={returnRate}
                    onChange={(e) => setReturnRate(Number(e.target.value))}
                    className="sip-input"
                    step="0.1"
                  />
                  <span className="currency-symbol">%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.1"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="input-group">
                <label>Time period</label>
                <div className="input-with-currency">
                  <input
                    type="number"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    className="sip-input"
                  />
                  <span className="currency-symbol">Yr</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            <div className="sip-results">
              <div className="chart-container">
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot invested"></span>
                    <span>Invested amount</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot returns"></span>
                    <span>Est. returns</span>
                  </div>
                </div>
                <div className="chart-wrapper">
                  <canvas ref={chartRef} width="280" height="280"></canvas>
                </div>
              </div>

              <div className="results-summary">
                <div className="result-row">
                  <span className="result-label">Invested amount</span>
                  <span className="result-value">₹{results.investedAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Est. returns</span>
                  <span className="result-value">₹{results.estimatedReturns.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row total">
                  <span className="result-label">Total value</span>
                  <span className="result-value">₹{results.totalValue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button className="invest-now-btn" onClick={handleInvestNow}>
                INVEST NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      <InvestmentConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmInvestment}
        investmentData={{
          type: activeTab,
          amount: monthlyInvestment,
          returnRate: returnRate,
          timePeriod: timePeriod,
          totalValue: results.totalValue
        }}
      />

      {showSuccessToast && (
        <SuccessToast
          message={`Investment plan activated! ₹${monthlyInvestment.toLocaleString('en-IN')} will be ${activeTab === 'SIP' ? 'deducted monthly' : 'invested as lumpsum'}`}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
}
