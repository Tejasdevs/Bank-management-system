import React, { useState, useEffect } from "react";
import "../styles/darkmode.css";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode was previously enabled
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setIsDark(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    
    if (newMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  };

  return (
    <button className="dark-mode-toggle" onClick={toggleDarkMode} title={isDark ? "Light Mode" : "Dark Mode"}>
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
