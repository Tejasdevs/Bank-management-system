import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AnimatedBackground from "./components/AnimatedBackground";
import "./styles/style.css";
import "./styles/home.css";
import "./styles/sessionTimeout.css";

export default function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div>
      {isHomePage && <AnimatedBackground />}
      {!isHomePage && (
        <header className="site-header">
          <h1>FinFlow</h1>
        </header>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
