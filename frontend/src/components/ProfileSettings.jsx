import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import client from "../api/apiClient";
import { ConfirmModal, SuccessToast, ErrorToast } from "./Modal";
import "../styles/profile.css";

export default function ProfileSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  // Edit profile states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    loadUser();

    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadUser = () => {
    const userData = sessionStorage.getItem("bms_user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditName(parsedUser.name);
      setEditEmail(parsedUser.email);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
    setIsOpen(false);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setIsOpen(false);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await client.put("/auth/profile", {
        name: editName,
        email: editEmail,
      });

      // Update sessionStorage
      const updatedUser = { ...user, name: editName, email: editEmail };
      sessionStorage.setItem("bms_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setShowEditModal(false);
      setToastMessage("Profile updated successfully!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setToastMessage(error.response?.data?.message || "Failed to update profile");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const handleSavePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToastMessage("Please fill all password fields");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setToastMessage("New passwords do not match");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    if (newPassword.length < 6) {
      setToastMessage("Password must be at least 6 characters");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    try {
      await client.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setToastMessage("Password changed successfully!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setToastMessage(error.response?.data?.message || "Failed to change password");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="profile-settings-container" ref={dropdownRef}>
        <button className="profile-btn" onClick={toggleDropdown}>
          <div className="profile-avatar">⚙️</div>
        </button>

        {isOpen && (
          <div className="profile-dropdown">
            <div className="profile-dropdown-header">
              <div className="profile-avatar-large">{getInitials(user?.name)}</div>
              <div className="profile-info">
                <h4>{user?.name}</h4>
                <p>{user?.email}</p>
              </div>
            </div>

            <div className="profile-menu">
              <button className="profile-menu-item" onClick={handleEditProfile}>
                <span className="menu-icon">✏️</span>
                <span>Edit Profile</span>
              </button>
              <button className="profile-menu-item" onClick={handleChangePassword}>
                <span className="menu-icon">🔒</span>
                <span>Change Password</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Profile</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Change Password Modal */}
      {showPasswordModal && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔒 Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSavePassword}>
                Change Password
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Success Toast */}
      <SuccessToast
        isOpen={showSuccessToast}
        message={toastMessage}
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Error Toast */}
      <ErrorToast
        isOpen={showErrorToast}
        message={toastMessage}
        onClose={() => setShowErrorToast(false)}
      />
    </>
  );
}
