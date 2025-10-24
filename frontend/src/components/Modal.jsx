import React from "react";

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, details }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
          
          {details && (
            <div className="modal-details">
              {details.map((detail, index) => (
                <div key={index} className="detail-row">
                  <span className="detail-label">{detail.label}:</span>
                  <span className="detail-value">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuccessToast({ isOpen, message, onClose }) {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto-close after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="toast-container">
      <div className="toast toast-success">
        <div className="toast-icon">✅</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
}

export function ErrorToast({ isOpen, message, onClose }) {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto-close after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="toast-container">
      <div className="toast toast-error">
        <div className="toast-icon">❌</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
}
