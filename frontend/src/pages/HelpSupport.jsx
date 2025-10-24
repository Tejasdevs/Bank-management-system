import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/help.css";

export default function HelpSupport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("faq");
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I create a new account?",
      answer: "You can register for a new account by clicking the 'Get Started' button on the home page. Fill in your details including name, email, and password. A default savings account will be created automatically for you."
    },
    {
      id: 2,
      question: "How do I transfer money between accounts?",
      answer: "Go to your Dashboard, select the account you want to transfer from, enter the recipient's account number, amount, and an optional narration. Click 'Transfer' to complete the transaction."
    },
    {
      id: 3,
      question: "What is SIP Calculator?",
      answer: "SIP (Systematic Investment Plan) Calculator helps you calculate returns on your monthly investments. You can set up automated investments that will mature after a specified period with calculated returns."
    },
    {
      id: 4,
      question: "How do I download my account statement?",
      answer: "Navigate to 'Account Statements' from the hamburger menu. Select your account, choose a date range, and click 'Download Statement' to get a CSV file of your transactions."
    },
    {
      id: 5,
      question: "How do I change my password?",
      answer: "Click on the settings icon (⚙️) next to the logout button, then select 'Change Password'. Enter your current password and your new password to update it."
    },
    {
      id: 6,
      question: "What happens when my SIP investment matures?",
      answer: "When your SIP investment reaches its maturity date, the principal amount plus returns will be automatically credited to your account. You'll see the transaction in your account history."
    },
    {
      id: 7,
      question: "Can I delete transactions?",
      answer: "Yes, you can select multiple transactions using checkboxes and delete them. A confirmation dialog will appear before deletion to prevent accidental removal."
    },
    {
      id: 8,
      question: "How do I reset all my data?",
      answer: "From the hamburger menu, scroll to the bottom and click 'Reset All Data'. This will delete all your transactions and investments but keep your accounts. Use this feature carefully as it cannot be undone."
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>❓ Help & Support</h1>
        <p>Find answers to common questions and get help</p>
      </div>

      <div className="help-container">
        {/* Tabs */}
        <div className="help-tabs">
          <button 
            className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            📚 FAQs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            📧 Contact Us
          </button>
          <button 
            className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            📖 User Guide
          </button>
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="help-content">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map(faq => (
                <div key={faq.id} className="faq-item">
                  <button 
                    className={`faq-question ${openFaq === faq.id ? 'active' : ''}`}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon">{openFaq === faq.id ? '−' : '+'}</span>
                  </button>
                  {openFaq === faq.id && (
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="help-content">
            <h2>Contact Us</h2>
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>Email Support</h3>
                <p>osprojec11@gmail.com</p>
                <p className="contact-desc">We'll respond within 24 hours</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h3>Phone Support</h3>
                <p>xxx-xxx-xxxx</p>
                <p className="contact-desc">Mon-Fri, 9 AM - 6 PM</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">💬</div>
                <h3>Live Chat</h3>
                <p>Available 24/7</p>
                <button className="chat-btn">Start Chat</button>
              </div>
            </div>
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="help-content">
            <h2>User Guide</h2>
            <div className="guide-sections">
              <div className="guide-section">
                <h3>🏦 Getting Started</h3>
                <ul>
                  <li>Create your account with email and password</li>
                  <li>A default savings account is created automatically</li>
                  <li>Start with depositing money to your account</li>
                  <li>Explore features from the dashboard</li>
                </ul>
              </div>
              <div className="guide-section">
                <h3>💰 Managing Transactions</h3>
                <ul>
                  <li><strong>Deposit:</strong> Add money to your account</li>
                  <li><strong>Withdraw:</strong> Take money out of your account</li>
                  <li><strong>Transfer:</strong> Send money to another account</li>
                  <li>View all transactions in the history section</li>
                </ul>
              </div>
              <div className="guide-section">
                <h3>📊 Investments</h3>
                <ul>
                  <li>Use SIP Calculator to plan investments</li>
                  <li>Set monthly amount, duration, and expected returns</li>
                  <li>Track active investments in 'My Investments'</li>
                  <li>Receive maturity amount automatically</li>
                </ul>
              </div>
              <div className="guide-section">
                <h3>⚙️ Settings & Security</h3>
                <ul>
                  <li>Update profile information anytime</li>
                  <li>Change password regularly for security</li>
                  <li>Download account statements for records</li>
                  <li>Use Reset Data carefully - it's permanent</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
