import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🔒",
      title: "Secure Banking",
      description: "Bank-grade security with JWT authentication and encrypted transactions"
    },
    {
      icon: "💸",
      title: "Instant Transfers",
      description: "Transfer money between accounts instantly with real-time updates"
    },
    {
      icon: "📊",
      title: "Transaction History",
      description: "Track all your deposits, withdrawals, and transfers in one place"
    },
    {
      icon: "💰",
      title: "Multiple Accounts",
      description: "Manage savings, current, and fixed deposit accounts seamlessly"
    },
    {
      icon: "📱",
      title: "Real-time Updates",
      description: "See your balance and transactions update instantly"
    },
    {
      icon: "🎯",
      title: "Easy to Use",
      description: "Intuitive interface designed for the best user experience"
    },
    {
      icon: "💳",
      title: "Payment Requests",
      description: "Send and receive payment requests with password confirmation for security"
    },
    {
      icon: "📈",
      title: "Investment Tools",
      description: "SIP calculator and investment tracking to grow your wealth smartly"
    },
    {
      icon: "💡",
      title: "Budget Planner",
      description: "Plan your expenses and track spending with smart budget management"
    },
    {
      icon: "🔔",
      title: "Smart Alerts",
      description: "Get instant notifications for low balance and transaction updates"
    }
  ];

  const stats = [
    { number: "100%", label: "Secure" },
    { number: "24/7", label: "Available" },
    { number: "0", label: "Hidden Fees" },
    { number: "∞", label: "Transactions" }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Modern Banking Solution
          </div>
          
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">FinFlow</span>
            <br />
            Your Digital Banking Partner
          </h1>
          
          <p className="hero-description">
            Experience the future of banking with our secure, fast, and user-friendly 
            FinFlow platform. Manage your finances with confidence and ease.
          </p>
          
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/register")}>
              Get Started
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-secondary" onClick={() => navigate("/login")}>
              Sign In
              <span className="btn-icon">🔐</span>
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-header">
              <span className="card-chip">💳</span>
              <span className="card-type">SAVINGS</span>
            </div>
            <div className="card-number">BMS •••• •••• 4321</div>
            <div className="card-balance">₹50,000.00</div>
            <div className="card-name">Account Holder</div>
          </div>
          
          <div className="floating-card card-2">
            <div className="transaction-item">
              <div className="transaction-icon deposit">↓</div>
              <div className="transaction-details">
                <div className="transaction-title">Salary Deposit</div>
                <div className="transaction-date">Today, 10:30 AM</div>
              </div>
              <div className="transaction-amount positive">+₹45,000</div>
            </div>
          </div>

          <div className="floating-card card-3">
            <div className="mini-chart">
              <div className="chart-bar" style={{height: '60%'}}></div>
              <div className="chart-bar" style={{height: '80%'}}></div>
              <div className="chart-bar" style={{height: '50%'}}></div>
              <div className="chart-bar" style={{height: '90%'}}></div>
              <div className="chart-bar" style={{height: '70%'}}></div>
            </div>
            <div className="chart-label">Spending Overview</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">
            Everything you need to manage your finances efficiently
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Banking Smarter?</h2>
          <p className="cta-description">
            Join thousands of users who trust FinFlow for their financial needs
          </p>
          <button className="cta-button" onClick={() => navigate("/register")}>
            Create Free Account
            <span className="cta-arrow">→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 FinFlow. All rights reserved.</p>
        <p className="footer-tagline">Built with ❤️ for modern banking</p>
      </footer>
    </div>
  );
}
