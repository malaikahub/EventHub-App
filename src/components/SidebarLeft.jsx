import React from "react";
import { Link } from "react-router-dom";

export default function SidebarLeft({ role }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      <li className="menu-item"><Link to="/events">📅 All Events</Link></li>
      <li className="menu-item"><Link to="/search">🔍 Search Events</Link></li>
      <li className="menu-item"><Link to="/my-registrations">📝 My Registrations</Link></li>
      <li className="menu-item"><Link to="/my-saved-events">🔖 Saved Events</Link></li>
      <li className="menu-item"><Link to="/profile">👤 Profile</Link></li>
      <li className="menu-item"><Link to="/settings">⚙ Settings</Link></li>
      {role === "manager" && (
        <li className="menu-item"><Link to="/analytics">📊 Event Analytics</Link></li>
      )}
      {role === "manager" && (
        <li className="menu-item"><Link to="/create-event">➕ Create Event</Link></li>
      )}
    </ul>
  );
}

