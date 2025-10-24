import React, { useState, useEffect, useRef } from "react";
import client from "../api/apiClient";
import "../styles/notifications.css";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    
    // Auto-refresh notifications every 5 seconds for instant alerts
    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);
    
    // Listen for custom event when transaction happens
    const handleTransactionEvent = () => {
      console.log('Transaction event received, refreshing notifications...');
      loadNotifications();
    };
    
    window.addEventListener('transactionCompleted', handleTransactionEvent);
    
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      window.removeEventListener('transactionCompleted', handleTransactionEvent);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // Get recent transactions to generate notifications
      const accountsRes = await client.get("/accounts/user");
      const accounts = accountsRes.data;
      
      if (accounts.length === 0) return;
      
      const currentAccount = accounts[0];
      const currentBalance = parseFloat(currentAccount.balance);
      
      console.log('Current Balance:', currentBalance);
      console.log('Checking alerts...');
      
      // Get transactions from first account
      const txnRes = await client.get(`/accounts/${currentAccount.id}/transactions`);
      const transactions = txnRes.data;
      
      // Generate notifications from recent transactions (last 10)
      const recentTxns = transactions.slice(0, 10);
      const notifs = recentTxns.map(txn => {
        const isCredit = txn.type === 'deposit' || 
                        (txn.type === 'transfer' && txn.toAccountId === currentAccount.id);
        
        return {
          id: txn.id,
          type: txn.type,
          amount: txn.amount,
          isCredit: isCredit,
          message: generateNotificationMessage(txn, isCredit),
          time: new Date(txn.createdAt),
          read: false
        };
      });
      
      // Add low balance alert if balance is below 1000
      if (currentBalance < 1000 && currentBalance > 0) {
        console.log('LOW BALANCE ALERT TRIGGERED!');
        notifs.unshift({
          id: 'low-balance-alert',
          type: 'alert',
          amount: currentBalance,
          isCredit: false,
          message: `⚠️ Low Balance Alert! Your account balance is ₹${currentBalance.toLocaleString('en-IN')}`,
          time: new Date(),
          read: false,
          isAlert: true
        });
      }
      
      // Add zero balance alert
      if (currentBalance === 0) {
        console.log('ZERO BALANCE ALERT TRIGGERED!');
        notifs.unshift({
          id: 'zero-balance-alert',
          type: 'alert',
          amount: 0,
          isCredit: false,
          message: `🚨 Your account balance is ₹0. Please add funds!`,
          time: new Date(),
          read: false,
          isAlert: true
        });
      }
      
      console.log('Total notifications:', notifs.length);
      
      // Check if user cleared notifications recently (within last 5 minutes)
      const clearedAt = localStorage.getItem('notifications_cleared_at');
      if (clearedAt) {
        const clearedTime = parseInt(clearedAt);
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - clearedTime;
        
        // If cleared within last 5 minutes, filter out old notifications
        if (timeDiff < 5 * 60 * 1000) {
          const filteredNotifs = notifs.filter(n => {
            const notifTime = new Date(n.time).getTime();
            return notifTime > clearedTime;
          });
          setNotifications(filteredNotifs);
          setUnreadCount(filteredNotifs.filter(n => !n.read).length);
          return;
        }
      }
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const generateNotificationMessage = (txn, isCredit) => {
    const amount = `₹${parseFloat(txn.amount).toLocaleString('en-IN')}`;
    
    if (txn.type === 'deposit') {
      return `${amount} credited to your account`;
    } else if (txn.type === 'withdraw') {
      return `${amount} debited from your account`;
    } else if (txn.type === 'transfer') {
      return isCredit 
        ? `${amount} received via transfer`
        : `${amount} transferred successfully`;
    }
    return `Transaction of ${amount}`;
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
      setTimeout(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }, 1000);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    
    // Save cleared state in localStorage with timestamp
    const clearedTime = new Date().getTime();
    localStorage.setItem('notifications_cleared_at', clearedTime);
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="notification-bell-btn" onClick={toggleDropdown}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button className="clear-all-btn" onClick={clearAll}>
                Clear All
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notif-icon">🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''} ${notif.isAlert ? 'alert-item' : ''}`}
                >
                  <div className="notif-icon-wrapper">
                    <span className={`notif-icon ${notif.isAlert ? 'alert' : notif.isCredit ? 'credit' : 'debit'}`}>
                      {notif.isAlert ? '⚠️' : notif.isCredit ? '💰' : '💸'}
                    </span>
                  </div>
                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">{getTimeAgo(notif.time)}</span>
                  </div>
                  {!notif.read && <span className="unread-dot"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
