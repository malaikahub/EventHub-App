// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig"; // fixed import
import { signOut } from "firebase/auth";
import "./Navbar.css";

const Navbar = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole"); // get user role

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  // 🔓 Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);                   // Firebase sign out
      localStorage.removeItem("userRole");   // Remove saved role
      navigate("/login");                    // Redirect to login screen
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Try again.");
    }
  };

  return (
    <>
      {/* ---------------------- NAVBAR ---------------------- */}
      <header className="navbar fixed-navbar">
        {/* Hamburger menu */}
        <div className="menu-btn" onClick={toggleSidebar}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        {/* Logo */}
        <div className="logo">
          <img
            src="https://pakobserver.net/wp-content/uploads/2022/08/FJWU.jpg"
            alt="FJWU Logo"
          />
          <h1>FJWU Event Manager</h1>
        </div>

        {/* Right Icons */}
        <div className="nav-right">
          <div className="nav-icons">
            <Link to="/events">
              <span className="material-icons">home</span>
            </Link>

            {role === "manager" && (
              <Link to="/my-events">
                <span className="material-icons">event</span>
              </Link>
            )}

            <Link to="/settings">
              <span className="material-icons">settings</span>
            </Link>

            <span className="material-icons">notifications</span>

            {/* Logout Icon */}
            <button className="logout-btn" onClick={handleLogout}>
              <span className="material-icons">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------- SIDEBAR ---------------------- */}
      <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
        <h2 className="sidebar-logo">EVENT UI</h2>

        <ul className="menu">
          {/* Common Links */}
          <li className={location.pathname === "/events" ? "active" : ""}>
            <Link to="/events">All Events</Link>
          </li>
          <li className={location.pathname === "/search" ? "active" : ""}>
            <Link to="/search">Search</Link>
          </li>

          {/* Student Links */}
          {role === "student" && (
            <>
              <li className={location.pathname === "/my-registrations" ? "active" : ""}>
                <Link to="/my-registrations">My Registrations</Link>
              </li>
              <li className={location.pathname === "/profile" ? "active" : ""}>
                <Link to="/profile">Profile</Link>
              </li>
              <li className={location.pathname === "/settings" ? "active" : ""}>
                <Link to="/settings">Settings</Link>
              </li>
            </>
          )}

          {/* Manager Links */}
          {role === "manager" && (
            <>
              <li className={location.pathname === "/create-event" ? "active" : ""}>
                <Link to="/create-event">Create Event</Link>
              </li>
              <li className={location.pathname === "/analytics" ? "active" : ""}>
                <Link to="/analytics">Analytics</Link>
              </li>
              <li className={location.pathname === "/my-events" ? "active" : ""}>
                <Link to="/my-events">My Events</Link>
              </li>
              <li className={location.pathname === "/profile" ? "active" : ""}>
                <Link to="/profile">Profile</Link>
              </li>
              <li className={location.pathname === "/settings" ? "active" : ""}>
                <Link to="/settings">Settings</Link>
              </li>
            </>
          )}

          {/* Logout Button in Sidebar */}
          <li>
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Overlay when sidebar is open */}
      {sidebarActive && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Navbar;
