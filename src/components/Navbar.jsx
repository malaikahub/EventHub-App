import React from "react";
import "./Navbar.css";
import { FaUserCircle, FaBookmark, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../firebase/auth";

export default function Navbar({ setSearchQuery }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await logoutUser();
    if (res?.success) {
      navigate("/login");
    }
  };
  
  return (
    <nav className="navbar">
      <div className="nav-left">
        <a href="/events" className="logo">FJWU Events</a>
      </div>

      <div className="nav-center">
        <div className="search-container">
          <input
            type="text"
            className="search-input center"
            placeholder="Search events..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="nav-right">
        <FaSearch className="nav-icon" />
        <FaBookmark className="nav-icon" />
        <FaUserCircle className="nav-icon" />
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
