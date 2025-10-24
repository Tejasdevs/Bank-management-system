import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/apiClient";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await client.post("/auth/register", { name, email, password });
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <h1>Join FinFlow Today</h1>
          <p>Start your digital banking journey</p>
          
          {/* Feature Highlights */}
          <div className="feature-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">✨</span>
              <span>Easy Setup</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">💰</span>
              <span>Free Account</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🎯</span>
              <span>Smart Goals</span>
            </div>
          </div>
          
          <div className="illustration">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
            <div className="banking-icon">🎉</div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          {error && <div className="error-alert">{error}</div>}
          {success && <div className="success-alert">{success}</div>}

          <form onSubmit={handleRegister} className="modern-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="Enter your full name" 
                required
              />
            </div>

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
                placeholder="Create a password (min 6 characters)" 
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="modern-login-btn">
              Create Account
            </button>
          </form>

          <div className="form-footer">
            <p>Already have an account? <a href="/login">Sign In</a></p>
            <a href="/" className="back-link">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
