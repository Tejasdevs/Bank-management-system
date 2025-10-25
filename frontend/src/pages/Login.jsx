import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import client, { setAuthToken } from "../api/apiClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if redirected with a message (e.g., session expired)
    if (location.state?.message) {
      setInfoMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setInfoMessage(""), 5000);
    }
  }, [location]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await client.post("/auth/login", { email, password });
      const { token, user } = res.data;
      sessionStorage.setItem("bms_token", token);
      sessionStorage.setItem("bms_user", JSON.stringify(user));
      setAuthToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="modern-login-page">
      {/* Left Side - Illustration */}
      <div className="login-left">
        {/* Decorative Lines */}
        <div className="deco-line line-1"></div>
        <div className="deco-line line-2"></div>
        <div className="deco-line line-3"></div>
        <div className="deco-line line-4"></div>
        
        <div className="left-content">
          <h1>Welcome to FinFlow</h1>
          <p>Your trusted digital banking partner</p>
          
          {/* Feature Highlights */}
          <div className="feature-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">🔒</span>
              <span>Secure & Safe</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">⚡</span>
              <span>Fast Transfers</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">📊</span>
              <span>Track Expenses</span>
            </div>
          </div>
          
          <div className="illustration">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
            <div className="banking-icon">💳</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && <div className="error-alert">{error}</div>}
          {infoMessage && <div className="info-alert">{infoMessage}</div>}

          <form onSubmit={handleLogin} className="modern-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="Enter your email" 
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="Enter your password" 
                required
              />
            </div>

            <button type="submit" className="modern-login-btn">
              Sign In
            </button>
          </form>

          <div className="form-footer">
            <p>Don't have an account? <a href="/register">Create Account</a></p>
            <a href="/" className="back-link">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
