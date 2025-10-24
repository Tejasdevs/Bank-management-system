// Utility functions for session storage
// Use sessionStorage for auth data so each tab has independent sessions
// Use localStorage for user data (budgets, goals, etc.) so it persists

export const getAuthToken = () => {
  return sessionStorage.getItem("bms_token");
};

export const setAuthToken = (token) => {
  sessionStorage.setItem("bms_token", token);
};

export const getUser = () => {
  const userData = sessionStorage.getItem("bms_user");
  return userData ? JSON.parse(userData) : null;
};

export const setUser = (user) => {
  sessionStorage.setItem("bms_user", JSON.stringify(user));
};

export const clearAuth = () => {
  sessionStorage.removeItem("bms_token");
  sessionStorage.removeItem("bms_user");
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
