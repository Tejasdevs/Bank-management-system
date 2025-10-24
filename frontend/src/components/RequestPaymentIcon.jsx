import React, { useState, useEffect } from "react";
import client from "../api/apiClient";
import "../styles/requestPayment.css";

export default function RequestPaymentIcon() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    try {
      const res = await client.get("/payment-requests/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users");
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    loadUsers();
    setError("");
    setSuccess("");
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      setError("Please select a user and enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await client.post("/payment-requests", {
        toUserId: parseInt(selectedUser),
        amount: parseFloat(amount),
        reason: reason || null
      });

      setSuccess("Request sent successfully!");
      setTimeout(() => {
        setShowModal(false);
        setSelectedUser("");
        setAmount("");
        setReason("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="icon-btn request-payment-icon" onClick={handleOpenModal} title="Request Payment">
        💸
      </button>

      {showModal && (
        <div className="request-payment-overlay" onClick={() => setShowModal(false)}>
          <div className="request-payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💸 Request Payment</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSendRequest} className="modal-body">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-group">
                <label>Request From</label>
                <select 
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select Contact</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      👤 {user.name} ({user.Accounts?.[0]?.accountNumber || 'No account'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="form-input"
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
                  className="form-input"
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="modal-btn modal-btn-cancel" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="modal-btn modal-btn-confirm" 
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
