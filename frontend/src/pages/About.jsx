import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/about.css";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="about-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>ℹ️ About FinFlow</h1>
        <p>Your Digital Banking Partner</p>
      </div>

      <div className="about-container">
        {/* About Section */}
        <div className="about-card">
          <h2>💙 About FinFlow</h2>
          <p>
            FinFlow is a modern digital banking platform designed to make financial management 
            simple, secure, and accessible. We provide a comprehensive suite of banking services 
            including account management, investments, and financial planning tools.
          </p>
          <p>
            Our mission is to empower users with the tools they need to take control of their 
            finances and achieve their financial goals. With FinFlow, banking is no longer 
            complicated – it's intuitive, fast, and user-friendly.
          </p>
        </div>

        {/* Features Section */}
        <div className="about-card">
          <h2>✨ Key Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🏦</span>
              <h3>Account Management</h3>
              <p>Manage multiple accounts with ease</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💸</span>
              <h3>Quick Transactions</h3>
              <p>Deposit, withdraw, and transfer instantly</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h3>SIP Investments</h3>
              <p>Plan and track your investments</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <h3>Account Statements</h3>
              <p>Download detailed transaction reports</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <h3>Notifications</h3>
              <p>Stay updated with real-time alerts</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <h3>Secure & Safe</h3>
              <p>Bank-grade security for your data</p>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="about-card">
          <h2>📱 Version Information</h2>
          <div className="version-info">
            <div className="version-item">
              <span className="version-label">Version:</span>
              <span className="version-value">1.0.0</span>
            </div>
            <div className="version-item">
              <span className="version-label">Release Date:</span>
              <span className="version-value">October 2025</span>
            </div>
            <div className="version-item">
              <span className="version-label">Platform:</span>
              <span className="version-value">Web Application</span>
            </div>
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="about-card">
          <h2>📄 Legal</h2>
          <div className="legal-section">
            <h3>Terms & Conditions</h3>
            <p>
              By using FinFlow, you agree to our terms of service. All transactions are 
              processed securely and your data is protected according to industry standards.
            </p>
            
            <h3>Privacy Policy</h3>
            <p>
              We respect your privacy and are committed to protecting your personal information. 
              Your data is encrypted and never shared with third parties without your consent.
            </p>
            
            <h3>Security</h3>
            <p>
              FinFlow uses bank-grade encryption and security measures to protect your account 
              and transactions. We recommend using strong passwords and changing them regularly.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="about-card">
          <h2>📞 Contact Information</h2>
          <div className="contact-info">
            <p><strong>Email:</strong> osprojec11@gmail.com</p>
            <p><strong>Phone:</strong> xxx-xxx-xxxx</p>
            <p><strong>Address:</strong> xxx, xxx, xxx</p>
          </div>
        </div>

        {/* Footer */}
        <div className="about-footer">
          <p>© 2025 FinFlow. All rights reserved.</p>
          <p>Built with ❤️ for modern banking</p>
        </div>
      </div>
    </div>
  );
}
