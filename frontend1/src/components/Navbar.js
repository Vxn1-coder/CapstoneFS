import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeChatId");
    navigate("/login");
  };

  return (
    <nav style={{ padding: "16px", borderBottom: "1px solid #ddd" }}>
      <Link to="/dashboard" style={{ marginRight: "12px" }}>Dashboard</Link>
      <Link to="/items" style={{ marginRight: "12px" }}>Items</Link>
      <Link to="/create-item" style={{ marginRight: "12px" }}>Create Item</Link>
      <Link to="/chat" style={{ marginRight: "12px" }}>Chat</Link>

      {token && (
        <button onClick={handleLogout} style={{ marginLeft: "12px" }}>
          Logout
        </button>
      )}
    </nav>
  );
}

export default Navbar;
