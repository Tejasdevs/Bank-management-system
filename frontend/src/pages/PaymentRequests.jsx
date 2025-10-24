import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/apiClient";
import HamburgerMenu from "../components/HamburgerMenu";
import DarkModeToggle from "../components/DarkModeToggle";
import "../styles/paymentRequestsPage.css";

export default function PaymentRequests() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("send"); // send, incoming, sent
  
  // Send request form
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Password confirmation modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("bms_token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, incomingRes, sentRes] = await Promise.all([
        client.get("/payment-requests/users"),
        client.get("/payment-requests/incoming"),
        client.get("/payment-requests/sent")
      ]);
      setUsers(usersRes.data);
      setIncomingRequests(incomingRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!accountNumber || accountNumber.trim() === "") {
      setError("Please enter account number");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await client.post("/payment-requests", {
        toAccountNumber: accountNumber.trim(),
        amount: parseFloat(amount),
        reason: reason || null
      });

      setSuccess("Request sent successfully!");
      setAccountNumber("");
      setAmount("");
      setReason("");
      
      // Reload data
      setTimeout(() => {
        loadData();
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error sending request:", err);
      setError(err.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (requestId) => {
    setSelectedRequestId(requestId);
    setShowPasswordModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!password) {
      setError("Please enter your password");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      // Verify password and approve payment
      await client.post(`/payment-requests/${selectedRequestId}/approve`, {
        password: password
      });

      setSuccess("Payment approved successfully!");
      setShowPasswordModal(false);
      setPassword("");
      setSelectedRequestId(null);
      
      setTimeout(() => {
        loadData();
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve payment");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await client.post(`/payment-requests/${requestId}/reject`);
      setSuccess("Request rejected");
      setTimeout(() => {
        loadData();
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "Pending", class: "status-pending" },
      approved: { text: "Approved", class: "status-approved" },
      rejected: { text: "Rejected", class: "status-rejected" }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="payment-requests-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>💸 Payment Requests</h1>
        </div>
        <div className="header-actions">
          <DarkModeToggle />
          <HamburgerMenu />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === "send" ? "active" : ""}`}
          onClick={() => setActiveTab("send")}
        >
          📤 Send Request
        </button>
        <button 
          className={`tab-btn ${activeTab === "incoming" ? "active" : ""}`}
          onClick={() => setActiveTab("incoming")}
        >
          📥 Incoming ({incomingRequests.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          📨 Sent ({sentRequests.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "send" && (
          <div className="send-request-section">
            <h2>Send Payment Request</h2>
            <form onSubmit={handleSendRequest} className="request-form">
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number (e.g., BMS977037390)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason (Optional)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Dinner split, Movie tickets"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "incoming" && (
          <div className="requests-list">
            <h2>Incoming Requests</h2>
            {incomingRequests.length === 0 ? (
              <div className="no-requests">
                <span className="icon">📭</span>
                <p>No incoming requests</p>
              </div>
            ) : (
              incomingRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="user-info">
                      <span className="user-icon">👤</span>
                      <div>
                        <div className="user-name">{request.requester.name}</div>
                        <div className="user-email">{request.requester.email}</div>
                      </div>
                    </div>
                    <div className="request-amount">₹{parseFloat(request.amount).toLocaleString('en-IN')}</div>
                  </div>
                  {request.reason && (
                    <div className="request-reason">
                      <span className="icon">💬</span> {request.reason}
                    </div>
                  )}
                  <div className="request-footer">
                    <span className="time">{getTimeAgo(request.createdAt)}</span>
                    <div className="actions">
                      <button 
                        className="btn btn-approve"
                        onClick={() => handleApprove(request.id)}
                      >
                        ✅ Pay
                      </button>
                      <button 
                        className="btn btn-reject"
                        onClick={() => handleReject(request.id)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div className="requests-list">
            <h2>Sent Requests</h2>
            {sentRequests.length === 0 ? (
              <div className="no-requests">
                <span className="icon">📭</span>
                <p>No sent requests</p>
              </div>
            ) : (
              sentRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="user-info">
                      <span className="user-icon">👤</span>
                      <div>
                        <div className="user-name">{request.payer.name}</div>
                        <div className="user-email">{request.payer.email}</div>
                      </div>
                    </div>
                    <div className="request-amount">₹{parseFloat(request.amount).toLocaleString('en-IN')}</div>
                  </div>
                  {request.reason && (
                    <div className="request-reason">
                      <span className="icon">💬</span> {request.reason}
                    </div>
                  )}
                  <div className="request-footer">
                    <span className="time">{getTimeAgo(request.createdAt)}</span>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔒 Confirm Payment</h3>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="password-message">Please enter your password to confirm this payment</p>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="password-input"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleConfirmPayment()}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-confirm" 
                onClick={handleConfirmPayment}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
