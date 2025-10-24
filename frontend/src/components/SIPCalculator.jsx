import React, { useState, useEffect, useRef } from "react";
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

export default function SIPCalculator({ isOpen, onClose }) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10600);
  const [returnRate, setReturnRate] = useState(23.4);
  const [timePeriod, setTimePeriod] = useState(40);
  const [activeTab, setActiveTab] = useState('SIP');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Calculate values
  const calculateSIP = () => {
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
  };

  const results = calculateSIP();

  // Create/Update chart
  useEffect(() => {
    if (!isOpen || !chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
      // Create new chart
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Invested amount', 'Est. returns'],
          datasets: [{
            data: [results.investedAmount, results.estimatedReturns],
            backgroundColor: ['#E8EAFF', '#5B68EB'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '75%',
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function(context) {
                  return context.label + ': ₹' + context.parsed.toLocaleString('en-IN');
                }
              }
            }
          },
        },
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isOpen, results.investedAmount, results.estimatedReturns]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sip-calculator-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sip-header">
          <h2>SIP Calculator</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

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

        <div className="sip-content">
          <div className="sip-inputs">
            <div className="input-group">
              <label>Monthly investment</label>
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
                <canvas ref={chartRef}></canvas>
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

            <button className="invest-now-btn">INVEST NOW</button>
          </div>
        </div>
      </div>
    </div>
  );
}
