import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sessionTimeout.css';

export default function SessionTimeout({ timeout = 900000 }) { // 15 minutes default (900000ms)
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds warning
  const navigate = useNavigate();
  
  let timeoutId = null;
  let warningTimeoutId = null;
  let countdownIntervalId = null;

  const logout = useCallback(() => {
    // Clear all timers
    if (timeoutId) clearTimeout(timeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    
    // Clear session
    sessionStorage.removeItem('bms_token');
    sessionStorage.removeItem('bms_user');
    
    // Redirect to login
    navigate('/login', { state: { message: 'Session expired due to inactivity' } });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutId) clearTimeout(timeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    
    // Hide warning if shown
    setShowWarning(false);
    setCountdown(60);
    
    // Set warning timer (14 minutes - 1 minute before logout)
    warningTimeoutId = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      
      // Start countdown
      countdownIntervalId = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeout - 60000); // Show warning 1 minute before logout
    
    // Set logout timer (15 minutes)
    timeoutId = setTimeout(() => {
      logout();
    }, timeout);
  }, [timeout, logout]);

  const handleStayLoggedIn = () => {
    resetTimer();
  };

  useEffect(() => {
    // Check if user is logged in
    const token = sessionStorage.getItem('bms_token');
    if (!token) return;

    // Events to track user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (countdownIntervalId) clearInterval(countdownIntervalId);
    };
  }, [resetTimer, showWarning]);

  if (!showWarning) return null;

  return (
    <div className="session-timeout-overlay">
      <div className="session-timeout-modal">
        <div className="timeout-icon">⏰</div>
        <h2>Session Expiring Soon</h2>
        <p className="timeout-message">
          Your session will expire in <span className="countdown">{countdown}</span> seconds due to inactivity.
        </p>
        <p className="timeout-submessage">
          Click "Stay Logged In" to continue your session.
        </p>
        <div className="timeout-actions">
          <button className="btn-stay" onClick={handleStayLoggedIn}>
            Stay Logged In
          </button>
          <button className="btn-logout" onClick={logout}>
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
