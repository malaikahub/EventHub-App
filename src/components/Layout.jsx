import React from "react";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import "./Layout.css";

export default function Layout({ children, role }) {
  return (
    <div className="layout">
      <aside className="sidebar-left">
        <SidebarLeft role={role} />
      </aside>

      <main className="feed">
        {children}
      </main>

      <aside className="sidebar-right">
        <SidebarRight />
      </aside>
    </div>
  );
}

